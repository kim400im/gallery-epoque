import { NextResponse } from 'next/server'
import { getServerSuperuserToken, listRecords } from '@/lib/pocketbase'
import { getExhibitions, toYmd, UnavailableDateRecord } from '@/lib/pocketbase-data'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const token = await getServerSuperuserToken()
    const unavailable = await listRecords<UnavailableDateRecord>('unavailable_dates', {
      filter: `date>="${today}"`,
      sort: 'date',
      perPage: 500,
    }, token)
    const exhibitions = (await getExhibitions()).filter((item) => toYmd(item.endDate) >= today)

    return NextResponse.json({
      unavailableDates: unavailable.items.map((record) => toYmd(record.date)),
      exhibitions: exhibitions.map((exhibition) => ({
        title: exhibition.title,
        startDate: toYmd(exhibition.startDate),
        endDate: toYmd(exhibition.endDate),
      })),
      blockedDates: unavailable.items
        .filter((record) => record.type === 'blocked')
        .map((record) => ({ date: toYmd(record.date), reason: record.reason || null })),
    })
  } catch (error) {
    console.error('Failed to fetch unavailable dates:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch unavailable dates' }, { status: 500 })
  }
}
