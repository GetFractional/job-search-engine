import rawIntegrityTriggers from "./integrity-triggers.json";

type IntegrityTriggerDefinition = {
  name: string;
  sql: string;
};

const integrityTriggers = rawIntegrityTriggers as IntegrityTriggerDefinition[];
const triggerPlaceholders = integrityTriggers.map(() => "?").join(",");
const triggerNames = integrityTriggers.map(({ name }) => name);

let integrityReady: Promise<void> | null = null;

async function installedTriggerCount(db: D1Database): Promise<number> {
  const row = await db
    .prepare(
      `SELECT count(*) AS trigger_count
         FROM sqlite_master
        WHERE type = 'trigger'
          AND name IN (${triggerPlaceholders})`,
    )
    .bind(...triggerNames)
    .first<{ trigger_count: number }>();

  return Number(row?.trigger_count ?? 0);
}

async function installIntegrityTriggers(db: D1Database): Promise<void> {
  if (await installedTriggerCount(db) === integrityTriggers.length) return;

  const results = await db.batch(
    integrityTriggers.map(({ sql }) => db.prepare(sql)),
  );
  if (results.some(({ success }) => !success)) {
    throw new Error("Way Ahead database integrity guards could not be installed.");
  }

  if (await installedTriggerCount(db) !== integrityTriggers.length) {
    throw new Error("Way Ahead database integrity guards are incomplete.");
  }
}

/**
 * Sites applies schema migrations before publishing, but its migration boundary
 * cannot safely transport SQLite trigger programs. Install the versioned trigger
 * set as complete D1 statements before the application handles any request.
 */
export function ensureRuntimeIntegrityTriggers(db: D1Database): Promise<void> {
  if (!integrityReady) {
    integrityReady = installIntegrityTriggers(db).catch((error) => {
      integrityReady = null;
      throw error;
    });
  }
  return integrityReady;
}
