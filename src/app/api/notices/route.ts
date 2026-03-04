import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

function createSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )
}

async function uploadFile(
  supabase: ReturnType<typeof createSupabaseClient>,
  file: File
): Promise<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const ext = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const filePath = `notices/${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`파일 업로드 실패: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('gallery').getPublicUrl(filePath)

  return {
    fileUrl: publicUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = 10
    const skip = (page - 1) * limit

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          attachments: true,
        },
      }),
      prisma.notice.count(),
    ])

    return NextResponse.json({
      notices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch notices:', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const files = formData.getAll('attachments') as File[]

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '제목과 본문은 필수입니다.' }, { status: 400 })
    }

    const validFiles = files.filter((f) => f && f.size > 0)
    const uploadedAttachments = await Promise.all(
      validFiles.map((f) => uploadFile(supabase, f))
    )

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        attachments: {
          create: uploadedAttachments,
        },
      },
      include: { attachments: true },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Failed to create notice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create notice' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const files = formData.getAll('attachments') as File[]
    const deleteAttachmentIds = formData.get('deleteAttachmentIds') as string | null

    if (!id || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'id, 제목, 본문은 필수입니다.' }, { status: 400 })
    }

    if (deleteAttachmentIds) {
      const ids = JSON.parse(deleteAttachmentIds) as string[]
      if (ids.length > 0) {
        await prisma.noticeAttachment.deleteMany({
          where: { id: { in: ids }, noticeId: id },
        })
      }
    }

    const validFiles = files.filter((f) => f && f.size > 0)
    const uploadedAttachments = await Promise.all(
      validFiles.map((f) => uploadFile(supabase, f))
    )

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        title,
        content,
        attachments: {
          create: uploadedAttachments,
        },
      },
      include: { attachments: true },
    })

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Failed to update notice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notice' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })
    }

    await prisma.notice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notice:', error)
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}
