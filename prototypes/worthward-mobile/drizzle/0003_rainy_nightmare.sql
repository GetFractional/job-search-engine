ALTER TABLE `cost_events` ADD `allocation_share_bps` integer;--> statement-breakpoint
ALTER TABLE `cost_events` ADD `shared_total_amount_micros` integer;--> statement-breakpoint

CREATE TABLE `__new_usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`provider` text,
	`model` text,
	`policy_version` text,
	`latency_ms` integer,
	`variable_cost_micros` integer,
	`result_state` text NOT NULL,
	`correction_state` text,
	`cohort` text,
	`cost_event_id` text,
	`workload_ref` text,
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`,`cost_event_id`) REFERENCES `cost_events`(`user_id`,`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT `usage_events_cost_event_user_check` CHECK(`cost_event_id` IS NULL OR `user_id` IS NOT NULL)
);--> statement-breakpoint
INSERT INTO `__new_usage_events`
	(`id`,`user_id`,`action`,`provider`,`model`,`policy_version`,`latency_ms`,`variable_cost_micros`,`result_state`,`correction_state`,`cohort`,`cost_event_id`,`workload_ref`,`metadata_json`,`created_at`)
SELECT
	`id`,`user_id`,`action`,`provider`,`model`,`policy_version`,`latency_ms`,`variable_cost_micros`,`result_state`,`correction_state`,`cohort`,`cost_event_id`,`workload_ref`,`metadata_json`,`created_at`
FROM `usage_events`;--> statement-breakpoint
DROP TABLE `usage_events`;--> statement-breakpoint
ALTER TABLE `__new_usage_events` RENAME TO `usage_events`;--> statement-breakpoint
CREATE INDEX `usage_events_action_created_idx` ON `usage_events` (`action`,`created_at`);--> statement-breakpoint
CREATE INDEX `usage_events_user_created_idx` ON `usage_events` (`user_id`,`created_at`);--> statement-breakpoint

CREATE UNIQUE INDEX `cost_events_one_processor_per_order_unique`
ON `cost_events` (`order_id`)
WHERE `category` = 'processor' AND `order_id` IS NOT NULL;--> statement-breakpoint

CREATE TRIGGER `cost_events_shared_allocation_validate_insert`
BEFORE INSERT ON `cost_events`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_method` IS NOT NULL OR NEW.`allocation_version` IS NOT NULL
		OR NEW.`allocation_share_bps` IS NOT NULL OR NEW.`shared_total_amount_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot carry allocation fields') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_method` IS NULL OR NEW.`allocation_version` IS NULL
		OR NEW.`allocation_share_bps` IS NULL OR NEW.`allocation_share_bps` <= 0
		OR NEW.`allocation_share_bps` > 10000
		OR NEW.`shared_total_amount_micros` IS NULL OR NEW.`shared_total_amount_micros` < 0
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER)
	) THEN RAISE(ABORT, 'shared allocation amount or share is invalid') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `shared_object_ref` = NEW.`shared_object_ref`
			AND `allocation_version` = NEW.`allocation_version`
			AND `shared_total_amount_micros` <> NEW.`shared_total_amount_micros`
	) THEN RAISE(ABORT, 'shared allocation source total mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `shared_object_ref` = NEW.`shared_object_ref`
			AND `allocation_version` = NEW.`allocation_version`
			AND `allocation_method` <> NEW.`allocation_method`
	) THEN RAISE(ABORT, 'shared allocation method mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND
		COALESCE((
			SELECT SUM(`allocation_share_bps`) FROM `cost_events`
			WHERE `shared_object_ref` = NEW.`shared_object_ref`
				AND `allocation_version` = NEW.`allocation_version`
		), 0) + NEW.`allocation_share_bps` > 10000
		THEN RAISE(ABORT, 'shared allocation exceeds source total') END;
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_shared_allocation_validate_update`
BEFORE UPDATE ON `cost_events`
BEGIN
	SELECT CASE WHEN NEW.`shared_object_ref` IS NULL AND (
		NEW.`allocation_method` IS NOT NULL OR NEW.`allocation_version` IS NOT NULL
		OR NEW.`allocation_share_bps` IS NOT NULL OR NEW.`shared_total_amount_micros` IS NOT NULL
	) THEN RAISE(ABORT, 'non-shared cost cannot carry allocation fields') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_method` IS NULL OR NEW.`allocation_version` IS NULL
		OR NEW.`allocation_share_bps` IS NULL OR NEW.`allocation_share_bps` <= 0
		OR NEW.`allocation_share_bps` > 10000
		OR NEW.`shared_total_amount_micros` IS NULL OR NEW.`shared_total_amount_micros` < 0
		OR NEW.`amount_micros` <> CAST((NEW.`shared_total_amount_micros` * NEW.`allocation_share_bps`) / 10000 AS INTEGER)
	) THEN RAISE(ABORT, 'shared allocation amount or share is invalid') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` <> OLD.`id`
			AND `shared_object_ref` = NEW.`shared_object_ref`
			AND `allocation_version` = NEW.`allocation_version`
			AND `shared_total_amount_micros` <> NEW.`shared_total_amount_micros`
	) THEN RAISE(ABORT, 'shared allocation source total mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` <> OLD.`id`
			AND `shared_object_ref` = NEW.`shared_object_ref`
			AND `allocation_version` = NEW.`allocation_version`
			AND `allocation_method` <> NEW.`allocation_method`
	) THEN RAISE(ABORT, 'shared allocation method mismatch') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND
		COALESCE((
			SELECT SUM(`allocation_share_bps`) FROM `cost_events`
			WHERE `id` <> OLD.`id`
				AND `shared_object_ref` = NEW.`shared_object_ref`
				AND `allocation_version` = NEW.`allocation_version`
		), 0) + NEW.`allocation_share_bps` > 10000
		THEN RAISE(ABORT, 'shared allocation exceeds source total') END;
END;

--> statement-breakpoint
CREATE TRIGGER `usage_events_validate_cost_insert`
BEFORE INSERT ON `usage_events`
WHEN NEW.`cost_event_id` IS NOT NULL
BEGIN
	SELECT CASE WHEN NEW.`user_id` IS NULL OR NOT EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` = NEW.`cost_event_id` AND `user_id` = NEW.`user_id`
	) THEN RAISE(ABORT, 'usage cost event tenant mismatch') END;
	SELECT CASE WHEN NEW.`workload_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` = NEW.`cost_event_id` AND `workload_ref` IS NOT NULL
			AND `workload_ref` <> NEW.`workload_ref`
	) THEN RAISE(ABORT, 'usage workload mismatch') END;
END;--> statement-breakpoint

CREATE TRIGGER `usage_events_validate_cost_update`
BEFORE UPDATE ON `usage_events`
WHEN NEW.`cost_event_id` IS NOT NULL
BEGIN
	SELECT CASE WHEN NEW.`user_id` IS NULL OR NOT EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` = NEW.`cost_event_id` AND `user_id` = NEW.`user_id`
	) THEN RAISE(ABORT, 'usage cost event tenant mismatch') END;
	SELECT CASE WHEN NEW.`workload_ref` IS NOT NULL AND EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `id` = NEW.`cost_event_id` AND `workload_ref` IS NOT NULL
			AND `workload_ref` <> NEW.`workload_ref`
	) THEN RAISE(ABORT, 'usage workload mismatch') END;
END;
