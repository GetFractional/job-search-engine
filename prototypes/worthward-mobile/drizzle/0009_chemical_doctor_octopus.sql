CREATE TABLE `user_job_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_posting_id` text NOT NULL,
	`source` text NOT NULL,
	`state` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_job_links_user_job_unique` ON `user_job_links` (`user_id`,`job_posting_id`);--> statement-breakpoint
CREATE INDEX `user_job_links_user_state_idx` ON `user_job_links` (`user_id`,`state`);