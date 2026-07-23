DROP TRIGGER `job_posting_versions_payload_immutable`;--> statement-breakpoint
DROP TRIGGER `generated_assets_payload_immutable`;--> statement-breakpoint
DROP TRIGGER `pursuit_packages_payload_immutable`;--> statement-breakpoint
DROP TRIGGER `external_action_approvals_insert_gate`;--> statement-breakpoint
DROP TRIGGER `external_action_approvals_update_gate`;--> statement-breakpoint
CREATE UNIQUE INDEX `audit_events_founder_workspace_imported_user_unique`
ON `audit_events` (`user_id`,`event_type`)
WHERE `event_type` = 'founder_workspace_imported';--> statement-breakpoint
CREATE TRIGGER `job_posting_versions_payload_immutable`
BEFORE UPDATE OF `id`,`job_posting_id`,`source_checked_at`,`source_url`,`description_checksum`,`source_facts_json`,`source_conflicts_json`,`capture_state`
ON `job_posting_versions`
BEGIN
  SELECT RAISE(ABORT, 'job posting version identity and payload are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `generated_assets_payload_immutable`
BEFORE UPDATE OF `id`,`user_id`,`pursuit_id`,`type`,`source_versions_json`,`generation_policy_version`,`version`,`content_json`,`content_sha256`,`filename`,`page_count`,`supersedes_asset_id`,`review_state`
ON `generated_assets`
BEGIN
  SELECT RAISE(ABORT, 'generated asset identity and version payload are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `pursuit_packages_payload_immutable`
BEFORE UPDATE OF `id`,`user_id`,`pursuit_id`,`version`,`destination_url`,`job_posting_version_id`,`answers_json`,`asset_manifest_json`,`payload_sha256`
ON `pursuit_packages`
BEGIN
  SELECT RAISE(ABORT, 'pursuit package identity and payload are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `pursuit_packages_version_monotonic`
BEFORE INSERT ON `pursuit_packages`
WHEN EXISTS (
  SELECT 1
    FROM `pursuit_packages` existing
   WHERE existing.`user_id` = NEW.`user_id`
     AND existing.`pursuit_id` = NEW.`pursuit_id`
     AND existing.`id` <> NEW.`id`
     AND existing.`version` >= NEW.`version`
)
BEGIN
  SELECT RAISE(ABORT, 'pursuit package version must advance monotonically');
END;--> statement-breakpoint
CREATE TRIGGER `pursuit_packages_new_version_supersedes_previous`
AFTER INSERT ON `pursuit_packages`
WHEN EXISTS (
  SELECT 1
    FROM `pursuit_packages` previous
   WHERE previous.`user_id` = NEW.`user_id`
     AND previous.`pursuit_id` = NEW.`pursuit_id`
     AND previous.`id` <> NEW.`id`
     AND previous.`version` < NEW.`version`
)
BEGIN
  UPDATE `pursuit_packages`
     SET `readiness_state` = 'superseded',
         `superseded_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `pursuit_id` = NEW.`pursuit_id`
     AND `id` <> NEW.`id`
     AND `version` < NEW.`version`
     AND `readiness_state` <> 'superseded';
  UPDATE `external_action_approvals`
     SET `state` = 'revoked',
         `revoked_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `pursuit_package_id` IN (
       SELECT previous.`id`
         FROM `pursuit_packages` previous
        WHERE previous.`user_id` = NEW.`user_id`
          AND previous.`pursuit_id` = NEW.`pursuit_id`
          AND previous.`id` <> NEW.`id`
          AND previous.`version` < NEW.`version`
     )
     AND `state` IN ('requested','approved');
  UPDATE `pursuits`
     SET `state` = 'preparing',
         `external_approval_state` = 'not_requested',
         `next_action` = 'A new application package version exists. Review its exact source, answers, files, and fingerprint before any external action.',
         `updated_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `id` = NEW.`pursuit_id`
     AND `state` NOT IN ('applied','interviewing','closed');
  UPDATE `pursuits`
     SET `external_approval_state` = 'revoked',
         `updated_at` = unixepoch() * 1000
   WHERE `user_id` = NEW.`user_id`
     AND `id` = NEW.`pursuit_id`
     AND EXISTS (
       SELECT 1
         FROM `external_action_approvals` approval
         JOIN `pursuit_packages` previous
           ON previous.`id` = approval.`pursuit_package_id`
          AND previous.`user_id` = approval.`user_id`
        WHERE previous.`user_id` = NEW.`user_id`
          AND previous.`pursuit_id` = NEW.`pursuit_id`
          AND previous.`id` <> NEW.`id`
          AND previous.`version` < NEW.`version`
          AND approval.`state` = 'revoked'
     );
END;--> statement-breakpoint
CREATE TRIGGER `external_action_approvals_identity_payload_immutable`
BEFORE UPDATE OF `id`,`user_id`,`pursuit_package_id`,`action`,`payload_sha256`
ON `external_action_approvals`
BEGIN
  SELECT RAISE(ABORT, 'external approval identity and payload are immutable');
END;--> statement-breakpoint
CREATE TRIGGER `job_posting_versions_new_snapshot_supersedes_packages`
AFTER INSERT ON `job_posting_versions`
BEGIN
  UPDATE `pursuit_packages`
     SET `readiness_state` = 'superseded',
         `superseded_at` = unixepoch() * 1000
   WHERE `pursuit_id` IN (
           SELECT p.`id`
             FROM `pursuits` p
            WHERE p.`job_posting_id` = NEW.`job_posting_id`
         )
     AND `job_posting_version_id` <> NEW.`id`
     AND `readiness_state` <> 'superseded';
  UPDATE `external_action_approvals`
     SET `state` = 'revoked',
         `revoked_at` = unixepoch() * 1000
   WHERE `pursuit_package_id` IN (
           SELECT pp.`id`
             FROM `pursuit_packages` pp
             JOIN `pursuits` p ON p.`id` = pp.`pursuit_id`
            WHERE p.`job_posting_id` = NEW.`job_posting_id`
              AND pp.`job_posting_version_id` <> NEW.`id`
         )
     AND `state` IN ('requested','approved');
  UPDATE `pursuits`
     SET `state` = 'preparing',
         `external_approval_state` = 'revoked',
         `next_action` = 'The employer source or form changed. Review the new version and rebuild the exact package before any external action.',
         `updated_at` = unixepoch() * 1000
   WHERE `job_posting_id` = NEW.`job_posting_id`
     AND `id` IN (
           SELECT pp.`pursuit_id`
             FROM `pursuit_packages` pp
            WHERE pp.`job_posting_version_id` <> NEW.`id`
         )
     AND `state` NOT IN ('applied','interviewing','closed');
END;--> statement-breakpoint
CREATE TRIGGER `external_action_approvals_insert_gate`
BEFORE INSERT ON `external_action_approvals`
WHEN NEW.`action` NOT IN ('approve_application_package','submit_application')
  OR NEW.`state` NOT IN ('requested','approved','revoked','completed')
  OR (
    NEW.`state` IN ('approved','completed')
    AND (
      NOT EXISTS (
        SELECT 1
          FROM `pursuit_packages` p
         WHERE p.`id` = NEW.`pursuit_package_id`
           AND p.`user_id` = NEW.`user_id`
           AND p.`payload_sha256` = NEW.`payload_sha256`
           AND p.`readiness_state` = 'ready_for_review'
           AND p.`blockers_json` = '[]'
           AND json_valid(p.`answers_json`)
           AND json_type(p.`answers_json`, '$.questionSetChecksum') = 'text'
           AND length(trim(json_extract(p.`answers_json`, '$.questionSetChecksum'))) > 0
           AND EXISTS (
             SELECT 1
               FROM `job_posting_versions` bound_version
              WHERE bound_version.`id` = p.`job_posting_version_id`
                AND bound_version.`capture_state` IN ('verified','conflict')
                AND json_valid(bound_version.`source_facts_json`)
                AND json_type(bound_version.`source_facts_json`, '$.questionSetChecksum') = 'text'
                AND json_extract(bound_version.`source_facts_json`, '$.questionSetChecksum') =
                    json_extract(p.`answers_json`, '$.questionSetChecksum')
           )
           AND json_valid(p.`asset_manifest_json`)
           AND json_type(p.`asset_manifest_json`, '$.assets') = 'array'
           AND json_array_length(p.`asset_manifest_json`, '$.assets') = 2
           AND p.`job_posting_version_id` = (
             SELECT latest.`id`
               FROM `job_posting_versions` latest
               JOIN `pursuits` pursuit
                 ON pursuit.`id` = p.`pursuit_id`
                AND pursuit.`user_id` = p.`user_id`
              WHERE latest.`job_posting_id` = pursuit.`job_posting_id`
              ORDER BY latest.`source_checked_at` DESC, latest.`created_at` DESC, latest.`id` DESC
              LIMIT 1
           )
           AND (SELECT count(*) FROM json_each(p.`asset_manifest_json`, '$.assets') m WHERE json_extract(m.`value`, '$.type') = 'resume') = 1
           AND (SELECT count(*) FROM json_each(p.`asset_manifest_json`, '$.assets') m WHERE json_extract(m.`value`, '$.type') = 'cover_letter') = 1
           AND NOT EXISTS (
             SELECT 1
               FROM json_each(p.`asset_manifest_json`, '$.assets') manifest
               LEFT JOIN `generated_assets` a
                 ON a.`id` = json_extract(manifest.`value`, '$.id')
                AND a.`user_id` = p.`user_id`
                AND a.`pursuit_id` = p.`pursuit_id`
              WHERE a.`id` IS NULL
                 OR a.`type` IS NOT json_extract(manifest.`value`, '$.type')
                 OR a.`type` NOT IN ('resume','cover_letter')
                 OR a.`version` IS NOT json_extract(manifest.`value`, '$.version')
                 OR a.`content_sha256` IS NULL
                 OR length(trim(a.`content_sha256`)) = 0
                 OR a.`content_sha256` IS NOT json_extract(manifest.`value`, '$.contentSha256')
                 OR a.`filename` IS NULL
                 OR length(trim(a.`filename`)) = 0
                 OR a.`filename` IS NOT json_extract(manifest.`value`, '$.filename')
                 OR a.`page_count` IS NULL
                 OR a.`page_count` <= 0
                 OR a.`page_count` IS NOT json_extract(manifest.`value`, '$.pageCount')
                 OR a.`review_state` <> 'claim_safe'
                 OR json_extract(manifest.`value`, '$.reviewState') IS NOT 'claim_safe'
                 OR NOT json_valid(a.`content_json`)
                 OR json_type(a.`content_json`, '$.fileSha256') IS NOT 'text'
                 OR length(trim(json_extract(a.`content_json`, '$.fileSha256'))) = 0
                 OR json_extract(a.`content_json`, '$.fileSha256') IS NOT json_extract(manifest.`value`, '$.fileSha256')
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
      OR (
        NEW.`action` = 'submit_application'
        AND NOT EXISTS (
          SELECT 1
            FROM `external_action_approvals` package_approval
           WHERE package_approval.`user_id` = NEW.`user_id`
             AND package_approval.`pursuit_package_id` = NEW.`pursuit_package_id`
             AND package_approval.`action` = 'approve_application_package'
             AND package_approval.`payload_sha256` = NEW.`payload_sha256`
             AND package_approval.`state` = 'approved'
        )
      )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'approval package, source version, form answers, or outbound assets are not exact and current');
END;--> statement-breakpoint
CREATE TRIGGER `external_action_approvals_update_gate`
BEFORE UPDATE OF `pursuit_package_id`,`payload_sha256`,`action`,`state`
ON `external_action_approvals`
WHEN NEW.`action` NOT IN ('approve_application_package','submit_application')
  OR NEW.`state` NOT IN ('requested','approved','revoked','completed')
  OR (
    NEW.`state` IN ('approved','completed')
    AND (
      NOT EXISTS (
        SELECT 1
          FROM `pursuit_packages` p
         WHERE p.`id` = NEW.`pursuit_package_id`
           AND p.`user_id` = NEW.`user_id`
           AND p.`payload_sha256` = NEW.`payload_sha256`
           AND p.`readiness_state` = 'ready_for_review'
           AND p.`blockers_json` = '[]'
           AND json_valid(p.`answers_json`)
           AND json_type(p.`answers_json`, '$.questionSetChecksum') = 'text'
           AND length(trim(json_extract(p.`answers_json`, '$.questionSetChecksum'))) > 0
           AND EXISTS (
             SELECT 1
               FROM `job_posting_versions` bound_version
              WHERE bound_version.`id` = p.`job_posting_version_id`
                AND bound_version.`capture_state` IN ('verified','conflict')
                AND json_valid(bound_version.`source_facts_json`)
                AND json_type(bound_version.`source_facts_json`, '$.questionSetChecksum') = 'text'
                AND json_extract(bound_version.`source_facts_json`, '$.questionSetChecksum') =
                    json_extract(p.`answers_json`, '$.questionSetChecksum')
           )
           AND json_valid(p.`asset_manifest_json`)
           AND json_type(p.`asset_manifest_json`, '$.assets') = 'array'
           AND json_array_length(p.`asset_manifest_json`, '$.assets') = 2
           AND p.`job_posting_version_id` = (
             SELECT latest.`id`
               FROM `job_posting_versions` latest
               JOIN `pursuits` pursuit
                 ON pursuit.`id` = p.`pursuit_id`
                AND pursuit.`user_id` = p.`user_id`
              WHERE latest.`job_posting_id` = pursuit.`job_posting_id`
              ORDER BY latest.`source_checked_at` DESC, latest.`created_at` DESC, latest.`id` DESC
              LIMIT 1
           )
           AND (SELECT count(*) FROM json_each(p.`asset_manifest_json`, '$.assets') m WHERE json_extract(m.`value`, '$.type') = 'resume') = 1
           AND (SELECT count(*) FROM json_each(p.`asset_manifest_json`, '$.assets') m WHERE json_extract(m.`value`, '$.type') = 'cover_letter') = 1
           AND NOT EXISTS (
             SELECT 1
               FROM json_each(p.`asset_manifest_json`, '$.assets') manifest
               LEFT JOIN `generated_assets` a
                 ON a.`id` = json_extract(manifest.`value`, '$.id')
                AND a.`user_id` = p.`user_id`
                AND a.`pursuit_id` = p.`pursuit_id`
              WHERE a.`id` IS NULL
                 OR a.`type` IS NOT json_extract(manifest.`value`, '$.type')
                 OR a.`type` NOT IN ('resume','cover_letter')
                 OR a.`version` IS NOT json_extract(manifest.`value`, '$.version')
                 OR a.`content_sha256` IS NULL
                 OR length(trim(a.`content_sha256`)) = 0
                 OR a.`content_sha256` IS NOT json_extract(manifest.`value`, '$.contentSha256')
                 OR a.`filename` IS NULL
                 OR length(trim(a.`filename`)) = 0
                 OR a.`filename` IS NOT json_extract(manifest.`value`, '$.filename')
                 OR a.`page_count` IS NULL
                 OR a.`page_count` <= 0
                 OR a.`page_count` IS NOT json_extract(manifest.`value`, '$.pageCount')
                 OR a.`review_state` <> 'claim_safe'
                 OR json_extract(manifest.`value`, '$.reviewState') IS NOT 'claim_safe'
                 OR NOT json_valid(a.`content_json`)
                 OR json_type(a.`content_json`, '$.fileSha256') IS NOT 'text'
                 OR length(trim(json_extract(a.`content_json`, '$.fileSha256'))) = 0
                 OR json_extract(a.`content_json`, '$.fileSha256') IS NOT json_extract(manifest.`value`, '$.fileSha256')
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
      OR (
        NEW.`action` = 'submit_application'
        AND NOT EXISTS (
          SELECT 1
            FROM `external_action_approvals` package_approval
           WHERE package_approval.`user_id` = NEW.`user_id`
             AND package_approval.`pursuit_package_id` = NEW.`pursuit_package_id`
             AND package_approval.`action` = 'approve_application_package'
             AND package_approval.`payload_sha256` = NEW.`payload_sha256`
             AND package_approval.`state` = 'approved'
        )
      )
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'approval package, source version, form answers, or outbound assets are not exact and current');
END;
