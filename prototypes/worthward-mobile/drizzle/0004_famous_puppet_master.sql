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
	AND `shared_total_amount_micros` IS NOT NULL;
