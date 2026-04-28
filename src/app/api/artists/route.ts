import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { ArtistImageRecord, ArtistRecord, getArtist, getArtists } from '@/lib/pocketbase-data'
import { savePocketBaseUpload } from '@/lib/uploads'

export async function GET() {
  try {
    return NextResponse.json(await getArtists())
  } catch (error) {
    console.error('Failed to fetch artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const name = String(formData.get('name') || '').trim()
    const biography = String(formData.get('biography') || '').trim()
    const introduction = String(formData.get('introduction') || '').trim()
    const images = formData.getAll('images') as File[]

    if (!name) return NextResponse.json({ error: 'Artist name is required' }, { status: 400 })

    const artist = await createRecord<ArtistRecord>('artists', { name, biography, introduction }, token)
    const validImages = images.filter((image) => image && image.size > 0)
    for (let i = 0; i < validImages.length; i++) {
      await createRecord<ArtistImageRecord>('artist_images', {
        artist: artist.id,
        displayOrder: i,
        legacyImageUrl: await savePocketBaseUpload(validImages[i], 'artists', token),
      }, token)
    }

    return NextResponse.json(await getArtist(artist.id), { status: 201 })
  } catch (error) {
    console.error('Failed to create artist:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create artist' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const id = String(formData.get('id') || '')
    const name = String(formData.get('name') || '').trim()
    const biography = String(formData.get('biography') || '').trim()
    const introduction = String(formData.get('introduction') || '').trim()
    const images = formData.getAll('images') as File[]
    const deleteImageIds = formData.get('deleteImageIds')

    if (!id || !name) return NextResponse.json({ error: 'Artist ID and name are required' }, { status: 400 })

    if (deleteImageIds) {
      for (const imageId of JSON.parse(String(deleteImageIds)) as string[]) {
        await deleteRecord('artist_images', imageId, token)
      }
    }

    await updateRecord<ArtistRecord>('artists', id, { name, biography, introduction }, token)
    const current = await getArtist(id)
    const validImages = images.filter((image) => image && image.size > 0)
    const maxOrder = Math.max(-1, ...(current.images || []).map((image: { displayOrder: number }) => image.displayOrder))

    for (let i = 0; i < validImages.length; i++) {
      await createRecord<ArtistImageRecord>('artist_images', {
        artist: id,
        displayOrder: maxOrder + 1 + i,
        legacyImageUrl: await savePocketBaseUpload(validImages[i], 'artists', token),
      }, token)
    }

    return NextResponse.json(await getArtist(id))
  } catch (error) {
    console.error('Failed to update artist:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update artist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 })

    await deleteRecord('artists', id, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete artist:', error)
    return NextResponse.json({ error: 'Failed to delete artist' }, { status: 500 })
  }
}
