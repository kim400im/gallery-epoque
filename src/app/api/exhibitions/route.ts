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
      orderBy: { createdAt: 'desc' }
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

    if (!title || !image || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, dates, and image are required' },
        { status: 400 }
      )
    }

    // File을 ArrayBuffer로 변환
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 이미지를 Supabase Storage에 업로드
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `exhibitions/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, buffer, {
        contentType: image.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 이미지 public URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath)

    // DB에 전시회 저장
    const exhibition = await prisma.exhibition.create({
      data: {
        title,
        imageUrl: publicUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    return NextResponse.json(exhibition, { status: 201 })
  } catch (error) {
    console.error('Failed to create exhibition:', error)
    return NextResponse.json(
      { error: 'Failed to create exhibition' },
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

    if (!id || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'ID, title, and dates are required' },
        { status: 400 }
      )
    }

    let imageUrl: string | undefined

    // 새 이미지가 업로드된 경우
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `exhibitions/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, buffer, {
          contentType: image.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)
      
      imageUrl = publicUrl
    }

    // DB 업데이트
    const exhibition = await prisma.exhibition.update({
      where: { id },
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(imageUrl && { imageUrl })
      }
    })

    return NextResponse.json(exhibition)
  } catch (error) {
    console.error('Failed to update exhibition:', error)
    return NextResponse.json(
      { error: 'Failed to update exhibition' },
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
