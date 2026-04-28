import {
  PBRecord,
  asDate,
  createRecord,
  deleteRecord,
  fileUrl,
  getRecord,
  listRecords,
  parseToUTCNoon,
  toYmd,
  updateRecord,
} from './pocketbase'

export { parseToUTCNoon, toYmd } from './pocketbase'

export type ArtistRecord = PBRecord & {
  name: string
  biography?: string
  introduction?: string
  legacyImageUrl?: string
}

export type ArtistImageRecord = PBRecord & {
  artist: string
  displayOrder?: number
  legacyImageUrl?: string
}

export type ExhibitionRecord = PBRecord & {
  title: string
  description?: string
  startDate: string
  endDate: string
  artists?: string[]
  legacyImageUrl?: string
}

export type ExhibitionImageRecord = PBRecord & {
  exhibition: string
  description?: string
  displayOrder?: number
  legacyImageUrl?: string
}

export type NoticeRecord = PBRecord & {
  title: string
  content: string
  isFeatured?: boolean
  viewCount?: number
}

export type NoticeAttachmentRecord = PBRecord & {
  notice: string
  fileName: string
  legacyFileUrl?: string
  fileSize?: number
  mimeType?: string
}

export type HomeImageRecord = PBRecord & {
  title?: string
  subtitle?: string
  displayOrder?: number
  isActive?: boolean
  legacyImageUrl?: string
}

export type BookingRecord = PBRecord & {
  name: string
  phone: string
  email: string
  startDate: string
  endDate: string
  message?: string
  isRead?: boolean
}

export type UnavailableDateRecord = PBRecord & {
  date: string
  reason?: string
  type: string
  exhibition?: string
  legacyExhibitionId?: string
}

export function mapArtist(record: ArtistRecord, images: ArtistImageRecord[] = []) {
  return {
    id: record.id,
    name: record.name,
    imageUrl: fileUrl('artists', record, 'image', 'legacyImageUrl'),
    biography: record.biography || null,
    introduction: record.introduction || null,
    createdAt: asDate(record.created),
    updatedAt: asDate(record.updated),
    images: images
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((image) => ({
        id: image.id,
        imageUrl: fileUrl('artist_images', image, 'image', 'legacyImageUrl'),
        displayOrder: image.displayOrder ?? 0,
        createdAt: asDate(image.created),
        artistId: image.artist,
      })),
  }
}

export function mapExhibition(
  record: ExhibitionRecord,
  artistsById: Map<string, ReturnType<typeof mapArtist>>,
  images: ExhibitionImageRecord[] = []
) {
  const artistIds = Array.isArray(record.artists) ? record.artists : []
  return {
    id: record.id,
    title: record.title,
    description: record.description || null,
    imageUrl: fileUrl('exhibitions', record, 'image', 'legacyImageUrl'),
    startDate: record.startDate,
    endDate: record.endDate,
    createdAt: asDate(record.created),
    updatedAt: asDate(record.updated),
    artistId: artistIds[0] || null,
    artist: artistIds[0] ? artistsById.get(artistIds[0]) || null : null,
    artists: artistIds.map((artistId) => ({
      id: `${record.id}_${artistId}`,
      exhibitionId: record.id,
      artistId,
      artist: artistsById.get(artistId) || null,
      createdAt: asDate(record.created),
    })),
    images: images
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((image) => ({
        id: image.id,
        imageUrl: fileUrl('exhibition_images', image, 'image', 'legacyImageUrl'),
        description: image.description || null,
        displayOrder: image.displayOrder ?? 0,
        createdAt: asDate(image.created),
        exhibitionId: image.exhibition,
      })),
  }
}

export function mapHomeImage(record: HomeImageRecord) {
  return {
    id: record.id,
    title: record.title || null,
    subtitle: record.subtitle || null,
    imageUrl: fileUrl('home_images', record, 'image', 'legacyImageUrl'),
    displayOrder: record.displayOrder ?? 0,
    isActive: record.isActive ?? false,
    createdAt: asDate(record.created),
    updatedAt: asDate(record.updated),
  }
}

export function mapNotice(record: NoticeRecord, attachments: NoticeAttachmentRecord[] = []) {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    isFeatured: record.isFeatured ?? false,
    viewCount: record.viewCount ?? 0,
    createdAt: asDate(record.created),
    updatedAt: asDate(record.updated),
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: fileUrl('notice_attachments', attachment, 'file', 'legacyFileUrl'),
      fileSize: attachment.fileSize ?? null,
      mimeType: attachment.mimeType || null,
      createdAt: asDate(attachment.created),
      noticeId: attachment.notice,
    })),
  }
}

export function mapBooking(record: BookingRecord) {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    startDate: record.startDate,
    endDate: record.endDate,
    message: record.message || null,
    isRead: record.isRead ?? false,
    createdAt: asDate(record.created),
    updatedAt: asDate(record.updated),
  }
}

export async function getArtists() {
  const [artists, images] = await Promise.all([
    listRecords<ArtistRecord>('artists', { sort: 'name' }),
    listRecords<ArtistImageRecord>('artist_images', { sort: 'displayOrder' }),
  ])
  const imagesByArtist = groupBy(images.items, 'artist')
  return artists.items.map((artist) => mapArtist(artist, imagesByArtist.get(artist.id) || []))
}

export async function getArtist(id: string) {
  const [artist, images] = await Promise.all([
    getRecord<ArtistRecord>('artists', id),
    listRecords<ArtistImageRecord>('artist_images', { filter: `artist="${id}"`, sort: 'displayOrder' }),
  ])
  return mapArtist(artist, images.items)
}

export async function getExhibitions() {
  const [exhibitions, artists, exhibitionImages] = await Promise.all([
    listRecords<ExhibitionRecord>('exhibitions'),
    getArtists(),
    listRecords<ExhibitionImageRecord>('exhibition_images', { sort: 'displayOrder' }),
  ])
  const artistsById = new Map(artists.map((artist) => [artist.id, artist]))
  const imagesByExhibition = groupBy(exhibitionImages.items, 'exhibition')
  return exhibitions.items
    .slice()
    .sort((a, b) => asDate(b.created).localeCompare(asDate(a.created)))
    .map((exhibition) => mapExhibition(exhibition, artistsById, imagesByExhibition.get(exhibition.id) || []))
}

export async function getExhibition(id: string) {
  const [exhibition, artists, images] = await Promise.all([
    getRecord<ExhibitionRecord>('exhibitions', id),
    getArtists(),
    listRecords<ExhibitionImageRecord>('exhibition_images', { filter: `exhibition="${id}"`, sort: 'displayOrder' }),
  ])
  return mapExhibition(exhibition, new Map(artists.map((artist) => [artist.id, artist])), images.items)
}

export async function getNotices(page = 1, perPage = 10) {
  const notices = await listRecords<NoticeRecord>('notices', { page, perPage })
  const attachments = await listRecords<NoticeAttachmentRecord>('notice_attachments', { perPage: 500 })
  const attachmentsByNotice = groupBy(attachments.items, 'notice')
  return {
    notices: notices.items
      .slice()
      .sort((a, b) => asDate(b.created).localeCompare(asDate(a.created)))
      .map((notice) => mapNotice(notice, attachmentsByNotice.get(notice.id) || [])),
    total: notices.totalItems,
    page: notices.page,
    totalPages: notices.totalPages,
  }
}

export async function getNotice(id: string) {
  const [notice, attachments] = await Promise.all([
    getRecord<NoticeRecord>('notices', id),
    listRecords<NoticeAttachmentRecord>('notice_attachments', { filter: `notice="${id}"` }),
  ])
  return mapNotice(notice, attachments.items)
}

export async function getHomeImages(includeInactive = false) {
  const filter = includeInactive ? undefined : 'isActive=true'
  const records = await listRecords<HomeImageRecord>('home_images', { sort: 'displayOrder', filter })
  return records.items.map(mapHomeImage)
}

export async function createExhibitionUnavailableDates(exhibitionId: string, title: string, startDate: string, endDate: string, token: string) {
  for (const date of datesBetween(startDate, endDate)) {
    const existing = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: `date="${date}"`, perPage: 1 }, token)
    const body = { date: parseToUTCNoon(date), reason: `전시: ${title}`, type: 'exhibition', exhibition: exhibitionId, legacyExhibitionId: exhibitionId }
    if (existing.items[0]) {
      await updateRecord('unavailable_dates', existing.items[0].id, body, token)
    } else {
      await createRecord('unavailable_dates', body, token)
    }
  }
}

export async function deleteExhibitionUnavailableDates(exhibitionId: string, token: string) {
  const records = await listRecords<UnavailableDateRecord>('unavailable_dates', { filter: `exhibition="${exhibitionId}" || legacyExhibitionId="${exhibitionId}"` }, token)
  for (const record of records.items) await deleteRecord('unavailable_dates', record.id, token)
}

export function datesBetween(startDate: string, endDate: string) {
  const dates: string[] = []
  const current = new Date(parseToUTCNoon(startDate))
  const end = new Date(parseToUTCNoon(endDate))
  while (current <= end) {
    dates.push(toYmd(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

function groupBy<T extends Record<string, any>>(items: T[], key: keyof T) {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const value = String(item[key] || '')
    const group = map.get(value) || []
    group.push(item)
    map.set(value, group)
  }
  return map
}
