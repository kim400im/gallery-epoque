# PocketBase Migration

This project can run PocketBase next to the Next.js app and migrate the existing Supabase/Postgres text data into PocketBase.

## 1. Start PocketBase

Docker is required on the machine that will run PocketBase.

```powershell
docker compose up -d pocketbase
```

PocketBase will be available at:

```txt
http://127.0.0.1:8090
```

Local persistent data is stored in:

```txt
pb_data/
```

Do not commit `pb_data/`.

## 2. Create a PocketBase superuser

Run this once after the container starts:

```powershell
docker compose exec pocketbase /usr/local/bin/pocketbase superuser create admin@example.com "change-this-password" --dir=/pb_data
```

Then create a local `.env.pocketbase` file:

```env
NEXT_PUBLIC_POCKETBASE_URL="http://127.0.0.1:8090"
POCKETBASE_URL="http://127.0.0.1:8090"
POCKETBASE_SUPERUSER_EMAIL="admin@example.com"
POCKETBASE_SUPERUSER_PASSWORD="change-this-password"
PB_MIGRATE_DRY_RUN="false"
PB_MIGRATE_RESET="false"
```

## 3. Apply schema

The schema lives in:

```txt
pb_migrations/202604260001_create_gallery_schema.js
```

PocketBase applies it automatically on `serve`.

Collections created:

```txt
artists
artist_images
exhibitions
exhibition_images
home_images
bookings
notices
notice_attachments
unavailable_dates
```

Images and attachments are initially migrated as legacy URLs:

```txt
legacyImageUrl
legacyFileUrl
```

File migration can be added later.

## 4. Dry-run Supabase data migration

This reads the current Supabase/Postgres database through Prisma and prints row counts without writing to PocketBase.

```powershell
npm run pb:migrate:dry
```

Current dry-run result from this workspace:

```txt
artists: 23
artistImages: 3
exhibitions: 15
exhibitionImages: 192
homeImages: 9
bookings: 0
notices: 1
noticeAttachments: 1
unavailableDates: 486
```

## 5. Write data into PocketBase

After PocketBase is running and `.env.pocketbase` is configured:

```powershell
npm run pb:migrate
```

To delete migrated PocketBase records first:

```powershell
$env:PB_MIGRATE_RESET="true"
npm run pb:migrate
```

The migration script is idempotent by `legacyId`; rerunning it will reuse existing records unless reset is enabled.

