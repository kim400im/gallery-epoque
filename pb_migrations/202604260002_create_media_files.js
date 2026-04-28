migrate((app) => {
  try {
    app.findCollectionByNameOrId("media_files");
    return;
  } catch (_) {}

  const publicRead = "";
  const adminOnly = "@request.auth.collectionName = '_superusers'";

  app.save(new Collection({
    type: "base",
    name: "media_files",
    listRule: publicRead,
    viewRule: publicRead,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields: [
      { type: "text", name: "folder", max: 120 },
      { type: "file", name: "file", required: true, maxSelect: 1, maxSize: 104857600 },
    ],
  }));
}, (app) => {
  try {
    app.delete(app.findCollectionByNameOrId("media_files"));
  } catch (_) {}
});
