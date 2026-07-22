CREATE TABLE `achievement_bullet_facts` (
	`user_id` text NOT NULL,
	`achievement_bullet_id` text NOT NULL,
	`profile_fact_id` text NOT NULL,
	`relationship` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`achievement_bullet_id`, `profile_fact_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`achievement_bullet_id`) REFERENCES `achievement_bullets`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`profile_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `achievement_bullets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`experience_role_id` text,
	`text` text NOT NULL,
	`categories_json` text DEFAULT '[]' NOT NULL,
	`metrics_state` text DEFAULT 'missing' NOT NULL,
	`confidence` integer,
	`approval_state` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`experience_role_id`) REFERENCES `experience_roles`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievement_bullets_user_id_unique` ON `achievement_bullets` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `achievement_bullets_user_role_idx` ON `achievement_bullets` (`user_id`,`experience_role_id`);--> statement-breakpoint
CREATE TABLE `career_paths` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`primary_lane` text NOT NULL,
	`secondary_lanes_json` text DEFAULT '[]' NOT NULL,
	`fit_score` integer,
	`opportunity_score` integer,
	`rationale_json` text,
	`gaps_json` text,
	`state` text DEFAULT 'suggested' NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "career_paths_primary_must_be_active_check" CHECK("career_paths"."is_primary" = 0 OR "career_paths"."state" = 'active')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `career_paths_user_id_unique` ON `career_paths` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `career_paths_one_primary_per_user_unique` ON `career_paths` (`user_id`) WHERE "career_paths"."is_primary" = 1;--> statement-breakpoint
CREATE INDEX `career_paths_user_state_idx` ON `career_paths` (`user_id`,`state`);--> statement-breakpoint
CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`policy_version` text NOT NULL,
	`state` text NOT NULL,
	`granted_at` integer,
	`revoked_at` integer,
	`source` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `consents_user_purpose_idx` ON `consents` (`user_id`,`purpose`);--> statement-breakpoint
CREATE TABLE `experience_role_facts` (
	`user_id` text NOT NULL,
	`experience_role_id` text NOT NULL,
	`profile_fact_id` text NOT NULL,
	`relationship` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`experience_role_id`, `profile_fact_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`experience_role_id`) REFERENCES `experience_roles`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`profile_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience_role_merge_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_role_id` text NOT NULL,
	`target_role_id` text NOT NULL,
	`similarity_score` integer,
	`proposed_resolution_json` text NOT NULL,
	`conflicts_json` text DEFAULT '[]' NOT NULL,
	`state` text DEFAULT 'proposed' NOT NULL,
	`decided_by_user_at` integer,
	`decision_note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`source_role_id`) REFERENCES `experience_roles`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`target_role_id`) REFERENCES `experience_roles`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "experience_role_merge_no_self_check" CHECK("experience_role_merge_proposals"."source_role_id" <> "experience_role_merge_proposals"."target_role_id"),
	CONSTRAINT "experience_role_merge_user_decision_check" CHECK(("experience_role_merge_proposals"."state" = 'proposed' AND "experience_role_merge_proposals"."decided_by_user_at" IS NULL) OR ("experience_role_merge_proposals"."state" <> 'proposed' AND "experience_role_merge_proposals"."decided_by_user_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `experience_role_merge_pair_unique` ON `experience_role_merge_proposals` (`user_id`,`source_role_id`,`target_role_id`);--> statement-breakpoint
CREATE TABLE `experience_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`employer` text NOT NULL,
	`title` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`is_current` integer DEFAULT false NOT NULL,
	`location` text,
	`summary` text,
	`review_state` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `experience_roles_user_id_unique` ON `experience_roles` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `experience_roles_user_dates_idx` ON `experience_roles` (`user_id`,`start_date`);--> statement-breakpoint
CREATE TABLE `generated_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`pursuit_id` text,
	`type` text NOT NULL,
	`source_versions_json` text NOT NULL,
	`generation_policy_version` text NOT NULL,
	`review_state` text DEFAULT 'draft' NOT NULL,
	`object_key` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`pursuit_id`) REFERENCES `pursuits`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `generated_assets_pursuit_type_idx` ON `generated_assets` (`pursuit_id`,`type`);--> statement-breakpoint
CREATE TABLE `job_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_posting_id` text NOT NULL,
	`career_path_id` text,
	`job_standard_id` text NOT NULL,
	`policy_version` text NOT NULL,
	`evidence_version` text NOT NULL,
	`integrity_gates_json` text NOT NULL,
	`move_value_score` integer,
	`pursuit_readiness_score` integer,
	`fit_json` text NOT NULL,
	`unknowns_json` text DEFAULT '[]' NOT NULL,
	`recommendation` text NOT NULL,
	`validation_state` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`invalidated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`career_path_id`) REFERENCES `career_paths`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`job_standard_id`) REFERENCES `job_standards`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_analyses_user_id_unique` ON `job_analyses` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `job_analyses_user_job_state_idx` ON `job_analyses` (`user_id`,`job_posting_id`,`validation_state`);--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`external_id` text NOT NULL,
	`canonical_url` text NOT NULL,
	`employer` text NOT NULL,
	`title` text NOT NULL,
	`mandate` text,
	`locations_json` text,
	`compensation_json` text,
	`description_checksum` text NOT NULL,
	`first_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_checked_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`posted_at` integer,
	`removed_at` integer,
	`duplicate_group_key` text,
	`freshness_state` text DEFAULT 'unknown' NOT NULL,
	`raw_object_key` text,
	FOREIGN KEY (`source_id`) REFERENCES `job_sources`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_postings_source_external_unique` ON `job_postings` (`source_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `job_postings_employer_title_idx` ON `job_postings` (`employer`,`title`);--> statement-breakpoint
CREATE INDEX `job_postings_freshness_idx` ON `job_postings` (`freshness_state`,`last_checked_at`);--> statement-breakpoint
CREATE TABLE `job_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`rights_state` text DEFAULT 'unknown' NOT NULL,
	`terms_version` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_sources_name_kind_unique` ON `job_sources` (`name`,`kind`);--> statement-breakpoint
CREATE TABLE `job_standards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`version` integer NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`pay_basis` text,
	`minimum_pay_cents` integer,
	`target_pay_cents` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`work_arrangements_json` text DEFAULT '[]' NOT NULL,
	`commute_miles` integer,
	`locations_json` text DEFAULT '[]' NOT NULL,
	`travel_maximum_percent` integer,
	`schedule_requirements` text,
	`benefits_json` text DEFAULT '[]' NOT NULL,
	`growth_priorities_json` text DEFAULT '[]' NOT NULL,
	`exclusions_json` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_standards_user_id_unique` ON `job_standards` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `job_standards_user_version_unique` ON `job_standards` (`user_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `job_standards_one_current_per_user_unique` ON `job_standards` (`user_id`) WHERE "job_standards"."is_current" = 1;--> statement-breakpoint
CREATE INDEX `job_standards_user_current_idx` ON `job_standards` (`user_id`,`is_current`);--> statement-breakpoint
CREATE TABLE `profile_fact_dependencies` (
	`user_id` text NOT NULL,
	`dependent_fact_id` text NOT NULL,
	`source_fact_id` text NOT NULL,
	`relationship` text NOT NULL,
	`invalidation_policy` text DEFAULT 'review' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`dependent_fact_id`, `source_fact_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`dependent_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`source_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "profile_fact_dependencies_no_self_check" CHECK("profile_fact_dependencies"."dependent_fact_id" <> "profile_fact_dependencies"."source_fact_id")
);
--> statement-breakpoint
CREATE TABLE `profile_facts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_import_id` text,
	`fact_type` text NOT NULL,
	`value_json` text NOT NULL,
	`source_span` text,
	`extraction_method` text DEFAULT 'manual_entry' NOT NULL,
	`extraction_policy_version` text DEFAULT 'local-v1' NOT NULL,
	`state` text NOT NULL,
	`confidence` integer,
	`ownership` text DEFAULT 'unknown' NOT NULL,
	`supersedes_fact_id` text,
	`invalidated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`source_import_id`) REFERENCES `source_imports`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`supersedes_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_facts_user_id_unique` ON `profile_facts` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `profile_facts_user_type_state_idx` ON `profile_facts` (`user_id`,`fact_type`,`state`);--> statement-breakpoint
CREATE TABLE `profile_skills` (
	`user_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`level` text,
	`last_used_year` integer,
	`source_fact_id` text,
	`confidence` integer,
	`review_state` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `skill_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`source_fact_id`) REFERENCES `profile_facts`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `pursuits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_posting_id` text NOT NULL,
	`current_analysis_id` text,
	`state` text DEFAULT 'saved' NOT NULL,
	`next_action` text,
	`external_approval_state` text DEFAULT 'not_requested' NOT NULL,
	`applied_at` integer,
	`closed_reason` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`,`current_analysis_id`) REFERENCES `job_analyses`(`user_id`,`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pursuits_user_id_unique` ON `pursuits` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pursuits_user_job_unique` ON `pursuits` (`user_id`,`job_posting_id`);--> statement-breakpoint
CREATE INDEX `pursuits_user_state_idx` ON `pursuits` (`user_id`,`state`);--> statement-breakpoint
CREATE TABLE `resume_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`resume_id` text NOT NULL,
	`scope` text DEFAULT 'default' NOT NULL,
	`career_path_id` text,
	`job_posting_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`resume_id`) REFERENCES `resumes`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`,`career_path_id`) REFERENCES `career_paths`(`user_id`,`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "resume_assignments_exact_scope_check" CHECK(("resume_assignments"."scope" = 'default' AND "resume_assignments"."career_path_id" IS NULL AND "resume_assignments"."job_posting_id" IS NULL) OR ("resume_assignments"."scope" = 'path' AND "resume_assignments"."career_path_id" IS NOT NULL AND "resume_assignments"."job_posting_id" IS NULL) OR ("resume_assignments"."scope" = 'job' AND "resume_assignments"."career_path_id" IS NULL AND "resume_assignments"."job_posting_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resume_assignments_one_default_unique` ON `resume_assignments` (`user_id`) WHERE "resume_assignments"."scope" = 'default';--> statement-breakpoint
CREATE UNIQUE INDEX `resume_assignments_one_path_unique` ON `resume_assignments` (`user_id`,`career_path_id`) WHERE "resume_assignments"."scope" = 'path';--> statement-breakpoint
CREATE UNIQUE INDEX `resume_assignments_one_job_unique` ON `resume_assignments` (`user_id`,`job_posting_id`) WHERE "resume_assignments"."scope" = 'job';--> statement-breakpoint
CREATE INDEX `resume_assignments_scope_idx` ON `resume_assignments` (`user_id`,`scope`,`career_path_id`,`job_posting_id`);--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`version` integer NOT NULL,
	`content_json` text NOT NULL,
	`template_key` text NOT NULL,
	`review_state` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resumes_user_id_unique` ON `resumes` (`user_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `resumes_user_name_version_unique` ON `resumes` (`user_id`,`name`,`version`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`canonical_name` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_name_category_unique` ON `skills` (`canonical_name`,`category`);--> statement-breakpoint
CREATE TABLE `source_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`original_name` text,
	`object_key` text,
	`checksum_sha256` text NOT NULL,
	`content_type` text,
	`byte_size` integer,
	`parse_state` text DEFAULT 'received' NOT NULL,
	`parser_version` text,
	`retention_ends_at` integer,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `source_imports_user_id_unique` ON `source_imports` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `source_imports_user_state_idx` ON `source_imports` (`user_id`,`parse_state`);--> statement-breakpoint
CREATE UNIQUE INDEX `source_imports_user_checksum_unique` ON `source_imports` (`user_id`,`checksum_sha256`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_key` text NOT NULL,
	`state` text NOT NULL,
	`term_starts_at` integer,
	`term_ends_at` integer,
	`entitlements_json` text NOT NULL,
	`billing_provider` text,
	`billing_reference` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subscriptions_user_state_idx` ON `subscriptions` (`user_id`,`state`);--> statement-breakpoint
CREATE TABLE `usage_events` (
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
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `usage_events_action_created_idx` ON `usage_events` (`action`,`created_at`);--> statement-breakpoint
CREATE INDEX `usage_events_user_created_idx` ON `usage_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_subject` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`locale` text DEFAULT 'en-US' NOT NULL,
	`timezone` text DEFAULT 'America/Chicago' NOT NULL,
	`lifecycle_state` text DEFAULT 'private_alpha' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_subject_unique` ON `users` (`auth_subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);