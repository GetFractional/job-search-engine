CREATE UNIQUE INDEX `cost_events_user_id_unique`
ON `cost_events` (`user_id`,`id`);--> statement-breakpoint

CREATE UNIQUE INDEX `cost_events_shared_allocation_unique`
ON `cost_events` (
	`shared_object_ref`,
	`allocation_version`,
	ifnull(`allocated_offer_version_id`, ''),
	ifnull(`cohort_membership_id`, ''),
	ifnull(`order_id`, '')
)
WHERE `shared_object_ref` IS NOT NULL;--> statement-breakpoint

CREATE UNIQUE INDEX `revenue_schedule_one_reconciled_per_order_unique`
ON `revenue_schedule` (`order_id`)
WHERE `close_state` = 'reconciled';--> statement-breakpoint

CREATE TRIGGER `offer_versions_validate_insert`
BEFORE INSERT ON `offer_versions`
BEGIN
	SELECT CASE WHEN NEW.`stream` NOT IN ('software', 'affiliate', 'human_service')
		THEN RAISE(ABORT, 'invalid offer stream') END;
	SELECT CASE WHEN NEW.`billing_type` NOT IN ('free', 'monthly', 'prepaid_term', 'one_time', 'commission')
		THEN RAISE(ABORT, 'invalid offer billing type') END;
	SELECT CASE WHEN NEW.`approval_state` NOT IN ('hypothesis', 'board_approved_private_test', 'active_private_test', 'paused', 'retired')
		THEN RAISE(ABORT, 'invalid offer approval state') END;
	SELECT CASE WHEN NEW.`approval_state` IN ('board_approved_private_test', 'active_private_test')
		AND (NEW.`board_decision_ref` IS NULL OR length(trim(NEW.`board_decision_ref`)) = 0)
		THEN RAISE(ABORT, 'board decision reference required') END;
	SELECT CASE WHEN NEW.`approval_state` = 'active_private_test' AND NEW.`effective_at` IS NULL
		THEN RAISE(ABORT, 'active offer effective time required') END;
END;--> statement-breakpoint

CREATE TRIGGER `offer_versions_validate_update`
BEFORE UPDATE ON `offer_versions`
BEGIN
	SELECT CASE WHEN OLD.`approval_state` = 'board_approved_private_test'
		AND NEW.`approval_state` NOT IN ('board_approved_private_test', 'active_private_test', 'paused', 'retired')
		THEN RAISE(ABORT, 'offer approval history is immutable') END;
	SELECT CASE WHEN OLD.`approval_state` = 'active_private_test'
		AND NEW.`approval_state` NOT IN ('active_private_test', 'paused', 'retired')
		THEN RAISE(ABORT, 'offer approval history is immutable') END;
	SELECT CASE WHEN OLD.`approval_state` = 'paused'
		AND NEW.`approval_state` NOT IN ('paused', 'retired')
		THEN RAISE(ABORT, 'offer approval history is immutable') END;
	SELECT CASE WHEN OLD.`approval_state` = 'retired' AND NEW.`approval_state` <> 'retired'
		THEN RAISE(ABORT, 'offer approval history is immutable') END;
	SELECT CASE WHEN OLD.`approval_state` <> 'hypothesis'
		AND NEW.`board_decision_ref` IS NOT OLD.`board_decision_ref`
		THEN RAISE(ABORT, 'offer Board reference is immutable') END;
	SELECT CASE WHEN OLD.`effective_at` IS NOT NULL AND NEW.`effective_at` IS NOT OLD.`effective_at`
		THEN RAISE(ABORT, 'offer effective time is immutable') END;
	SELECT CASE WHEN (
		NEW.`stream` IS NOT OLD.`stream` OR NEW.`offer_key` IS NOT OLD.`offer_key`
		OR NEW.`version` IS NOT OLD.`version` OR NEW.`currency` IS NOT OLD.`currency`
		OR NEW.`price_minor` IS NOT OLD.`price_minor` OR NEW.`billing_type` IS NOT OLD.`billing_type`
		OR NEW.`term_days` IS NOT OLD.`term_days` OR NEW.`renewal_behavior` IS NOT OLD.`renewal_behavior`
		OR NEW.`refund_policy_version` IS NOT OLD.`refund_policy_version`
	) AND (
		EXISTS (SELECT 1 FROM `cohort_memberships` WHERE `offer_version_id` = OLD.`id` OR `converted_offer_version_id` = OLD.`id`)
		OR EXISTS (SELECT 1 FROM `orders_charges` WHERE `offer_version_id` = OLD.`id`)
		OR EXISTS (SELECT 1 FROM `cost_events` WHERE `allocated_offer_version_id` = OLD.`id`)
		OR EXISTS (SELECT 1 FROM `subscriptions` WHERE `offer_version_id` = OLD.`id`)
	) THEN RAISE(ABORT, 'referenced offer economics are immutable; create a new version') END;
	SELECT CASE WHEN NEW.`stream` NOT IN ('software', 'affiliate', 'human_service')
		THEN RAISE(ABORT, 'invalid offer stream') END;
	SELECT CASE WHEN NEW.`billing_type` NOT IN ('free', 'monthly', 'prepaid_term', 'one_time', 'commission')
		THEN RAISE(ABORT, 'invalid offer billing type') END;
	SELECT CASE WHEN NEW.`approval_state` NOT IN ('hypothesis', 'board_approved_private_test', 'active_private_test', 'paused', 'retired')
		THEN RAISE(ABORT, 'invalid offer approval state') END;
	SELECT CASE WHEN NEW.`approval_state` IN ('board_approved_private_test', 'active_private_test')
		AND (NEW.`board_decision_ref` IS NULL OR length(trim(NEW.`board_decision_ref`)) = 0)
		THEN RAISE(ABORT, 'board decision reference required') END;
	SELECT CASE WHEN NEW.`approval_state` = 'active_private_test' AND NEW.`effective_at` IS NULL
		THEN RAISE(ABORT, 'active offer effective time required') END;
END;--> statement-breakpoint

CREATE TRIGGER `cohort_memberships_validate_insert`
BEFORE INSERT ON `cohort_memberships`
BEGIN
	SELECT CASE WHEN NEW.`eligibility_state` NOT IN ('eligible', 'excluded')
		OR NEW.`terminal_state` NOT IN ('open', 'converted', 'matured_unconverted', 'cancelled', 'refunded')
		THEN RAISE(ABORT, 'invalid cohort state') END;
	SELECT CASE WHEN (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`offer_version_id`) <> 'software'
		THEN RAISE(ABORT, 'cohort offer must be software') END;
	SELECT CASE WHEN NEW.`converted_offer_version_id` IS NOT NULL
		AND (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`converted_offer_version_id`) <> 'software'
		THEN RAISE(ABORT, 'converted cohort offer must be software') END;
END;--> statement-breakpoint

CREATE TRIGGER `cohort_memberships_validate_update`
BEFORE UPDATE ON `cohort_memberships`
BEGIN
	SELECT CASE WHEN (NEW.`user_id` IS NOT OLD.`user_id` OR NEW.`offer_version_id` IS NOT OLD.`offer_version_id`)
		AND (
			EXISTS (SELECT 1 FROM `orders_charges` WHERE `cohort_membership_id` = OLD.`id`)
			OR EXISTS (SELECT 1 FROM `cost_events` WHERE `cohort_membership_id` = OLD.`id`)
		)
		THEN RAISE(ABORT, 'referenced cohort identity is immutable') END;
	SELECT CASE WHEN NEW.`eligibility_state` NOT IN ('eligible', 'excluded')
		OR NEW.`terminal_state` NOT IN ('open', 'converted', 'matured_unconverted', 'cancelled', 'refunded')
		THEN RAISE(ABORT, 'invalid cohort state') END;
	SELECT CASE WHEN (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`offer_version_id`) <> 'software'
		THEN RAISE(ABORT, 'cohort offer must be software') END;
	SELECT CASE WHEN NEW.`converted_offer_version_id` IS NOT NULL
		AND (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`converted_offer_version_id`) <> 'software'
		THEN RAISE(ABORT, 'converted cohort offer must be software') END;
END;--> statement-breakpoint

CREATE TRIGGER `orders_charges_validate_insert`
BEFORE INSERT ON `orders_charges`
BEGIN
	SELECT CASE WHEN (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`offer_version_id`) NOT IN ('software', 'human_service')
		THEN RAISE(ABORT, 'affiliate revenue belongs in affiliate_events') END;
	SELECT CASE WHEN NEW.`cohort_membership_id` IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM `cohort_memberships`
		WHERE `id` = NEW.`cohort_membership_id`
			AND `user_id` = NEW.`user_id`
			AND `offer_version_id` = NEW.`offer_version_id`
	) THEN RAISE(ABORT, 'order cohort offer mismatch') END;
	SELECT CASE WHEN NEW.`renewal_state` NOT IN ('none', 'opted_in', 'automatic', 'cancelled')
		OR NEW.`settlement_state` NOT IN ('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'disputed', 'failed')
		THEN RAISE(ABORT, 'invalid order state') END;
	SELECT CASE WHEN NEW.`discount_amount_minor` > NEW.`gross_amount_minor`
		OR NEW.`cash_collected_minor` > (NEW.`gross_amount_minor` - NEW.`discount_amount_minor` + NEW.`tax_amount_minor`)
		OR (NEW.`refund_amount_minor` + NEW.`credit_amount_minor` + NEW.`chargeback_amount_minor`) > NEW.`cash_collected_minor`
		THEN RAISE(ABORT, 'order amount reconciliation failed') END;
END;--> statement-breakpoint

CREATE TRIGGER `orders_charges_validate_update`
BEFORE UPDATE ON `orders_charges`
BEGIN
	SELECT CASE WHEN EXISTS (SELECT 1 FROM `revenue_schedule` WHERE `order_id` = OLD.`id`) AND (
		NEW.`id` IS NOT OLD.`id` OR NEW.`user_id` IS NOT OLD.`user_id`
		OR NEW.`offer_version_id` IS NOT OLD.`offer_version_id`
		OR NEW.`cohort_membership_id` IS NOT OLD.`cohort_membership_id`
		OR NEW.`currency` IS NOT OLD.`currency`
		OR NEW.`gross_amount_minor` IS NOT OLD.`gross_amount_minor`
		OR NEW.`discount_amount_minor` IS NOT OLD.`discount_amount_minor`
		OR NEW.`tax_amount_minor` IS NOT OLD.`tax_amount_minor`
		OR NEW.`cash_collected_minor` IS NOT OLD.`cash_collected_minor`
		OR NEW.`refund_amount_minor` IS NOT OLD.`refund_amount_minor`
		OR NEW.`credit_amount_minor` IS NOT OLD.`credit_amount_minor`
		OR NEW.`chargeback_amount_minor` IS NOT OLD.`chargeback_amount_minor`
		OR NEW.`service_starts_at` IS NOT OLD.`service_starts_at`
		OR NEW.`service_ends_at` IS NOT OLD.`service_ends_at`
	) THEN RAISE(ABORT, 'scheduled order economics are immutable; record an adjustment') END;
	SELECT CASE WHEN EXISTS (
		SELECT 1 FROM `cost_events`
		WHERE `order_id` = OLD.`id` AND `category` = 'processor'
	) AND NEW.`processor_fee_micros` <> (
		SELECT `amount_micros` FROM `cost_events`
		WHERE `order_id` = OLD.`id` AND `category` = 'processor'
		ORDER BY `created_at` DESC LIMIT 1
	) THEN RAISE(ABORT, 'processor fee must reconcile to its cost event') END;
	SELECT CASE WHEN (SELECT `stream` FROM `offer_versions` WHERE `id` = NEW.`offer_version_id`) NOT IN ('software', 'human_service')
		THEN RAISE(ABORT, 'affiliate revenue belongs in affiliate_events') END;
	SELECT CASE WHEN NEW.`cohort_membership_id` IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM `cohort_memberships`
		WHERE `id` = NEW.`cohort_membership_id`
			AND `user_id` = NEW.`user_id`
			AND `offer_version_id` = NEW.`offer_version_id`
	) THEN RAISE(ABORT, 'order cohort offer mismatch') END;
	SELECT CASE WHEN NEW.`renewal_state` NOT IN ('none', 'opted_in', 'automatic', 'cancelled')
		OR NEW.`settlement_state` NOT IN ('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'disputed', 'failed')
		THEN RAISE(ABORT, 'invalid order state') END;
	SELECT CASE WHEN NEW.`discount_amount_minor` > NEW.`gross_amount_minor`
		OR NEW.`cash_collected_minor` > (NEW.`gross_amount_minor` - NEW.`discount_amount_minor` + NEW.`tax_amount_minor`)
		OR (NEW.`refund_amount_minor` + NEW.`credit_amount_minor` + NEW.`chargeback_amount_minor`) > NEW.`cash_collected_minor`
		THEN RAISE(ABORT, 'order amount reconciliation failed') END;
END;--> statement-breakpoint

CREATE TRIGGER `revenue_schedule_validate_insert`
BEFORE INSERT ON `revenue_schedule`
BEGIN
	SELECT CASE WHEN EXISTS (
		SELECT 1 FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `close_state` = 'reconciled'
	) THEN RAISE(ABORT, 'reconciled revenue schedule is closed') END;
	SELECT CASE WHEN NEW.`stream` <> (
		SELECT ov.`stream`
		FROM `orders_charges` oc
		JOIN `offer_versions` ov ON ov.`id` = oc.`offer_version_id`
		WHERE oc.`id` = NEW.`order_id`
	) THEN RAISE(ABORT, 'revenue stream mismatch') END;
	SELECT CASE WHEN NEW.`close_state` NOT IN ('open', 'closed', 'reconciled')
		THEN RAISE(ABORT, 'invalid revenue state') END;
	SELECT CASE WHEN NEW.`recognition_period` NOT GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
		OR CAST(substr(NEW.`recognition_period`, 6, 2) AS INTEGER) NOT BETWEEN 1 AND 12
		THEN RAISE(ABORT, 'invalid recognition period') END;
	SELECT CASE WHEN COALESCE((SELECT SUM(`cash_collected_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`cash_collected_minor` > (
		SELECT max(`cash_collected_minor` - `tax_amount_minor`, 0) FROM `orders_charges` WHERE `id` = NEW.`order_id`
	) THEN RAISE(ABORT, 'scheduled cash exceeds order') END;
	SELECT CASE WHEN COALESCE((SELECT SUM(`recognized_revenue_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`recognized_revenue_minor` > (
		SELECT `gross_amount_minor` - `discount_amount_minor` - `refund_amount_minor` - `credit_amount_minor` - `chargeback_amount_minor`
		FROM `orders_charges` WHERE `id` = NEW.`order_id`
	) THEN RAISE(ABORT, 'recognized revenue exceeds order') END;
	SELECT CASE WHEN COALESCE((SELECT SUM(`refund_reversal_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`refund_reversal_minor` > (
		SELECT `refund_amount_minor` + `credit_amount_minor` + `chargeback_amount_minor`
		FROM `orders_charges` WHERE `id` = NEW.`order_id`
	) THEN RAISE(ABORT, 'refund reversal exceeds order') END;
	SELECT CASE WHEN NOT EXISTS (
		SELECT 1 FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `recognition_period` < NEW.`recognition_period`
	) AND NEW.`opening_deferred_minor` <> 0
		THEN RAISE(ABORT, 'first revenue period must open at zero') END;
	SELECT CASE WHEN EXISTS (
		SELECT 1 FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `recognition_period` < NEW.`recognition_period`
	) AND NEW.`opening_deferred_minor` <> (
		SELECT `closing_deferred_minor` FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `recognition_period` < NEW.`recognition_period`
		ORDER BY `recognition_period` DESC LIMIT 1
	) THEN RAISE(ABORT, 'revenue period opening balance mismatch') END;
	SELECT CASE WHEN EXISTS (
		SELECT 1 FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `recognition_period` > NEW.`recognition_period`
	) AND NEW.`closing_deferred_minor` <> (
		SELECT `opening_deferred_minor` FROM `revenue_schedule`
		WHERE `order_id` = NEW.`order_id` AND `recognition_period` > NEW.`recognition_period`
		ORDER BY `recognition_period` ASC LIMIT 1
	) THEN RAISE(ABORT, 'revenue period closing balance mismatch') END;
	SELECT CASE WHEN NEW.`close_state` = 'reconciled' AND (
		NEW.`closing_deferred_minor` <> 0
		OR EXISTS (SELECT 1 FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id` AND `recognition_period` > NEW.`recognition_period`)
		OR COALESCE((SELECT SUM(`cash_collected_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`cash_collected_minor` <> (SELECT max(`cash_collected_minor` - `tax_amount_minor`, 0) FROM `orders_charges` WHERE `id` = NEW.`order_id`)
		OR COALESCE((SELECT SUM(`recognized_revenue_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`recognized_revenue_minor` <> (SELECT `gross_amount_minor` - `discount_amount_minor` - `refund_amount_minor` - `credit_amount_minor` - `chargeback_amount_minor` FROM `orders_charges` WHERE `id` = NEW.`order_id`)
		OR COALESCE((SELECT SUM(`refund_reversal_minor`) FROM `revenue_schedule` WHERE `order_id` = NEW.`order_id`), 0) + NEW.`refund_reversal_minor` <> (SELECT `refund_amount_minor` + `credit_amount_minor` + `chargeback_amount_minor` FROM `orders_charges` WHERE `id` = NEW.`order_id`)
	) THEN RAISE(ABORT, 'revenue schedule is not fully reconciled') END;
END;--> statement-breakpoint

CREATE TRIGGER `revenue_schedule_immutable`
BEFORE UPDATE ON `revenue_schedule`
BEGIN
	SELECT RAISE(ABORT, 'revenue schedule rows are append-only');
END;--> statement-breakpoint

CREATE TRIGGER `revenue_schedule_delete_latest_open_only`
BEFORE DELETE ON `revenue_schedule`
WHEN OLD.`close_state` <> 'open' OR EXISTS (
	SELECT 1 FROM `revenue_schedule`
	WHERE `order_id` = OLD.`order_id` AND `recognition_period` > OLD.`recognition_period`
)
BEGIN
	SELECT RAISE(ABORT, 'only the latest open revenue row may be deleted');
END;--> statement-breakpoint

CREATE TRIGGER `cost_events_validate_insert`
BEFORE INSERT ON `cost_events`
BEGIN
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
