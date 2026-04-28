import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, getServerSuperuserToken, listRecords, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { BookingRecord, mapBooking } from '@/lib/pocketbase-data'

export async function GET(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const bookings = await listRecords<BookingRecord>('bookings', {}, token)
    return NextResponse.json(bookings.items
      .slice()
      .sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')))
      .map(mapBooking))
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, startDate, endDate, message } = await request.json()
    if (!name || !phone || !email || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, phone, email, start date, and end date are required' }, { status: 400 })
    }

    const booking = await createRecord<BookingRecord>('bookings', {
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      startDate,
      endDate,
      message: message?.trim() || '',
      isRead: false,
    }, await getServerSuperuserToken())

    return NextResponse.json(mapBooking(booking), { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const { id, isRead } = await request.json()
    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })

    const booking = await updateRecord<BookingRecord>('bookings', id, { isRead: isRead ?? true }, token)
    return NextResponse.json(mapBooking(booking))
  } catch (error) {
    console.error('Failed to update booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })

    await deleteRecord('bookings', id, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
