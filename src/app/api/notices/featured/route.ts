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

export async function GET() {
  try {
    const notice = await prisma.notice.findFirst({
      where: { isFeatured: true },
      select: { id: true, title: true },
    })
    return NextResponse.json(notice ?? null)
  } catch (error) {
    console.error('Failed to fetch featured notice:', error)
    return NextResponse.json({ error: 'Failed to fetch featured notice' }, { status: 500 })
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

    const { id } = await request.json() as { id: string }
    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.notice.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } }),
      prisma.notice.update({ where: { id }, data: { isFeatured: true } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to set featured notice:', error)
    return NextResponse.json({ error: 'Failed to set featured notice' }, { status: 500 })
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

    await prisma.notice.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unset featured notice:', error)
    return NextResponse.json({ error: 'Failed to unset featured notice' }, { status: 500 })
  }
}
