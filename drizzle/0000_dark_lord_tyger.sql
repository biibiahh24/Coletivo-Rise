CREATE TABLE `submission_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fingerprint_hash` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_submission_attempts_fingerprint_created` ON `submission_attempts` (`fingerprint_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `submission_receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idempotency_key` text NOT NULL,
	`protocol` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_submission_receipts_idempotency` ON `submission_receipts` (`idempotency_key`);