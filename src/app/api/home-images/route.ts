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

// GET: 홈 이미지 목록 조회 (활성화된 이미지만)
export async function GET() {
  try {
    const homeImages = await prisma.homeImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })

    // 슬라이드 데이터 형식으로 변환
    const slides = homeImages.map((image: { id: string; title: string | null; subtitle: string | null; imageUrl: string }) => ({
      id: image.id,
      title: image.title || 'Gallery Époque',
      subtitle: image.subtitle || 'Art & Culture',
      imageUrl: image.imageUrl,
    }))

    return NextResponse.json(slides)
  } catch (error) {
    console.error('Failed to fetch home images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home images' },
      { status: 500 }
    )
  }
}

// 이미지 업로드 헬퍼 함수
async function uploadImage(supabase: ReturnType<typeof createSupabaseClient>, image: File): Promise<string> {
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileExt = image.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `home/${fileName}`

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

// POST: 홈 이미지 등록
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
    const image = formData.get('image') as File
    const title = formData.get('title') as string | null
    const subtitle = formData.get('subtitle') as string | null

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    // 이미지 업로드
    const imageUrl = await uploadImage(supabase, image)

    // 현재 가장 큰 displayOrder 가져오기
    const lastImage = await prisma.homeImage.findFirst({
      orderBy: { displayOrder: 'desc' }
    })
    const nextOrder = (lastImage?.displayOrder ?? -1) + 1

    // DB에 저장
    const homeImage = await prisma.homeImage.create({
      data: {
        imageUrl,
        title,
        subtitle,
        displayOrder: nextOrder,
        isActive: true
      }
    })

    return NextResponse.json(homeImage, { status: 201 })
  } catch (error) {
    console.error('Failed to create home image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create home image' },
      { status: 500 }
    )
  }
}

// PUT: 홈 이미지 수정
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
    const title = formData.get('title') as string | null
    const subtitle = formData.get('subtitle') as string | null
    const displayOrder = formData.get('displayOrder') as string | null
    const isActive = formData.get('isActive') as string | null
    const image = formData.get('image') as File | null

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    let imageUrl: string | undefined

    // 새 이미지가 업로드된 경우
    if (image && image.size > 0) {
      imageUrl = await uploadImage(supabase, image)
    }

    // DB 업데이트
    const homeImage = await prisma.homeImage.update({
      where: { id },
      data: {
        ...(title !== null && { title }),
        ...(subtitle !== null && { subtitle }),
        ...(displayOrder !== null && { displayOrder: parseInt(displayOrder) }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(imageUrl && { imageUrl })
      }
    })

    return NextResponse.json(homeImage)
  } catch (error) {
    console.error('Failed to update home image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update home image' },
      { status: 500 }
    )
  }
}

// DELETE: 홈 이미지 삭제
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
        { error: 'Home image ID is required' },
        { status: 400 }
      )
    }

    await prisma.homeImage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete home image:', error)
    return NextResponse.json(
      { error: 'Failed to delete home image' },
      { status: 500 }
    )
  }
}
