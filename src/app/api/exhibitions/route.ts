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

// POST: 전시회 등록
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, startDate, endDate, imageUrl, artistIds = [], additionalImages = [] } = body as {
      title: string
      description: string | null
      startDate: string
      endDate: string
      imageUrl: string
      artistIds: string[]
      additionalImages: { url: string; description: string }[]
    }

    if (!title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, dates, and image are required' },
        { status: 400 }
      )
    }

    const exhibition = await prisma.exhibition.create({
      data: {
        title,
        description: description?.trim() || null,
        imageUrl,
        startDate: parseToUTCNoon(startDate),
        endDate: parseToUTCNoon(endDate),
        artists: {
          create: artistIds.map((artistId: string) => ({
            artistId
          }))
        }
      }
    })

    if (additionalImages.length > 0) {
      for (let i = 0; i < additionalImages.length; i++) {
        await prisma.exhibitionImage.create({
          data: {
            imageUrl: additionalImages[i].url,
            description: additionalImages[i].description?.trim() || null,
            displayOrder: i,
            exhibitionId: exhibition.id
          }
        })
      }
    }

    await createUnavailableDates(
      exhibition.id,
      title,
      startDate,
      endDate
    )

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

    const body = await request.json()
    const {
      id,
      title,
      description,
      startDate,
      endDate,
      imageUrl,
      artistIds = [],
      additionalImages = [],
      deleteImageIds = [],
      existingImageDescriptions = {},
      existingImageOrder = [],
      newImageStartOrder = 0,
    } = body as {
      id: string
      title: string
      description: string | null
      startDate: string
      endDate: string
      imageUrl?: string
      artistIds: string[]
      additionalImages: { url: string; description: string }[]
      deleteImageIds: string[]
      existingImageDescriptions: Record<string, string>
      existingImageOrder: { id: string; displayOrder: number }[]
      newImageStartOrder: number
    }

    if (!id || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'ID, title, and dates are required' },
        { status: 400 }
      )
    }

    if (deleteImageIds.length > 0) {
      await prisma.exhibitionImage.deleteMany({
        where: {
          id: { in: deleteImageIds },
          exhibitionId: id
        }
      })
    }

    for (const orderItem of existingImageOrder) {
      await prisma.exhibitionImage.update({
        where: { id: orderItem.id },
        data: {
          displayOrder: orderItem.displayOrder,
          description: (existingImageDescriptions[orderItem.id])?.trim() || null,
        }
      })
    }

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
          create: artistIds.map((artistId: string) => ({
            artistId
          }))
        }
      }
    })

    if (additionalImages.length > 0) {
      for (let i = 0; i < additionalImages.length; i++) {
        await prisma.exhibitionImage.create({
          data: {
            imageUrl: additionalImages[i].url,
            description: additionalImages[i].description?.trim() || null,
            displayOrder: newImageStartOrder + i,
            exhibitionId: id
          }
        })
      }
    }

    await deleteUnavailableDates(id)
    await createUnavailableDates(
      id,
      title,
      startDate,
      endDate
    )

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
