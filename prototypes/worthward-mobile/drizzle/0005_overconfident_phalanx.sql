CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`actor_subject` text NOT NULL,
	`event_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`metadata_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `audit_events_user_created_idx` ON `audit_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_events_entity_idx` ON `audit_events` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `external_action_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pursuit_package_id` text NOT NULL,
	`action` text NOT NULL,
	`payload_sha256` text NOT NULL,
	`state` text DEFAULT 'requested' NOT NULL,
	`approved_at` integer,
	`revoked_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`pursuit_package_id`) REFERENCES `pursuit_packages`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
CREATE UNIQUE INDEX `external_action_approvals_user_id_unique` ON `external_action_approvals` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `external_action_approvals_package_state_idx` ON `external_action_approvals` (`pursuit_package_id`,`state`);--> statement-breakpoint
CREATE TABLE `job_posting_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`job_posting_id` text NOT NULL,
	`source_checked_at` integer NOT NULL,
	`source_url` text NOT NULL,
	`description_checksum` text NOT NULL,
	`source_facts_json` text NOT NULL,
	`source_conflicts_json` text DEFAULT '[]' NOT NULL,
	`capture_state` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE UNIQUE INDEX `job_posting_versions_job_checksum_unique` ON `job_posting_versions` (`job_posting_id`,`description_checksum`);--> statement-breakpoint
CREATE INDEX `job_posting_versions_job_checked_idx` ON `job_posting_versions` (`job_posting_id`,`source_checked_at`);--> statement-breakpoint
CREATE TABLE `pursuit_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pursuit_id` text NOT NULL,
	`version` integer NOT NULL,
	`destination_url` text NOT NULL,
	`job_posting_version_id` text NOT NULL,
	`answers_json` text NOT NULL,
	`asset_manifest_json` text NOT NULL,
	`blockers_json` text DEFAULT '[]' NOT NULL,
	`payload_sha256` text NOT NULL,
	`readiness_state` text NOT NULL,
	`superseded_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_posting_version_id`) REFERENCES `job_posting_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`pursuit_id`) REFERENCES `pursuits`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE UNIQUE INDEX `pursuit_packages_user_id_unique` ON `pursuit_packages` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pursuit_packages_pursuit_version_unique` ON `pursuit_packages` (`pursuit_id`,`version`);--> statement-breakpoint
CREATE INDEX `pursuit_packages_pursuit_state_idx` ON `pursuit_packages` (`pursuit_id`,`readiness_state`);--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `content_json` text;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `content_sha256` text;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `filename` text;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `page_count` integer;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `supersedes_asset_id` text;--> statement-breakpoint
ALTER TABLE `generated_assets` ADD `invalidated_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `generated_assets_user_id_unique` ON `generated_assets` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `generated_assets_pursuit_type_version_unique` ON `generated_assets` (`pursuit_id`,`type`,`version`);--> statement-breakpoint
ALTER TABLE `users` ADD `identity_provider` text DEFAULT 'chatgpt' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'member' NOT NULL;
