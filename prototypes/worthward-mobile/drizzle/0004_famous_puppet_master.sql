CREATE TABLE `cost_allocation_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_object_ref` text NOT NULL,
	`allocation_version` text NOT NULL,
	`allocation_method` text NOT NULL,
	`stream` text NOT NULL,
	`category` text NOT NULL,
	`source_total_amount_micros` integer NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`is_current` integer DEFAULT 0 NOT NULL,
	`supersedes_group_id` text,
	`reconciled_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`supersedes_group_id`) REFERENCES `cost_allocation_groups`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT `cost_allocation_groups_source_total_check` CHECK(`source_total_amount_micros` >= 0),
	CONSTRAINT `cost_allocation_groups_state_check` CHECK(
		(`state` = 'draft' AND `is_current` = 0 AND `reconciled_at` IS NULL)
		OR (`state` = 'reconciled' AND `is_current` = 1 AND `reconciled_at` IS NOT NULL)
		OR (`state` = 'superseded' AND `is_current` = 0 AND `reconciled_at` IS NOT NULL)
	),
	CONSTRAINT `cost_allocation_groups_stream_category_check` CHECK(
		`stream` IN ('software', 'affiliate', 'human_service')
		AND `category` IN ('source_data', 'rendering', 'model_stage_a', 'model_stage_b', 'adjudication', 'retry_validation', 'storage', 'egress', 'queue', 'email', 'push', 'sms', 'processor', 'dispute', 'support', 'correction_rework', 'trust_recovery', 'human_fulfillment', 'acquisition', 'other')
	)
);--> statement-breakpoint

CREATE UNIQUE INDEX `cost_allocation_groups_source_version_unique`
ON `cost_allocation_groups` (`shared_object_ref`,`allocation_version`);--> statement-breakpoint
CREATE UNIQUE INDEX `cost_allocation_groups_one_current_per_source_unique`
ON `cost_allocation_groups` (`shared_object_ref`)
WHERE `is_current` = 1;--> statement-breakpoint
CREATE INDEX `cost_allocation_groups_state_idx`
ON `cost_allocation_groups` (`state`,`is_current`,`updated_at`);--> statement-breakpoint

ALTER TABLE `cost_events` ADD `allocation_group_id` text REFERENCES cost_allocation_groups(id) ON DELETE restrict;--> statement-breakpoint
ALTER TABLE `cost_events` ADD `allocation_remainder_micros` integer;--> statement-breakpoint
CREATE INDEX `cost_events_allocation_group_idx` ON `cost_events` (`allocation_group_id`);--> statement-breakpoint

DROP TRIGGER `cost_events_shared_allocation_validate_insert`;--> statement-breakpoint
DROP TRIGGER `cost_events_shared_allocation_validate_update`;--> statement-breakpoint

INSERT INTO `cost_allocation_groups`
	(`id`,`shared_object_ref`,`allocation_version`,`allocation_method`,`stream`,`category`,`source_total_amount_micros`,`state`,`is_current`)
SELECT
	'legacy-allocation-' || lower(hex(`shared_object_ref` || char(31) || `allocation_version`)),
	`shared_object_ref`,
	`allocation_version`,
	`allocation_method`,
	`stream`,
	`category`,
	`shared_total_amount_micros`,
	'draft',
	0
FROM `cost_events`
WHERE `shared_object_ref` IS NOT NULL
	AND `allocation_method` IS NOT NULL
	AND `allocation_version` IS NOT NULL
	AND `allocation_share_bps` IS NOT NULL
	AND `shared_total_amount_micros` IS NOT NULL
GROUP BY `shared_object_ref`,`allocation_version`,`allocation_method`,`stream`,`category`,`shared_total_amount_micros`;--> statement-breakpoint

UPDATE `cost_events`
SET
	`allocation_group_id` = 'legacy-allocation-' || lower(hex(`shared_object_ref` || char(31) || `allocation_version`)),
	`allocation_remainder_micros` = 0
WHERE `shared_object_ref` IS NOT NULL
	AND `allocation_method` IS NOT NULL
	AND `allocation_version` IS NOT NULL
	AND `allocation_share_bps` IS NOT NULL
	AND `shared_total_amount_micros` IS NOT NULL;--> statement-breakpoint

CREATE TRIGGER `cost_events_shared_allocation_validate_insert`
BEFORE INSERT ON `cost_events`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_method` IS NOT NULL OR NEW.`allocation_version` IS NOT NULL
		OR NEW.`allocation_group_id` IS NOT NULL OR NEW.`allocation_share_bps` IS NOT NULL
		OR NEW.`shared_total_amount_micros` IS NOT NULL OR NEW.`allocation_remainder_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot carry allocation fields') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_method` IS NULL OR NEW.`allocation_version` IS NULL
		OR NEW.`allocation_group_id` IS NULL
		OR NEW.`allocation_share_bps` IS NULL OR NEW.`allocation_share_bps` <= 0
		OR NEW.`allocation_share_bps` > 10000
		OR NEW.`shared_total_amount_micros` IS NULL OR NEW.`shared_total_amount_micros` < 0
		OR NEW.`allocation_remainder_micros` NOT IN (0, 1)
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER) + NEW.`allocation_remainder_micros`
	) THEN RAISE(ABORT, 'shared allocation amount or share is invalid') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `allocation_group_id` = NEW.`allocation_group_id`
			AND (`shared_object_ref` <> NEW.`shared_object_ref`
				OR `allocation_version` <> NEW.`allocation_version`
				OR `allocation_method` <> NEW.`allocation_method`
				OR `shared_total_amount_micros` <> NEW.`shared_total_amount_micros`)
	) THEN RAISE(ABORT, 'shared allocation group identity mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND
		COALESCE((
			SELECT SUM(`allocation_share_bps`) FROM `cost_events`
			WHERE `allocation_group_id` = NEW.`allocation_group_id`
		), 0) + NEW.`allocation_share_bps` > 10000
		THEN RAISE(ABORT, 'shared allocation exceeds source total') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_shared_allocation_validate_update`
BEFORE UPDATE ON `cost_events`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_method` IS NOT NULL OR NEW.`allocation_version` IS NOT NULL
		OR NEW.`allocation_group_id` IS NOT NULL OR NEW.`allocation_share_bps` IS NOT NULL
		OR NEW.`shared_total_amount_micros` IS NOT NULL OR NEW.`allocation_remainder_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot carry allocation fields') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_method` IS NULL OR NEW.`allocation_version` IS NULL
		OR NEW.`allocation_group_id` IS NULL
		OR NEW.`allocation_share_bps` IS NULL OR NEW.`allocation_share_bps` <= 0
		OR NEW.`allocation_share_bps` > 10000
		OR NEW.`shared_total_amount_micros` IS NULL OR NEW.`shared_total_amount_micros` < 0
		OR NEW.`allocation_remainder_micros` NOT IN (0, 1)
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER) + NEW.`allocation_remainder_micros`
	) THEN RAISE(ABORT, 'shared allocation amount or share is invalid') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` <> OLD.`id`
			AND `allocation_group_id` = NEW.`allocation_group_id`
			AND (`shared_object_ref` <> NEW.`shared_object_ref`
				OR `allocation_version` <> NEW.`allocation_version`
				OR `allocation_method` <> NEW.`allocation_method`
				OR `shared_total_amount_micros` <> NEW.`shared_total_amount_micros`)
	) THEN RAISE(ABORT, 'shared allocation group identity mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND
		COALESCE((
			SELECT SUM(`allocation_share_bps`) FROM `cost_events`
			WHERE `id` <> OLD.`id`
				AND `allocation_group_id` = NEW.`allocation_group_id`
		), 0) + NEW.`allocation_share_bps` > 10000
		THEN RAISE(ABORT, 'shared allocation exceeds source total') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_allocation_groups_validate_insert`
BEFORE INSERT ON `cost_allocation_groups`
BEGIN
	SELECT CASE WHEN NEW.`state` <> 'draft' OR NEW.`is_current` <> 0 OR NEW.`reconciled_at` IS NOT NULL
		THEN RAISE(ABORT, 'allocation group must start as draft') END;
	SELECT CASE WHEN NEW.`supersedes_group_id` IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM `cost_allocation_groups`
		WHERE `id` = NEW.`supersedes_group_id`
			AND `shared_object_ref` = NEW.`shared_object_ref`
			AND `state` = 'reconciled' AND `is_current` = 1
	) THEN RAISE(ABORT, 'allocation supersession target must be the current source version') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_allocation_groups_validate_update`
BEFORE UPDATE ON `cost_allocation_groups`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT OLD.`shared_object_ref`
		OR NEW.`allocation_version` IS NOT OLD.`allocation_version`
		OR NEW.`allocation_method` IS NOT OLD.`allocation_method`
		OR NEW.`stream` IS NOT OLD.`stream`
		OR NEW.`category` IS NOT OLD.`category`
		OR NEW.`source_total_amount_micros` IS NOT OLD.`source_total_amount_micros`
		OR NEW.`supersedes_group_id` IS NOT OLD.`supersedes_group_id`
		THEN RAISE(ABORT, 'allocation group identity is immutable') END;
	SELECT CASE WHEN OLD.`state` = 'draft' AND NEW.`state` NOT IN ('draft', 'reconciled')
		THEN RAISE(ABORT, 'invalid allocation group transition') END;
	SELECT CASE WHEN OLD.`state` = 'reconciled' AND NEW.`state` NOT IN ('reconciled', 'superseded')
		THEN RAISE(ABORT, 'invalid allocation group transition') END;
	SELECT CASE WHEN OLD.`state` = 'superseded' AND NEW.`state` <> 'superseded'
		THEN RAISE(ABORT, 'invalid allocation group transition') END;
	SELECT CASE WHEN OLD.`reconciled_at` IS NOT NULL AND NEW.`reconciled_at` IS NOT OLD.`reconciled_at`
		THEN RAISE(ABORT, 'allocation reconciliation time is immutable') END;
	SELECT CASE WHEN NEW.`state` = 'reconciled' AND (
		NEW.`is_current` <> 1 OR NEW.`reconciled_at` IS NULL
		OR NOT EXISTS (SELECT 1 FROM `cost_events` WHERE `allocation_group_id` = OLD.`id`)
		OR COALESCE((SELECT SUM(`allocation_share_bps`) FROM `cost_events` WHERE `allocation_group_id` = OLD.`id`), 0) <> 10000
		OR COALESCE((SELECT SUM(`amount_micros`) FROM `cost_events` WHERE `allocation_group_id` = OLD.`id`), 0) <> NEW.`source_total_amount_micros`
	) THEN RAISE(ABORT, 'allocation group does not fully reconcile') END;
	SELECT CASE WHEN OLD.`state` = 'draft' AND NEW.`state` = 'reconciled'
		AND EXISTS (
			SELECT 1 FROM `cost_allocation_groups`
			WHERE `shared_object_ref` = OLD.`shared_object_ref` AND `id` <> OLD.`id`
		)
		AND (
			NEW.`supersedes_group_id` IS NULL OR NOT EXISTS (
				SELECT 1 FROM `cost_allocation_groups`
				WHERE `id` = NEW.`supersedes_group_id`
					AND `shared_object_ref` = OLD.`shared_object_ref`
					AND `state` = 'superseded' AND `is_current` = 0
			)
		)
		THEN RAISE(ABORT, 'new allocation version must supersede the prior source version') END;
	SELECT CASE WHEN NEW.`state` = 'superseded' AND (
		OLD.`state` <> 'reconciled' OR NEW.`is_current` <> 0 OR NEW.`reconciled_at` IS NULL
	) THEN RAISE(ABORT, 'only a reconciled allocation can be superseded') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_allocation_group_validate_insert`
BEFORE INSERT ON `cost_events`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_group_id` IS NOT NULL OR NEW.`allocation_remainder_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot reference an allocation group') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_group_id` IS NULL OR NEW.`allocation_remainder_micros` NOT IN (0, 1)
		OR NOT EXISTS (
			SELECT 1 FROM `cost_allocation_groups`
			WHERE `id` = NEW.`allocation_group_id`
				AND `state` = 'draft' AND `is_current` = 0
				AND `shared_object_ref` = NEW.`shared_object_ref`
				AND `allocation_version` = NEW.`allocation_version`
				AND `allocation_method` = NEW.`allocation_method`
				AND `stream` = NEW.`stream`
				AND `category` = NEW.`category`
				AND `source_total_amount_micros` = NEW.`shared_total_amount_micros`
		)
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER) + NEW.`allocation_remainder_micros`
	) THEN RAISE(ABORT, 'cost allocation group mismatch') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_allocation_group_validate_update`
BEFORE UPDATE ON `cost_events`
BEGIN
	SELECT CASE WHEN OLD.`allocation_group_id` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_allocation_groups`
		WHERE `id` = OLD.`allocation_group_id` AND `state` <> 'draft'
	) THEN RAISE(ABORT, 'reconciled allocation rows are immutable') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_group_id` IS NOT NULL OR NEW.`allocation_remainder_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot reference an allocation group') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_group_id` IS NULL OR NEW.`allocation_remainder_micros` NOT IN (0, 1)
		OR NOT EXISTS (
			SELECT 1 FROM `cost_allocation_groups`
			WHERE `id` = NEW.`allocation_group_id`
				AND `state` = 'draft' AND `is_current` = 0
				AND `shared_object_ref` = NEW.`shared_object_ref`
				AND `allocation_version` = NEW.`allocation_version`
				AND `allocation_method` = NEW.`allocation_method`
				AND `stream` = NEW.`stream`
				AND `category` = NEW.`category`
				AND `source_total_amount_micros` = NEW.`shared_total_amount_micros`
		)
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER) + NEW.`allocation_remainder_micros`
	) THEN RAISE(ABORT, 'cost allocation group mismatch') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_allocation_group_validate_delete`
BEFORE DELETE ON `cost_events`
WHEN OLD.`allocation_group_id` IS NOT NULL AND EXISTS (
	SELECT 1 FROM `cost_allocation_groups`
	WHERE `id` = OLD.`allocation_group_id` AND `state` <> 'draft'
)
BEGIN
	SELECT RAISE(ABORT, 'reconciled allocation rows are immutable');
END;
