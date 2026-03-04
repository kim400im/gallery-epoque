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

// GET: 작가 목록 조회
export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: 'asc' },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })
    return NextResponse.json(artists)
  } catch (error) {
    console.error('Failed to fetch artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}

// POST: 작가 등록
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
    const name = formData.get('name') as string
    const biography = formData.get('biography') as string | null
    const introduction = formData.get('introduction') as string | null
    const images = formData.getAll('images') as File[]

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    // 작가 생성
    const artist = await prisma.artist.create({
      data: {
        name: name.trim(),
        biography: biography?.trim() || null,
        introduction: introduction?.trim() || null
      }
    })

    // 이미지 업로드 및 저장
    if (images && images.length > 0) {
      const validImages = images.filter(img => img && img.size > 0)
      
      for (let i = 0; i < validImages.length; i++) {
        const imageUrl = await uploadImage(supabase, validImages[i], 'artists')
        await prisma.artistImage.create({
          data: {
            imageUrl,
            displayOrder: i,
            artistId: artist.id
          }
        })
      }
    }

    // 이미지 포함하여 반환
    const artistWithImages = await prisma.artist.findUnique({
      where: { id: artist.id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(artistWithImages, { status: 201 })
  } catch (error) {
    console.error('Failed to create artist:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create artist' },
      { status: 500 }
    )
  }
}

// PUT: 작가 수정
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
    const name = formData.get('name') as string
    const biography = formData.get('biography') as string | null
    const introduction = formData.get('introduction') as string | null
    const images = formData.getAll('images') as File[]
    const deleteImageIds = formData.get('deleteImageIds') as string | null

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: 'Artist ID and name are required' },
        { status: 400 }
      )
    }

    // 삭제할 이미지 처리
    if (deleteImageIds) {
      const idsToDelete = JSON.parse(deleteImageIds) as string[]
      if (idsToDelete.length > 0) {
        await prisma.artistImage.deleteMany({
          where: {
            id: { in: idsToDelete },
            artistId: id
          }
        })
      }
    }

    // 작가 정보 업데이트
    await prisma.artist.update({
      where: { id },
      data: { 
        name: name.trim(),
        biography: biography?.trim() || null,
        introduction: introduction?.trim() || null
      }
    })

    // 새 이미지 업로드
    if (images && images.length > 0) {
      const validImages = images.filter(img => img && img.size > 0)
      
      // 기존 이미지의 최대 displayOrder 가져오기
      const existingImages = await prisma.artistImage.findMany({
        where: { artistId: id },
        orderBy: { displayOrder: 'desc' },
        take: 1
      })
      const maxOrder = existingImages.length > 0 ? existingImages[0].displayOrder : -1

      for (let i = 0; i < validImages.length; i++) {
        const imageUrl = await uploadImage(supabase, validImages[i], 'artists')
        await prisma.artistImage.create({
          data: {
            imageUrl,
            displayOrder: maxOrder + 1 + i,
            artistId: id
          }
        })
      }
    }

    // 이미지 포함하여 반환
    const artistWithImages = await prisma.artist.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(artistWithImages)
  } catch (error) {
    console.error('Failed to update artist:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update artist' },
      { status: 500 }
    )
  }
}

// DELETE: 작가 삭제
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
        { error: 'Artist ID is required' },
        { status: 400 }
      )
    }

    await prisma.artist.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete artist:', error)
    return NextResponse.json(
      { error: 'Failed to delete artist' },
      { status: 500 }
    )
  }
}
