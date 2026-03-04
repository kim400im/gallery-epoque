import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// YYYY-MM-DD 문자열을 UTC 정오 Date로 변환 (시간대 문제 방지)
function parseToUTCNoon(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
}

// 날짜 범위에서 개별 날짜 배열 생성 (YYYY-MM-DD 문자열 기반)
function getDatesBetweenStrings(startDateStr: string, endDateStr: string): Date[] {
  const dates: Date[] = []
  
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
  
  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12, 0, 0, 0))
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 12, 0, 0, 0))
  
  while (current <= end) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

// 전시 기간에 해당하는 UnavailableDate 레코드 생성 (문자열 날짜 사용)
async function createUnavailableDates(exhibitionId: string, title: string, startDateStr: string, endDateStr: string) {
  const dates = getDatesBetweenStrings(startDateStr, endDateStr)
  
  for (const date of dates) {
    // upsert를 사용하여 중복 방지
    await prisma.unavailableDate.upsert({
      where: { date },
      update: {
        reason: `전시: ${title}`,
        type: 'exhibition',
        exhibitionId
      },
      create: {
        date,
        reason: `전시: ${title}`,
        type: 'exhibition',
        exhibitionId
      }
    })
  }
}

// 전시 관련 UnavailableDate 레코드 삭제
async function deleteUnavailableDates(exhibitionId: string) {
  await prisma.unavailableDate.deleteMany({
    where: { exhibitionId }
  })
}

// API Route용 Supabase 클라이언트 생성
function createSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // API Route에서는 쿠키 설정 불필요
        },
      },
    }
  )
}

// GET: 전시회 목록 조회
export async function GET() {
  try {
    const exhibitions = await prisma.exhibition.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })
    return NextResponse.json(exhibitions)
  } catch (error) {
    console.error('Failed to fetch exhibitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exhibitions' },
      { status: 500 }
    )
  }
}

// 이미지 업로드 헬퍼 함수
async function uploadImage(supabase: ReturnType<typeof createSupabaseClient>, image: File, folder: string): Promise<string> {
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileExt = image.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, buffer, {
      contentType: image.type,
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath)

  return publicUrl
}

// POST: 전시회 등록
export async function POST(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const image = formData.get('image') as File
    const artistIdsJson = formData.get('artistIds') as string | null
    const additionalImages = formData.getAll('additionalImages') as File[]

    const artistIds: string[] = artistIdsJson ? JSON.parse(artistIdsJson) : []

    if (!title || !image || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, dates, and image are required' },
        { status: 400 }
      )
    }

    const imageUrl = await uploadImage(supabase, image, 'exhibitions')

    const exhibition = await prisma.exhibition.create({
      data: {
        title,
        description: description?.trim() || null,
        imageUrl,
        startDate: parseToUTCNoon(startDate),
        endDate: parseToUTCNoon(endDate),
        artists: {
          create: artistIds.map(artistId => ({
            artistId
          }))
        }
      }
    })

    // 추가 이미지 업로드 및 저장
    if (additionalImages && additionalImages.length > 0) {
      const validImages = additionalImages.filter(img => img && img.size > 0)
      
      for (let i = 0; i < validImages.length; i++) {
        const additionalImageUrl = await uploadImage(supabase, validImages[i], 'exhibitions')
        await prisma.exhibitionImage.create({
          data: {
            imageUrl: additionalImageUrl,
            displayOrder: i,
            exhibitionId: exhibition.id
          }
        })
      }
    }

    // 전시 기간에 해당하는 예약 불가 날짜 생성 (문자열로 전달)
    await createUnavailableDates(
      exhibition.id,
      title,
      startDate,
      endDate
    )

    // 전시회와 관련 데이터 함께 조회
    const exhibitionWithRelations = await prisma.exhibition.findUnique({
      where: { id: exhibition.id },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(exhibitionWithRelations, { status: 201 })
  } catch (error) {
    console.error('Failed to create exhibition:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create exhibition' },
      { status: 500 }
    )
  }
}

// PUT: 전시회 수정
export async function PUT(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const image = formData.get('image') as File | null
    const artistIdsJson = formData.get('artistIds') as string | null
    const additionalImages = formData.getAll('additionalImages') as File[]
    const deleteImageIds = formData.get('deleteImageIds') as string | null

    const artistIds: string[] = artistIdsJson ? JSON.parse(artistIdsJson) : []

    if (!id || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'ID, title, and dates are required' },
        { status: 400 }
      )
    }

    let imageUrl: string | undefined

    // 새 대표 이미지가 업로드된 경우
    if (image && image.size > 0) {
      imageUrl = await uploadImage(supabase, image, 'exhibitions')
    }

    // 삭제할 추가 이미지 처리
    if (deleteImageIds) {
      const idsToDelete = JSON.parse(deleteImageIds) as string[]
      if (idsToDelete.length > 0) {
        await prisma.exhibitionImage.deleteMany({
          where: {
            id: { in: idsToDelete },
            exhibitionId: id
          }
        })
      }
    }

    // 기존 작가 관계 삭제 후 새로 생성
    await prisma.exhibitionArtist.deleteMany({
      where: { exhibitionId: id }
    })

    const exhibition = await prisma.exhibition.update({
      where: { id },
      data: {
        title,
        description: description?.trim() || null,
        startDate: parseToUTCNoon(startDate),
        endDate: parseToUTCNoon(endDate),
        ...(imageUrl && { imageUrl }),
        artists: {
          create: artistIds.map(artistId => ({
            artistId
          }))
        }
      }
    })

    // 새 추가 이미지 업로드
    if (additionalImages && additionalImages.length > 0) {
      const validImages = additionalImages.filter(img => img && img.size > 0)
      
      // 기존 이미지의 최대 displayOrder 가져오기
      const existingImages = await prisma.exhibitionImage.findMany({
        where: { exhibitionId: id },
        orderBy: { displayOrder: 'desc' },
        take: 1
      })
      const maxOrder = existingImages.length > 0 ? existingImages[0].displayOrder : -1

      for (let i = 0; i < validImages.length; i++) {
        const additionalImageUrl = await uploadImage(supabase, validImages[i], 'exhibitions')
        await prisma.exhibitionImage.create({
          data: {
            imageUrl: additionalImageUrl,
            displayOrder: maxOrder + 1 + i,
            exhibitionId: id
          }
        })
      }
    }

    // 기존 예약 불가 날짜 삭제 후 새로 생성 (날짜가 변경될 수 있으므로)
    await deleteUnavailableDates(id)
    await createUnavailableDates(
      id,
      title,
      startDate,
      endDate
    )

    // 전시회와 관련 데이터 함께 조회
    const exhibitionWithRelations = await prisma.exhibition.findUnique({
      where: { id: exhibition.id },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(exhibitionWithRelations)
  } catch (error) {
    console.error('Failed to update exhibition:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update exhibition' },
      { status: 500 }
    )
  }
}

// DELETE: 전시회 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Exhibition ID is required' },
        { status: 400 }
      )
    }

    // 전시 관련 예약 불가 날짜 먼저 삭제
    await deleteUnavailableDates(id)

    await prisma.exhibition.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete exhibition:', error)
    return NextResponse.json(
      { error: 'Failed to delete exhibition' },
      { status: 500 }
    )
  }
}
