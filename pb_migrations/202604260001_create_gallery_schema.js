migrate((app) => {
  const existing = new Set(app.findAllCollections().map((collection) => collection.name));

  const save = (collection) => {
    if (!existing.has(collection.name)) {
      app.save(collection);
    }
  };

  const publicRead = "";
  const adminOnly = "@request.auth.collectionName = '_superusers'";
  const collectionId = (name) => app.findCollectionByNameOrId(name).id;

  save(new Collection({
    type: "base",
    name: "artists",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "text", name: "name", required: true, max: 200, presentable: true },
      { type: "editor", name: "biography" },
      { type: "editor", name: "introduction" },
      { type: "url", name: "legacyImageUrl" },
      { type: "file", name: "image", maxSelect: 1, maxSize: 52428800, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_artists_legacy_id ON artists (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "artist_images",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "relation", name: "artist", required: true, collectionId: collectionId("artists"), cascadeDelete: true, maxSelect: 1 },
      { type: "number", name: "displayOrder", onlyInt: true },
      { type: "url", name: "legacyImageUrl" },
      { type: "file", name: "image", maxSelect: 1, maxSize: 52428800, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_artist_images_legacy_id ON artist_images (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "exhibitions",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "text", name: "title", required: true, max: 300, presentable: true },
      { type: "editor", name: "description" },
      { type: "date", name: "startDate", required: true },
      { type: "date", name: "endDate", required: true },
      { type: "relation", name: "artists", collectionId: collectionId("artists"), maxSelect: 50 },
      { type: "url", name: "legacyImageUrl" },
      { type: "file", name: "image", maxSelect: 1, maxSize: 104857600, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_exhibitions_legacy_id ON exhibitions (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "exhibition_images",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "relation", name: "exhibition", required: true, collectionId: collectionId("exhibitions"), cascadeDelete: true, maxSelect: 1 },
      { type: "editor", name: "description" },
      { type: "number", name: "displayOrder", onlyInt: true },
      { type: "url", name: "legacyImageUrl" },
      { type: "file", name: "image", maxSelect: 1, maxSize: 104857600, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_exhibition_images_legacy_id ON exhibition_images (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "home_images",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "text", name: "title", max: 300, presentable: true },
      { type: "text", name: "subtitle", max: 500 },
      { type: "number", name: "displayOrder", onlyInt: true },
      { type: "bool", name: "isActive" },
      { type: "url", name: "legacyImageUrl" },
      { type: "file", name: "image", maxSelect: 1, maxSize: 104857600, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_home_images_legacy_id ON home_images (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "bookings",
    listRule: adminOnly,
    viewRule: adminOnly,
    createRule: "",
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "text", name: "name", required: true, max: 200, presentable: true },
      { type: "text", name: "phone", required: true, max: 80 },
      { type: "email", name: "email", required: true },
      { type: "date", name: "startDate", required: true },
      { type: "date", name: "endDate", required: true },
      { type: "editor", name: "message" },
      { type: "bool", name: "isRead" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_bookings_legacy_id ON bookings (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "notices",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "text", name: "title", required: true, max: 300, presentable: true },
      { type: "editor", name: "content", required: true },
      { type: "bool", name: "isFeatured" },
      { type: "number", name: "viewCount", onlyInt: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_notices_legacy_id ON notices (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "notice_attachments",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "relation", name: "notice", required: true, collectionId: collectionId("notices"), cascadeDelete: true, maxSelect: 1 },
      { type: "text", name: "fileName", required: true, max: 500, presentable: true },
      { type: "url", name: "legacyFileUrl" },
      { type: "number", name: "fileSize", onlyInt: true },
      { type: "text", name: "mimeType", max: 200 },
      { type: "file", name: "file", maxSelect: 1, maxSize: 104857600 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_notice_attachments_legacy_id ON notice_attachments (legacyId)",
    ],
  }));

  save(new Collection({
    type: "base",
    name: "unavailable_dates",
    listRule: adminOnly,
    viewRule: adminOnly,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "legacyId", max: 64 },
      { type: "date", name: "date", required: true },
      { type: "text", name: "reason", max: 500 },
      { type: "select", name: "type", values: ["exhibition", "blocked"], maxSelect: 1 },
      { type: "relation", name: "exhibition", collectionId: collectionId("exhibitions"), maxSelect: 1 },
      { type: "text", name: "legacyExhibitionId", max: 64 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_unavailable_dates_legacy_id ON unavailable_dates (legacyId)",
      "CREATE UNIQUE INDEX idx_unavailable_dates_date ON unavailable_dates (date)",
    ],
  }));
}, (app) => {
  [
    "unavailable_dates",
    "notice_attachments",
    "notices",
    "bookings",
    "home_images",
    "exhibition_images",
    "exhibitions",
    "artist_images",
    "artists",
  ].forEach((name) => {
    try {
      const collection = app.findCollectionByNameOrId(name);
      app.delete(collection);
    } catch (_) {}
  });
});
