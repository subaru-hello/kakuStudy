import { LEGACY_FLASH_CARD_KEY, SQLITE_DATABASE_NAME, SQLITE_MIGRATION_KEY } from "@/constants";
import { deleteSecureValue, getSecureValue, setSecureValue } from "@/lib/storage";
import { TImage, TMask } from "@/types";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

type StudyItemRow = {
  id: number;
  uri: string;
};

type StudyMaskRow = TMask;

let databasePromise: Promise<SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabaseInternal();
  }

  return databasePromise;
}

async function initializeDatabaseInternal() {
  const database = await openDatabaseAsync(SQLITE_DATABASE_NAME);

  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS study_items (
      id INTEGER PRIMARY KEY NOT NULL,
      uri TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS study_masks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_item_id INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      x1 REAL NOT NULL,
      y1 REAL NOT NULL,
      x2 REAL NOT NULL,
      y2 REAL NOT NULL,
      FOREIGN KEY (study_item_id) REFERENCES study_items(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_study_items_active
      ON study_items(deleted_at, updated_at);
    CREATE INDEX IF NOT EXISTS idx_study_masks_item_sort
      ON study_masks(study_item_id, sort_order);
  `);

  await migrateLegacyFlashCards(database);

  return database;
}

async function migrateLegacyFlashCards(database: SQLiteDatabase) {
  const migrationFlag = await getSecureValue(SQLITE_MIGRATION_KEY);
  const existingItems = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM study_items"
  );

  if (migrationFlag === "true" || (existingItems?.count ?? 0) > 0) {
    if (migrationFlag !== "true") {
      await setSecureValue(SQLITE_MIGRATION_KEY, "true");
    }
    return;
  }

  const legacyPayload = await getSecureValue(LEGACY_FLASH_CARD_KEY);
  if (!legacyPayload) {
    await setSecureValue(SQLITE_MIGRATION_KEY, "true");
    return;
  }

  let legacyItems: TImage[] = [];

  try {
    const parsed = JSON.parse(legacyPayload);
    legacyItems = Array.isArray(parsed) ? parsed : [];
  } catch {
    await setSecureValue(SQLITE_MIGRATION_KEY, "true");
    return;
  }

  await withTransaction(database, async (transaction) => {
    for (const item of legacyItems) {
      await upsertStudyItemRecord(transaction, item);
    }
  });

  await deleteSecureValue(LEGACY_FLASH_CARD_KEY);
  await setSecureValue(SQLITE_MIGRATION_KEY, "true");
}

async function withTransaction<T>(
  database: SQLiteDatabase,
  callback: (transaction: SQLiteDatabase) => Promise<T>
) {
  await database.execAsync("BEGIN");

  try {
    const result = await callback(database);
    await database.execAsync("COMMIT");
    return result;
  } catch (error) {
    await database.execAsync("ROLLBACK");
    throw error;
  }
}

async function upsertStudyItemRecord(database: SQLiteDatabase, item: TImage) {
  const now = new Date().toISOString();

  await database.runAsync(
    `
      INSERT INTO study_items (id, uri, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, NULL)
      ON CONFLICT(id) DO UPDATE SET
        uri = excluded.uri,
        updated_at = excluded.updated_at,
        deleted_at = NULL
    `,
    item.id,
    item.uri,
    now,
    now
  );

  await database.runAsync("DELETE FROM study_masks WHERE study_item_id = ?", item.id);

  for (const [index, mask] of item.masks.entries()) {
    await database.runAsync(
      `
        INSERT INTO study_masks (study_item_id, sort_order, x1, y1, x2, y2)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      item.id,
      index,
      mask.x1,
      mask.y1,
      mask.x2,
      mask.y2
    );
  }
}

async function getStudyItemMasks(database: SQLiteDatabase, studyItemId: number) {
  return database.getAllAsync<StudyMaskRow>(
    `
      SELECT x1, y1, x2, y2
      FROM study_masks
      WHERE study_item_id = ?
      ORDER BY sort_order ASC
    `,
    studyItemId
  );
}

export async function initializeDatabase() {
  return getDatabase();
}

export async function listStudyItems(): Promise<TImage[]> {
  const database = await getDatabase();
  const items = await database.getAllAsync<StudyItemRow>(
    `
      SELECT id, uri
      FROM study_items
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `
  );

  return Promise.all(
    items.map(async (item) => ({
      ...item,
      masks: await getStudyItemMasks(database, item.id),
    }))
  );
}

export async function getStudyItemById(id: number) {
  const database = await getDatabase();
  const item = await database.getFirstAsync<StudyItemRow>(
    `
      SELECT id, uri
      FROM study_items
      WHERE id = ? AND deleted_at IS NULL
    `,
    id
  );

  if (!item) {
    return null;
  }

  return {
    ...item,
    masks: await getStudyItemMasks(database, item.id),
  };
}

export async function saveStudyItem(item: TImage) {
  const database = await getDatabase();

  await withTransaction(database, async (transaction) => {
    await upsertStudyItemRecord(transaction, item);
  });
}

export async function deleteStudyItemById(id: number) {
  const database = await getDatabase();

  await database.runAsync(
    `
      UPDATE study_items
      SET deleted_at = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL
    `,
    new Date().toISOString(),
    new Date().toISOString(),
    id
  );
}
