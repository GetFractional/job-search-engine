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
WHERE `close_state` = 'reconciled';
