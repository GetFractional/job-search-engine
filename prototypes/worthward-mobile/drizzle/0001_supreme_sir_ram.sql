CREATE TABLE `affiliate_events` (
	`id` text PRIMARY KEY NOT NULL,
	`partner_key` text NOT NULL,
	`program_version` text NOT NULL,
	`referral_reference` text,
	`user_id` text,
	`event_type` text NOT NULL,
	`event_at` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`commission_basis_minor` integer DEFAULT 0 NOT NULL,
	`commission_rate_bps` integer,
	`gross_earned_minor` integer DEFAULT 0 NOT NULL,
	`refund_clawback_minor` integer DEFAULT 0 NOT NULL,
	`net_payable_minor` integer DEFAULT 0 NOT NULL,
	`payout_state` text DEFAULT 'pending' NOT NULL,
	`payout_at` integer,
	`disclosure_version` text NOT NULL,
	`complaint_state` text DEFAULT 'none' NOT NULL,
	`cannibalization_state` text DEFAULT 'unknown' NOT NULL,
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "affiliate_events_nonnegative_check" CHECK("affiliate_events"."commission_basis_minor" >= 0 AND "affiliate_events"."gross_earned_minor" >= 0 AND "affiliate_events"."refund_clawback_minor" >= 0 AND "affiliate_events"."net_payable_minor" >= 0 AND ("affiliate_events"."commission_rate_bps" IS NULL OR ("affiliate_events"."commission_rate_bps" >= 0 AND "affiliate_events"."commission_rate_bps" <= 10000)))
);
--> statement-breakpoint
CREATE INDEX `affiliate_events_partner_event_idx` ON `affiliate_events` (`partner_key`,`event_type`,`event_at`);--> statement-breakpoint
CREATE TABLE `cohort_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`offer_version_id` text NOT NULL,
	`price_test_key` text,
	`acquisition_source` text NOT NULL,
	`campaign_key` text,
	`entered_at` integer NOT NULL,
	`converted_at` integer,
	`converted_offer_version_id` text,
	`matures_at` integer NOT NULL,
	`observation_window_days` integer NOT NULL,
	`eligibility_state` text DEFAULT 'eligible' NOT NULL,
	`exclusion_reason` text,
	`terminal_state` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`offer_version_id`) REFERENCES `offer_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`converted_offer_version_id`) REFERENCES `offer_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "cohort_memberships_window_positive_check" CHECK("cohort_memberships"."observation_window_days" > 0),
	CONSTRAINT "cohort_memberships_exclusion_reason_check" CHECK(("cohort_memberships"."eligibility_state" = 'eligible' AND "cohort_memberships"."exclusion_reason" IS NULL) OR ("cohort_memberships"."eligibility_state" = 'excluded' AND "cohort_memberships"."exclusion_reason" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cohort_memberships_user_id_unique` ON `cohort_memberships` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `cohort_memberships_offer_maturity_idx` ON `cohort_memberships` (`offer_version_id`,`matures_at`,`terminal_state`);--> statement-breakpoint
CREATE TABLE `cost_events` (
	`id` text PRIMARY KEY NOT NULL,
	`stream` text NOT NULL,
	`category` text NOT NULL,
	`unit_name` text NOT NULL,
	`units_micros` integer NOT NULL,
	`rate_micros_per_unit` integer NOT NULL,
	`amount_micros` integer NOT NULL,
	`estimate_state` text NOT NULL,
	`cash_state` text NOT NULL,
	`vendor` text,
	`rate_card_version` text NOT NULL,
	`user_id` text,
	`order_id` text,
	`workload_ref` text,
	`shared_object_ref` text,
	`allocation_method` text,
	`allocation_version` text,
	`allocated_offer_version_id` text,
	`cohort_membership_id` text,
	`incurred_at` integer NOT NULL,
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`allocated_offer_version_id`) REFERENCES `offer_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`order_id`) REFERENCES `orders_charges`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`cohort_membership_id`) REFERENCES `cohort_memberships`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "cost_events_nonnegative_check" CHECK("cost_events"."units_micros" >= 0 AND "cost_events"."rate_micros_per_unit" >= 0 AND "cost_events"."amount_micros" >= 0),
	CONSTRAINT "cost_events_shared_allocation_check" CHECK("cost_events"."shared_object_ref" IS NULL OR ("cost_events"."allocation_method" IS NOT NULL AND "cost_events"."allocation_version" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `cost_events_offer_category_incurred_idx` ON `cost_events` (`allocated_offer_version_id`,`category`,`incurred_at`);--> statement-breakpoint
CREATE TABLE `offer_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`stream` text NOT NULL,
	`offer_key` text NOT NULL,
	`version` integer NOT NULL,
	`label` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`price_minor` integer NOT NULL,
	`billing_type` text NOT NULL,
	`term_days` integer,
	`renewal_behavior` text DEFAULT 'none' NOT NULL,
	`entitlements_json` text DEFAULT '{}' NOT NULL,
	`refund_policy_version` text,
	`variable_cost_cap_bps` integer,
	`support_cap_seconds` integer,
	`target_cm1_bps` integer,
	`target_cm2_bps` integer,
	`approval_state` text DEFAULT 'hypothesis' NOT NULL,
	`board_decision_ref` text,
	`effective_at` integer,
	`retired_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "offer_versions_price_nonnegative_check" CHECK("offer_versions"."price_minor" >= 0),
	CONSTRAINT "offer_versions_term_positive_check" CHECK("offer_versions"."term_days" IS NULL OR "offer_versions"."term_days" > 0),
	CONSTRAINT "offer_versions_variable_cap_check" CHECK("offer_versions"."variable_cost_cap_bps" IS NULL OR ("offer_versions"."variable_cost_cap_bps" >= 0 AND "offer_versions"."variable_cost_cap_bps" <= 10000)),
	CONSTRAINT "offer_versions_support_cap_check" CHECK("offer_versions"."support_cap_seconds" IS NULL OR "offer_versions"."support_cap_seconds" >= 0),
	CONSTRAINT "offer_versions_cm_targets_check" CHECK(("offer_versions"."target_cm1_bps" IS NULL OR ("offer_versions"."target_cm1_bps" >= 0 AND "offer_versions"."target_cm1_bps" <= 10000)) AND ("offer_versions"."target_cm2_bps" IS NULL OR ("offer_versions"."target_cm2_bps" >= 0 AND "offer_versions"."target_cm2_bps" <= 10000)))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `offer_versions_key_version_unique` ON `offer_versions` (`offer_key`,`version`);--> statement-breakpoint
CREATE INDEX `offer_versions_stream_state_idx` ON `offer_versions` (`stream`,`approval_state`);--> statement-breakpoint
CREATE TABLE `orders_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`offer_version_id` text NOT NULL,
	`cohort_membership_id` text,
	`acquisition_source` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`gross_amount_minor` integer NOT NULL,
	`discount_amount_minor` integer DEFAULT 0 NOT NULL,
	`tax_amount_minor` integer DEFAULT 0 NOT NULL,
	`cash_collected_minor` integer DEFAULT 0 NOT NULL,
	`processor_fee_micros` integer DEFAULT 0 NOT NULL,
	`refund_amount_minor` integer DEFAULT 0 NOT NULL,
	`credit_amount_minor` integer DEFAULT 0 NOT NULL,
	`chargeback_amount_minor` integer DEFAULT 0 NOT NULL,
	`processor` text,
	`provider_reference` text,
	`service_starts_at` integer NOT NULL,
	`service_ends_at` integer NOT NULL,
	`renewal_state` text DEFAULT 'none' NOT NULL,
	`settlement_state` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`offer_version_id`) REFERENCES `offer_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`cohort_membership_id`) REFERENCES `cohort_memberships`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "orders_charges_nonnegative_amounts_check" CHECK("orders_charges"."gross_amount_minor" >= 0 AND "orders_charges"."discount_amount_minor" >= 0 AND "orders_charges"."tax_amount_minor" >= 0 AND "orders_charges"."cash_collected_minor" >= 0 AND "orders_charges"."processor_fee_micros" >= 0 AND "orders_charges"."refund_amount_minor" >= 0 AND "orders_charges"."credit_amount_minor" >= 0 AND "orders_charges"."chargeback_amount_minor" >= 0),
	CONSTRAINT "orders_charges_service_window_check" CHECK("orders_charges"."service_ends_at" > "orders_charges"."service_starts_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_charges_user_id_unique` ON `orders_charges` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_charges_provider_reference_unique` ON `orders_charges` (`processor`,`provider_reference`) WHERE "orders_charges"."provider_reference" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `orders_charges_offer_settlement_idx` ON `orders_charges` (`offer_version_id`,`settlement_state`,`created_at`);--> statement-breakpoint
CREATE TABLE `revenue_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`stream` text NOT NULL,
	`recognition_period` text NOT NULL,
	`opening_deferred_minor` integer DEFAULT 0 NOT NULL,
	`cash_collected_minor` integer DEFAULT 0 NOT NULL,
	`recognized_revenue_minor` integer DEFAULT 0 NOT NULL,
	`refund_reversal_minor` integer DEFAULT 0 NOT NULL,
	`closing_deferred_minor` integer DEFAULT 0 NOT NULL,
	`close_state` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders_charges`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "revenue_schedule_nonnegative_check" CHECK("revenue_schedule"."opening_deferred_minor" >= 0 AND "revenue_schedule"."cash_collected_minor" >= 0 AND "revenue_schedule"."recognized_revenue_minor" >= 0 AND "revenue_schedule"."refund_reversal_minor" >= 0 AND "revenue_schedule"."closing_deferred_minor" >= 0),
	CONSTRAINT "revenue_schedule_reconciliation_check" CHECK("revenue_schedule"."opening_deferred_minor" + "revenue_schedule"."cash_collected_minor" - "revenue_schedule"."recognized_revenue_minor" - "revenue_schedule"."refund_reversal_minor" = "revenue_schedule"."closing_deferred_minor")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `revenue_schedule_order_period_unique` ON `revenue_schedule` (`order_id`,`recognition_period`);--> statement-breakpoint
CREATE INDEX `revenue_schedule_period_stream_idx` ON `revenue_schedule` (`recognition_period`,`stream`,`close_state`);--> statement-breakpoint
INSERT INTO `offer_versions`
	(`id`,`stream`,`offer_key`,`version`,`label`,`currency`,`price_minor`,`billing_type`,`approval_state`)
SELECT
	'legacy-plan-' || lower(hex(`plan_key`)),
	'software',
	'legacy_plan_' || lower(hex(`plan_key`)),
	0,
	'Legacy unclassified plan: ' || `plan_key`,
	'USD',
	0,
	'free',
	'retired'
FROM `subscriptions`
GROUP BY `plan_key`;--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`offer_version_id` text NOT NULL,
	`plan_key` text NOT NULL,
	`state` text NOT NULL,
	`term_starts_at` integer,
	`term_ends_at` integer,
	`entitlements_json` text NOT NULL,
	`billing_provider` text,
	`billing_reference` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`offer_version_id`) REFERENCES `offer_versions`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `__new_subscriptions`
	(`id`,`user_id`,`offer_version_id`,`plan_key`,`state`,`term_starts_at`,`term_ends_at`,`entitlements_json`,`billing_provider`,`billing_reference`,`created_at`,`updated_at`)
SELECT
	`id`,
	`user_id`,
	'legacy-plan-' || lower(hex(`plan_key`)),
	`plan_key`,
	`state`,
	`term_starts_at`,
	`term_ends_at`,
	`entitlements_json`,
	`billing_provider`,
	`billing_reference`,
	`created_at`,
	`updated_at`
FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
CREATE INDEX `subscriptions_user_state_idx` ON `subscriptions` (`user_id`,`state`);--> statement-breakpoint
CREATE INDEX `subscriptions_offer_state_idx` ON `subscriptions` (`offer_version_id`,`state`);--> statement-breakpoint
ALTER TABLE `usage_events` ADD `cost_event_id` text REFERENCES cost_events(id);--> statement-breakpoint
ALTER TABLE `usage_events` ADD `workload_ref` text;
