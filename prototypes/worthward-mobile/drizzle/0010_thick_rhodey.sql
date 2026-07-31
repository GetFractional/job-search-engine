CREATE TABLE `pursuit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pursuit_id` text NOT NULL,
	`event_type` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`note` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`pursuit_id`) REFERENCES `pursuits`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pursuit_events_user_id_unique` ON `pursuit_events` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `pursuit_events_pursuit_occurred_idx` ON `pursuit_events` (`user_id`,`pursuit_id`,`occurred_at`);--> statement-breakpoint
ALTER TABLE `external_action_approvals` ADD `approved_pursuit_revision` integer;--> statement-breakpoint
ALTER TABLE `external_action_approvals` ADD `attestation_version` text;--> statement-breakpoint
ALTER TABLE `external_action_approvals` ADD `attestation_sha256` text;--> statement-breakpoint
ALTER TABLE `pursuits` ADD `revision` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
DROP TRIGGER IF EXISTS `external_action_approvals_identity_payload_immutable`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `external_action_approvals_insert_gate`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `external_action_approvals_update_gate`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `generated_assets_invalidation_supersedes_packages`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `generated_assets_new_version_supersedes_packages`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `generated_assets_payload_immutable`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `job_posting_versions_new_snapshot_supersedes_packages`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `pursuit_packages_payload_immutable`;
