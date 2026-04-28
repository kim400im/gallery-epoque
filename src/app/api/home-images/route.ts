import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { HomeImageRecord, getHomeImages } from '@/lib/pocketbase-data'
import { savePocketBaseUpload } from '@/lib/uploads'

export async function GET() {
  try {
    const homeImages = await getHomeImages(false)
    return NextResponse.json(homeImages.map((image) => ({
      id: image.id,
      title: image.title || 'Gallery Epoque',
      subtitle: image.subtitle || 'Art & Culture',
      imageUrl: image.imageUrl,
    })))
  } catch (error) {
    console.error('Failed to fetch home images:', error)
    return NextResponse.json({ error: 'Failed to fetch home images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const image = formData.get('image') as File | null
    if (!image || image.size === 0) return NextResponse.json({ error: 'Image is required' }, { status: 400 })

    const allImages = await getHomeImages(true)
    const homeImage = await createRecord<HomeImageRecord>('home_images', {
      title: String(formData.get('title') || ''),
      subtitle: String(formData.get('subtitle') || ''),
      displayOrder: Math.max(-1, ...allImages.map((item) => item.displayOrder)) + 1,
      isActive: true,
      legacyImageUrl: await savePocketBaseUpload(image, 'home', token),
    }, token)

    return NextResponse.json((await getHomeImages(true)).find((item) => item.id === homeImage.id) || homeImage, { status: 201 })
  } catch (error) {
    console.error('Failed to create home image:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create home image' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const id = String(formData.get('id') || '')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const image = formData.get('image') as File | null
    const body: Record<string, unknown> = {
      title: String(formData.get('title') || ''),
      subtitle: String(formData.get('subtitle') || ''),
    }
    if (formData.has('displayOrder')) body.displayOrder = Number(formData.get('displayOrder'))
    if (formData.has('isActive')) body.isActive = String(formData.get('isActive')) === 'true'
    if (image && image.size > 0) body.legacyImageUrl = await savePocketBaseUpload(image, 'home', token)

    await updateRecord<HomeImageRecord>('home_images', id, body, token)
    return NextResponse.json((await getHomeImages(true)).find((item) => item.id === id))
  } catch (error) {
    console.error('Failed to update home image:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update home image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Home image ID is required' }, { status: 400 })

    await deleteRecord('home_images', id, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete home image:', error)
    return NextResponse.json({ error: 'Failed to delete home image' }, { status: 500 })
  }
}
