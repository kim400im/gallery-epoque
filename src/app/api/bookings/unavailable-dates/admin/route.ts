import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, listRecords, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { UnavailableDateRecord, parseToUTCNoon, toYmd } from '@/lib/pocketbase-data'

export async function GET(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const blockedDates = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: 'type="blocked"', sort: 'date' }, token)
    return NextResponse.json(blockedDates.items.map((record) => ({
      id: record.id,
      date: toYmd(record.date),
      reason: record.reason || null,
      type: record.type,
    })))
  } catch (error) {
    console.error('Failed to fetch blocked dates:', error)
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const { dates, reason } = await request.json() as { dates: string[]; reason?: string }
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Dates array is required' }, { status: 400 })
    }

    for (const date of dates) {
      const existing = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: `date="${date}"`, perPage: 1 }, token)
      const body = { date: parseToUTCNoon(date), reason: reason || '관리자 차단', type: 'blocked', exhibition: '' }
      if (existing.items[0]) {
        await updateRecord('unavailable_dates', existing.items[0].id, body, token)
      } else {
        await createRecord('unavailable_dates', body, token)
      }
    }

    return NextResponse.json({ success: true, count: dates.length, message: `${dates.length} dates blocked.` }, { status: 201 })
  } catch (error) {
    console.error('Failed to block dates:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to block dates' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const searchParams = new URL(request.url).searchParams
    const id = searchParams.get('id')
    const date = searchParams.get('date')
    if (!id && !date) return NextResponse.json({ error: 'Either id or date parameter is required' }, { status: 400 })

    if (id) {
      await deleteRecord('unavailable_dates', id, token)
    } else if (date) {
      const records = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: `date="${date}" && type="blocked"` }, token)
      for (const record of records.items) await deleteRecord('unavailable_dates', record.id, token)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unblock date:', error)
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 })
  }
}
