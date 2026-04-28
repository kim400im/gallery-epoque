import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || process.env.PB_MIGRATE_DRY_RUN === 'true';
const reset = args.has('--reset') || process.env.PB_MIGRATE_RESET === 'true';

const pbUrl = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const pbEmail = process.env.POCKETBASE_SUPERUSER_EMAIL;
const pbPassword = process.env.POCKETBASE_SUPERUSER_PASSWORD;

if (!dryRun && (!pbEmail || !pbPassword)) {
  throw new Error('POCKETBASE_SUPERUSER_EMAIL and POCKETBASE_SUPERUSER_PASSWORD are required unless --dry-run is used.');
}

function iso(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function pbEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function pbRequest(path, options = {}) {
  const res = await fetch(`${pbUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(pbRequest.token ? { Authorization: pbRequest.token } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${options.method || 'GET'} ${path} failed (${res.status}): ${text}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function login() {
  if (dryRun) return;
  const data = await pbRequest('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({
      identity: pbEmail,
      password: pbPassword,
    }),
  });
  pbRequest.token = data.token;
}

async function fetchLegacyRecord(collection, legacyId) {
  const filter = encodeURIComponent(`legacyId="${pbEscape(legacyId)}"`);
  const data = await pbRequest(`/api/collections/${collection}/records?filter=${filter}&perPage=1`);
  return data.items?.[0] || null;
}

async function createOrReuse(collection, legacyId, body) {
  if (dryRun) return { id: `dry_${collection}_${legacyId}` };

  const existing = await fetchLegacyRecord(collection, legacyId);
  if (existing) return existing;

  return pbRequest(`/api/collections/${collection}/records`, {
    method: 'POST',
    body: JSON.stringify({
      legacyId,
      ...body,
    }),
  });
}

async function listAll(collection) {
  const out = [];
  let page = 1;
  for (;;) {
    const data = await pbRequest(`/api/collections/${collection}/records?page=${page}&perPage=200`);
    out.push(...(data.items || []));
    if (page >= data.totalPages) break;
    page += 1;
  }
  return out;
}

async function resetPocketBaseData() {
  if (dryRun || !reset) return;

  const collections = [
    'unavailable_dates',
    'notice_attachments',
    'notices',
    'bookings',
    'home_images',
    'exhibition_images',
    'exhibitions',
    'artist_images',
    'artists',
  ];

  for (const collection of collections) {
    const records = await listAll(collection);
    for (const record of records) {
      await pbRequest(`/api/collections/${collection}/records/${record.id}`, { method: 'DELETE' });
    }
    console.log(`reset ${collection}: deleted ${records.length}`);
  }
}

async function readSupabaseData() {
  const [
    artists,
    exhibitions,
    homeImages,
    bookings,
    notices,
    unavailableDates,
  ] = await Promise.all([
    prisma.artist.findMany({ include: { images: true }, orderBy: { createdAt: 'asc' } }),
    prisma.exhibition.findMany({
      include: {
        artists: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.homeImage.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }),
    prisma.booking.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.notice.findMany({ include: { attachments: true }, orderBy: { createdAt: 'asc' } }),
    prisma.unavailableDate.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  return { artists, exhibitions, homeImages, bookings, notices, unavailableDates };
}

async function migrate() {
  console.log(`PocketBase: ${pbUrl}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : 'write'}${reset ? ' + reset' : ''}`);

  const data = await readSupabaseData();
  console.log('Supabase/Postgres rows:', {
    artists: data.artists.length,
    artistImages: data.artists.reduce((sum, artist) => sum + artist.images.length, 0),
    exhibitions: data.exhibitions.length,
    exhibitionImages: data.exhibitions.reduce((sum, exhibition) => sum + exhibition.images.length, 0),
    homeImages: data.homeImages.length,
    bookings: data.bookings.length,
    notices: data.notices.length,
    noticeAttachments: data.notices.reduce((sum, notice) => sum + notice.attachments.length, 0),
    unavailableDates: data.unavailableDates.length,
  });

  if (dryRun) {
    console.log('Dry run complete. Run without --dry-run and set PB_MIGRATE_DRY_RUN=false to write records.');
    return;
  }

  await login();
  await resetPocketBaseData();

  const artistMap = new Map();
  const exhibitionMap = new Map();

  for (const artist of data.artists) {
    const record = await createOrReuse('artists', artist.id, {
      name: artist.name,
      biography: artist.biography || '',
      introduction: artist.introduction || '',
      legacyImageUrl: artist.imageUrl || '',
    });
    artistMap.set(artist.id, record.id);

    for (const image of artist.images) {
      await createOrReuse('artist_images', image.id, {
        artist: record.id,
        displayOrder: image.displayOrder,
        legacyImageUrl: image.imageUrl || '',
      });
    }
  }

  for (const exhibition of data.exhibitions) {
    const artistIds = exhibition.artists
      .map((item) => artistMap.get(item.artistId))
      .filter(Boolean);

    if (exhibition.artistId && artistMap.has(exhibition.artistId) && !artistIds.includes(artistMap.get(exhibition.artistId))) {
      artistIds.push(artistMap.get(exhibition.artistId));
    }

    const record = await createOrReuse('exhibitions', exhibition.id, {
      title: exhibition.title,
      description: exhibition.description || '',
      startDate: iso(exhibition.startDate),
      endDate: iso(exhibition.endDate),
      artists: artistIds,
      legacyImageUrl: exhibition.imageUrl || '',
    });
    exhibitionMap.set(exhibition.id, record.id);

    for (const image of exhibition.images) {
      await createOrReuse('exhibition_images', image.id, {
        exhibition: record.id,
        description: image.description || '',
        displayOrder: image.displayOrder,
        legacyImageUrl: image.imageUrl || '',
      });
    }
  }

  for (const image of data.homeImages) {
    await createOrReuse('home_images', image.id, {
      title: image.title || '',
      subtitle: image.subtitle || '',
      displayOrder: image.displayOrder,
      isActive: image.isActive,
      legacyImageUrl: image.imageUrl || '',
    });
  }

  for (const booking of data.bookings) {
    await createOrReuse('bookings', booking.id, {
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      startDate: iso(booking.startDate),
      endDate: iso(booking.endDate),
      message: booking.message || '',
      isRead: booking.isRead,
    });
  }

  const noticeMap = new Map();
  for (const notice of data.notices) {
    const record = await createOrReuse('notices', notice.id, {
      title: notice.title,
      content: notice.content,
      isFeatured: notice.isFeatured,
      viewCount: notice.viewCount,
    });
    noticeMap.set(notice.id, record.id);

    for (const attachment of notice.attachments) {
      await createOrReuse('notice_attachments', attachment.id, {
        notice: record.id,
        fileName: attachment.fileName,
        legacyFileUrl: attachment.fileUrl || '',
        fileSize: attachment.fileSize || 0,
        mimeType: attachment.mimeType || '',
      });
    }
  }

  for (const unavailableDate of data.unavailableDates) {
    await createOrReuse('unavailable_dates', unavailableDate.id, {
      date: iso(unavailableDate.date),
      reason: unavailableDate.reason || '',
      type: unavailableDate.type,
      exhibition: unavailableDate.exhibitionId ? exhibitionMap.get(unavailableDate.exhibitionId) || '' : '',
      legacyExhibitionId: unavailableDate.exhibitionId || '',
    });
  }

  console.log('PocketBase data migration complete.');
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
