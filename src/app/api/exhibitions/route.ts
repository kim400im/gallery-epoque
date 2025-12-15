import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

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
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const image = formData.get('image') as File
    const artistIdsJson = formData.get('artistIds') as string | null
    const additionalImages = formData.getAll('additionalImages') as File[]

    // 작가 ID 배열 파싱
    const artistIds: string[] = artistIdsJson ? JSON.parse(artistIdsJson) : []

    if (!title || !image || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, dates, and image are required' },
        { status: 400 }
      )
    }

    // 대표 이미지 업로드
    const imageUrl = await uploadImage(supabase, image, 'exhibitions')

    // DB에 전시회 저장 (작가 관계 포함)
    const exhibition = await prisma.exhibition.create({
      data: {
        title,
        imageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const image = formData.get('image') as File | null
    const artistIdsJson = formData.get('artistIds') as string | null
    const additionalImages = formData.getAll('additionalImages') as File[]
    const deleteImageIds = formData.get('deleteImageIds') as string | null

    // 작가 ID 배열 파싱
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

    // DB 업데이트
    const exhibition = await prisma.exhibition.update({
      where: { id },
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
