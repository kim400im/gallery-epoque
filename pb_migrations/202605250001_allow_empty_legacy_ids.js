migrate((app) => {
  const legacyIndexes = [
    ["artists", "idx_artists_legacy_id"],
    ["artist_images", "idx_artist_images_legacy_id"],
    ["exhibitions", "idx_exhibitions_legacy_id"],
    ["exhibition_images", "idx_exhibition_images_legacy_id"],
    ["home_images", "idx_home_images_legacy_id"],
    ["bookings", "idx_bookings_legacy_id"],
    ["notices", "idx_notices_legacy_id"],
    ["notice_attachments", "idx_notice_attachments_legacy_id"],
    ["unavailable_dates", "idx_unavailable_dates_legacy_id"],
  ];

  for (const [collectionName, indexName] of legacyIndexes) {
    const collection = app.findCollectionByNameOrId(collectionName);
    const indexSql = `CREATE UNIQUE INDEX ${indexName} ON ${collectionName} (legacyId) WHERE legacyId != ''`;

    collection.indexes = (collection.indexes || [])
      .filter((index) => !index.includes(indexName));
    collection.indexes.push(indexSql);

    app.save(collection);
  }
}, (app) => {
  const legacyIndexes = [
    ["artists", "idx_artists_legacy_id"],
    ["artist_images", "idx_artist_images_legacy_id"],
    ["exhibitions", "idx_exhibitions_legacy_id"],
    ["exhibition_images", "idx_exhibition_images_legacy_id"],
    ["home_images", "idx_home_images_legacy_id"],
    ["bookings", "idx_bookings_legacy_id"],
    ["notices", "idx_notices_legacy_id"],
    ["notice_attachments", "idx_notice_attachments_legacy_id"],
    ["unavailable_dates", "idx_unavailable_dates_legacy_id"],
  ];

  for (const [collectionName, indexName] of legacyIndexes) {
    const collection = app.findCollectionByNameOrId(collectionName);
    const indexSql = `CREATE UNIQUE INDEX ${indexName} ON ${collectionName} (legacyId)`;

    collection.indexes = (collection.indexes || [])
      .filter((index) => !index.includes(indexName));
    collection.indexes.push(indexSql);

    app.save(collection);
  }
});
