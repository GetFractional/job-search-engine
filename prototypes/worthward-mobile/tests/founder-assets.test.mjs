import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicAssetRoot = path.join(appRoot, "public", "founder-assets");
const assetRoot = path.resolve(
  appRoot,
  "../..",
  "docs/career-platform/case-study-zero/private-assets/seso-application-package",
);

test("keeps founder application files out of the public bundle and preserves their manifest", async () => {
  await assert.rejects(access(publicAssetRoot));
  const manifest = JSON.parse(await readFile(path.join(assetRoot, "manifest.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.deepEqual(
    manifest.assets.map((asset) => [asset.type, asset.pageCount, asset.reviewState]),
    [
      ["resume", 2, "claim_safe"],
      ["cover_letter", 1, "claim_safe"],
    ],
  );

  for (const asset of manifest.assets) {
    assert.match(asset.filename, /^Seso - Director of Revenue Operations - Matt Dimock - (Resume|Cover Letter)\.pdf$/);
    const bytes = await readFile(path.join(assetRoot, asset.filename));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.fileSha256);
    assert.match(asset.fileSha256, /^[a-f0-9]{64}$/);
  }
});
