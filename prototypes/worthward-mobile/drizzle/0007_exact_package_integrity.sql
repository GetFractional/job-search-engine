CREATE UNIQUE INDEX `audit_events_founder_workspace_imported_user_unique`
ON `audit_events` (`user_id`,`event_type`)
WHERE `event_type` = 'founder_workspace_imported';
