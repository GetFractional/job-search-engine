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
WHERE `category` = 'processor' AND `order_id` IS NOT NULL;
