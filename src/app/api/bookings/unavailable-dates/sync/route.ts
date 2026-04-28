import { NextRequest, NextResponse } from 'next/server'
import { deleteRecord, listRecords, requireAuthToken, unauthorized } from '@/lib/pocketbase'
import { UnavailableDateRecord, createExhibitionUnavailableDates, getExhibitions, toYmd } from '@/lib/pocketbase-data'

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const existing = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: 'type="exhibition"', perPage: 500 }, token)
    for (const record of existing.items) await deleteRecord('unavailable_dates', record.id, token)

    const exhibitions = await getExhibitions()
    let datesCreated = 0
    for (const exhibition of exhibitions) {
      await createExhibitionUnavailableDates(exhibition.id, exhibition.title, toYmd(exhibition.startDate), toYmd(exhibition.endDate), token)
      const start = new Date(toYmd(exhibition.startDate))
      const end = new Date(toYmd(exhibition.endDate))
      datesCreated += Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
    }

    return NextResponse.json({
      success: true,
      message: `${exhibitions.length} exhibitions synced.`,
      exhibitions: exhibitions.length,
      datesCreated,
    })
  } catch (error) {
    console.error('Failed to sync unavailable dates:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to sync unavailable dates' }, { status: 500 })
  }
}
