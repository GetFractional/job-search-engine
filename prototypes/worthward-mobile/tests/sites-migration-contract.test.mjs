import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { unstable_splitSqlQuery } from "wrangler";

test("keeps every D1 migration intact through the Sites Wrangler SQL splitter", async () => {
  const migrationDirectory = new URL("../drizzle/", import.meta.url);
  const migrationNames = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const migrationName of migrationNames) {
    const rawSql = await readFile(new URL(migrationName, migrationDirectory), "utf8");
    assert.doesNotMatch(
      rawSql,
      /CREATE\s+TRIGGER\b/i,
      `${migrationName} contains a compound trigger program that Sites cannot migrate safely`,
    );
    const drizzleStatements = rawSql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);
    const wranglerStatements = unstable_splitSqlQuery(rawSql)
      .map((statement) => statement.trim())
      .filter(Boolean);

    assert.equal(
      wranglerStatements.length,
      drizzleStatements.length,
      `${migrationName} is not split at the same complete SQL boundaries by Wrangler and Drizzle`,
    );
  }
});
