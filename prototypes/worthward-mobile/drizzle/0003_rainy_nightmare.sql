ALTER TABLE `cost_events` ADD `allocation_share_bps` integer;--> statement-breakpoint
ALTER TABLE `cost_events` ADD `shared_total_amount_micros` integer;--> statement-breakpoint

-- D1 validates stored trigger bodies between migration statements. Remove the
-- cross-table trigger before rebuilding usage_events, then restore it after the
-- replacement table is in place.
DROP TRIGGER IF EXISTS `cost_events_validate_update`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `usage_events_validate_cost_insert`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `usage_events_validate_cost_update`;--> statement-breakpoint

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

CREATE TRIGGER `cost_events_validate_update`
BEFORE UPDATE ON `cost_events`
BEGIN
	SELECT CASE WHEN (NEW.`id` IS NOT OLD.`id` OR NEW.`user_id` IS NOT OLD.`user_id`)
		AND EXISTS (SELECT 1 FROM `usage_events` WHERE `cost_event_id` = OLD.`id`)
		THEN RAISE(ABORT, 'referenced cost-event identity is immutable') END;
	SELECT CASE WHEN NEW.`stream` NOT IN ('software', 'affiliate', 'human_service')
		OR NEW.`estimate_state` NOT IN ('estimated', 'actual', 'reconciled')
		OR NEW.`cash_state` NOT IN ('cash', 'noncash')
		OR NEW.`category` NOT IN ('source_data', 'rendering', 'model_stage_a', 'model_stage_b', 'adjudication', 'retry_validation', 'storage', 'egress', 'queue', 'email', 'push', 'sms', 'processor', 'dispute', 'support', 'correction_rework', 'trust_recovery', 'human_fulfillment', 'acquisition', 'other')
		THEN RAISE(ABORT, 'invalid cost event state') END;
	SELECT CASE WHEN NEW.`amount_micros` <> CAST((NEW.`units_micros` * NEW.`rate_micros_per_unit`) / 1000000 AS INTEGER)
		THEN RAISE(ABORT, 'cost amount does not match units and rate') END;
	SELECT CASE WHEN NEW.`shared_object_ref` IS NOT NULL AND (
		NEW.`allocation_method` IS NULL OR NEW.`allocation_version` IS NULL OR
		(NEW.`allocated_offer_version_id` IS NULL AND NEW.`cohort_membership_id` IS NULL AND NEW.`order_id` IS NULL)
	) THEN RAISE(ABORT, 'shared cost allocation is incomplete') END;
	SELECT CASE WHEN NEW.`allocated_offer_version_id` IS NOT NULL
		AND (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`allocated_offer_version_id`) <> NEW.`stream`
		THEN RAISE(ABORT, 'cost offer stream mismatch') END;
	SELECT CASE WHEN NEW.`order_id` IS NOT NULL AND (
		NEW.`user_id` IS NULL OR NOT EXISTS (
			SELECT 1 FROM `orders_charges` oc
			JOIN `offer_versions` ov ON ov.`id` = oc.`offer_version_id`
			WHERE oc.`id` = NEW.`order_id` AND oc.`user_id` = NEW.`user_id`
				AND ov.`stream` = NEW.`stream`
				AND (NEW.`allocated_offer_version_id` IS NULL OR oc.`offer_version_id` = NEW.`allocated_offer_version_id`)
		)
	) THEN RAISE(ABORT, 'cost order tenant or stream mismatch') END;
	SELECT CASE WHEN NEW.`cohort_membership_id` IS NOT NULL AND (
		NEW.`user_id` IS NULL OR NOT EXISTS (
			SELECT 1 FROM `cohort_memberships` cm
			JOIN `offer_versions` ov ON ov.`id` = cm.`offer_version_id`
			WHERE cm.`id` = NEW.`cohort_membership_id` AND cm.`user_id` = NEW.`user_id`
				AND ov.`stream` = NEW.`stream`
				AND (NEW.`allocated_offer_version_id` IS NULL OR cm.`offer_version_id` = NEW.`allocated_offer_version_id`)
		)
	) THEN RAISE(ABORT, 'cost cohort tenant or stream mismatch') END;
	SELECT CASE WHEN NEW.`order_id` IS NOT NULL AND NEW.`cohort_membership_id` IS NOT NULL
		AND (SELECT `cohort_membership_id` FROM `orders_charges` WHERE `id` = NEW.`order_id`) <> NEW.`cohort_membership_id`
		THEN RAISE(ABORT, 'cost order cohort mismatch') END;
	SELECT CASE WHEN NEW.`category` = 'processor' AND NEW.`order_id` IS NOT NULL
		AND NEW.`amount_micros` <> (SELECT `processor_fee_micros` FROM `orders_charges` WHERE `id` = NEW.`order_id`)
		THEN RAISE(ABORT, 'processor cost must reconcile to order source field') END;
END;--> statement-breakpoint

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
