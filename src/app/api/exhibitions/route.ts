import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import {
  ExhibitionImageRecord,
  ExhibitionRecord,
  createExhibitionUnavailableDates,
  deleteExhibitionUnavailableDates,
  getExhibition,
  getExhibitions,
  toYmd,
} from '@/lib/pocketbase-data'

export async function GET() {
  try {
    return NextResponse.json(await getExhibitions())
  } catch (error) {
    console.error('Failed to fetch exhibitions:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch exhibitions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const { title, description, startDate, endDate, imageUrl, artistIds = [], additionalImages = [] } = await request.json() as {
      title: string
      description?: string | null
      startDate: string
      endDate: string
      imageUrl: string
      artistIds?: string[]
      additionalImages?: { url: string; description?: string }[]
    }

    if (!title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json({ error: 'Title, dates, and image are required' }, { status: 400 })
    }

    const exhibition = await createRecord<ExhibitionRecord>('exhibitions', {
      title,
      description: description?.trim() || '',
      startDate,
      endDate,
      artists: artistIds,
      legacyImageUrl: imageUrl,
    }, token)

    for (let i = 0; i < additionalImages.length; i++) {
      await createRecord<ExhibitionImageRecord>('exhibition_images', {
        exhibition: exhibition.id,
        description: additionalImages[i].description?.trim() || '',
        displayOrder: i,
        legacyImageUrl: additionalImages[i].url,
      }, token)
    }

    await createExhibitionUnavailableDates(exhibition.id, title, startDate, endDate, token)
    return NextResponse.json(await getExhibition(exhibition.id), { status: 201 })
  } catch (error) {
    console.error('Failed to create exhibition:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create exhibition' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const body = await request.json() as {
      id: string
      title: string
      description?: string | null
      startDate: string
      endDate: string
      imageUrl?: string
      artistIds?: string[]
      additionalImages?: { url: string; description?: string }[]
      deleteImageIds?: string[]
      clearMainImage?: boolean
      existingImageDescriptions?: Record<string, string>
      existingImageOrder?: { id: string; displayOrder: number }[]
      newImageStartOrder?: number
    }

    if (!body.id || !body.title || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'ID, title, and dates are required' }, { status: 400 })
    }

    console.log('[exhibitions:PUT] start', {
      id: body.id,
      hasImageUrl: Boolean(body.imageUrl),
      clearMainImage: Boolean(body.clearMainImage),
      additionalImages: body.additionalImages?.length || 0,
      deleteImageIds: body.deleteImageIds?.length || 0,
    })

    const currentExhibition = await getExhibition(body.id)
    const shouldSyncUnavailableDates =
      currentExhibition.title !== body.title ||
      toYmd(currentExhibition.startDate) !== body.startDate ||
      toYmd(currentExhibition.endDate) !== body.endDate
    console.log('[exhibitions:PUT] current loaded', {
      id: body.id,
      shouldSyncUnavailableDates,
      elapsedMs: Date.now() - startedAt,
    })

    for (const imageId of body.deleteImageIds || []) {
      await deleteRecord('exhibition_images', imageId, token)
    }
    console.log('[exhibitions:PUT] extra images deleted', {
      id: body.id,
      elapsedMs: Date.now() - startedAt,
    })

    for (const item of body.existingImageOrder || []) {
      await updateRecord('exhibition_images', item.id, {
        displayOrder: item.displayOrder,
        description: body.existingImageDescriptions?.[item.id]?.trim() || '',
      }, token)
    }
    console.log('[exhibitions:PUT] extra images reordered', {
      id: body.id,
      elapsedMs: Date.now() - startedAt,
    })

    await updateRecord<ExhibitionRecord>('exhibitions', body.id, {
      title: body.title,
      description: body.description?.trim() || '',
      startDate: body.startDate,
      endDate: body.endDate,
      artists: body.artistIds || [],
      ...(body.clearMainImage ? { legacyImageUrl: '' } : {}),
      ...(body.imageUrl ? { legacyImageUrl: body.imageUrl } : {}),
    }, token)
    console.log('[exhibitions:PUT] exhibition updated', {
      id: body.id,
      elapsedMs: Date.now() - startedAt,
    })

    for (let i = 0; i < (body.additionalImages || []).length; i++) {
      const image = body.additionalImages![i]
      await createRecord<ExhibitionImageRecord>('exhibition_images', {
        exhibition: body.id,
        description: image.description?.trim() || '',
        displayOrder: (body.newImageStartOrder || 0) + i,
        legacyImageUrl: image.url,
      }, token)
    }
    console.log('[exhibitions:PUT] new extra images created', {
      id: body.id,
      elapsedMs: Date.now() - startedAt,
    })

    if (shouldSyncUnavailableDates) {
      await deleteExhibitionUnavailableDates(body.id, token)
      await createExhibitionUnavailableDates(body.id, body.title, body.startDate, body.endDate, token)
      console.log('[exhibitions:PUT] unavailable dates synced', {
        id: body.id,
        elapsedMs: Date.now() - startedAt,
      })
    }

    const exhibition = await getExhibition(body.id)
    console.log('[exhibitions:PUT] complete', {
      id: body.id,
      elapsedMs: Date.now() - startedAt,
    })
    return NextResponse.json(exhibition)
  } catch (error) {
    console.error('Failed to update exhibition:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update exhibition' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Exhibition ID is required' }, { status: 400 })

    await deleteExhibitionUnavailableDates(id, token)
    await deleteRecord('exhibitions', id, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete exhibition:', error)
    return NextResponse.json({ error: 'Failed to delete exhibition' }, { status: 500 })
  }
}
