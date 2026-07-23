DROP TRIGGER `external_action_approvals_insert_gate`;--> statement-breakpoint
DROP TRIGGER `external_action_approvals_update_gate`;--> statement-breakpoint
CREATE TRIGGER `job_posting_versions_payload_immutable`
BEFORE UPDATE OF `source_checked_at`,`source_url`,`description_checksum`,`source_facts_json`,`source_conflicts_json`,`capture_state`
ON `job_posting_versions`
BEGIN
  SELECT RAISE(ABORT, 'job posting version payload is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `generated_assets_payload_immutable`
BEFORE UPDATE OF `pursuit_id`,`type`,`source_versions_json`,`generation_policy_version`,`version`,`content_json`,`content_sha256`,`filename`,`page_count`,`supersedes_asset_id`,`review_state`
ON `generated_assets`
BEGIN
  SELECT RAISE(ABORT, 'generated asset version payload is immutable');
END;--> statement-breakpoint
CREATE TRIGGER `generated_assets_referenced_delete_gate`
BEFORE DELETE ON `generated_assets`
WHEN EXISTS (
  SELECT 1
    FROM `pursuit_packages` p,
         json_each(p.`asset_manifest_json`, '$.assets') manifest
   WHERE p.`user_id` = OLD.`user_id`
     AND p.`pursuit_id` = OLD.`pursuit_id`
     AND json_extract(manifest.`value`, '$.id') = OLD.`id`
)
BEGIN
  SELECT RAISE(ABORT, 'fingerprinted generated asset cannot be deleted');
END;--> statement-breakpoint
CREATE TRIGGER `generated_assets_new_version_supersedes_packages`
AFTER INSERT ON `generated_assets`
WHEN NEW.`version` > 1 OR NEW.`supersedes_asset_id` IS NOT NULL
BEGIN
  UPDATE `pursuit_packages`
     SET `readiness_state` = 'superseded',
         `superseded_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `pursuit_id` = NEW.`pursuit_id`
     AND `readiness_state` <> 'superseded';
  UPDATE `pursuits`
     SET `external_approval_state` = 'revoked',
         `updated_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `id` = NEW.`pursuit_id`
     AND `external_approval_state` IN ('requested','approved');
END;--> statement-breakpoint
CREATE TRIGGER `generated_assets_invalidation_supersedes_packages`
AFTER UPDATE OF `invalidated_at` ON `generated_assets`
WHEN NEW.`invalidated_at` IS NOT NULL AND OLD.`invalidated_at` IS NOT NEW.`invalidated_at`
BEGIN
  UPDATE `pursuit_packages`
     SET `readiness_state` = 'superseded',
         `superseded_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `pursuit_id` = NEW.`pursuit_id`
     AND `readiness_state` <> 'superseded';
  UPDATE `pursuits`
     SET `external_approval_state` = 'revoked',
         `updated_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `id` = NEW.`pursuit_id`
     AND `external_approval_state` IN ('requested','approved');
END;--> statement-breakpoint
CREATE TRIGGER `external_action_approvals_insert_gate`
BEFORE INSERT ON `external_action_approvals`
WHEN NEW.`action` <> 'submit_application'
  OR NEW.`state` NOT IN ('requested','approved','revoked','completed')
  OR (
    NEW.`state` IN ('approved','completed')
    AND NOT EXISTS (
      SELECT 1
      FROM `pursuit_packages` p
      WHERE p.`id` = NEW.`pursuit_package_id`
        AND p.`user_id` = NEW.`user_id`
        AND p.`payload_sha256` = NEW.`payload_sha256`
        AND p.`readiness_state` = 'ready_for_review'
        AND p.`blockers_json` = '[]'
        AND json_valid(p.`asset_manifest_json`)
        AND json_type(p.`asset_manifest_json`, '$.assets') = 'array'
        AND json_array_length(p.`asset_manifest_json`, '$.assets') > 0
        AND NOT EXISTS (
          SELECT 1
          FROM json_each(p.`asset_manifest_json`, '$.assets') manifest
          LEFT JOIN `generated_assets` a
            ON a.`id` = json_extract(manifest.`value`, '$.id')
           AND a.`user_id` = p.`user_id`
           AND a.`pursuit_id` = p.`pursuit_id`
          WHERE a.`id` IS NULL
             OR a.`version` <> json_extract(manifest.`value`, '$.version')
             OR coalesce(a.`content_sha256`, '') <> coalesce(json_extract(manifest.`value`, '$.contentSha256'), '')
             OR coalesce(a.`filename`, '') <> coalesce(json_extract(manifest.`value`, '$.filename'), '')
             OR coalesce(a.`page_count`, -1) <> coalesce(json_extract(manifest.`value`, '$.pageCount'), -1)
             OR a.`review_state` <> json_extract(manifest.`value`, '$.reviewState')
             OR a.`invalidated_at` IS NOT NULL
             OR EXISTS (
               SELECT 1
               FROM `generated_assets` newer
               WHERE newer.`user_id` = a.`user_id`
                 AND newer.`pursuit_id` = a.`pursuit_id`
                 AND newer.`type` = a.`type`
                 AND newer.`version` > a.`version`
                 AND newer.`invalidated_at` IS NULL
             )
        )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'approval package is not ready or asset payload does not match');
END;--> statement-breakpoint
CREATE TRIGGER `external_action_approvals_update_gate`
BEFORE UPDATE OF `pursuit_package_id`,`payload_sha256`,`action`,`state`
ON `external_action_approvals`
WHEN NEW.`action` <> 'submit_application'
  OR NEW.`state` NOT IN ('requested','approved','revoked','completed')
  OR (
    NEW.`state` IN ('approved','completed')
    AND NOT EXISTS (
      SELECT 1
      FROM `pursuit_packages` p
      WHERE p.`id` = NEW.`pursuit_package_id`
        AND p.`user_id` = NEW.`user_id`
        AND p.`payload_sha256` = NEW.`payload_sha256`
        AND p.`readiness_state` = 'ready_for_review'
        AND p.`blockers_json` = '[]'
        AND json_valid(p.`asset_manifest_json`)
        AND json_type(p.`asset_manifest_json`, '$.assets') = 'array'
        AND json_array_length(p.`asset_manifest_json`, '$.assets') > 0
        AND NOT EXISTS (
          SELECT 1
          FROM json_each(p.`asset_manifest_json`, '$.assets') manifest
          LEFT JOIN `generated_assets` a
            ON a.`id` = json_extract(manifest.`value`, '$.id')
           AND a.`user_id` = p.`user_id`
           AND a.`pursuit_id` = p.`pursuit_id`
          WHERE a.`id` IS NULL
             OR a.`version` <> json_extract(manifest.`value`, '$.version')
             OR coalesce(a.`content_sha256`, '') <> coalesce(json_extract(manifest.`value`, '$.contentSha256'), '')
             OR coalesce(a.`filename`, '') <> coalesce(json_extract(manifest.`value`, '$.filename'), '')
             OR coalesce(a.`page_count`, -1) <> coalesce(json_extract(manifest.`value`, '$.pageCount'), -1)
             OR a.`review_state` <> json_extract(manifest.`value`, '$.reviewState')
             OR a.`invalidated_at` IS NOT NULL
             OR EXISTS (
               SELECT 1
               FROM `generated_assets` newer
               WHERE newer.`user_id` = a.`user_id`
                 AND newer.`pursuit_id` = a.`pursuit_id`
                 AND newer.`type` = a.`type`
                 AND newer.`version` > a.`version`
                 AND newer.`invalidated_at` IS NULL
             )
        )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'approval package is not ready or asset payload does not match');
END;
