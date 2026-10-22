CREATE TABLE `admin_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`details` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_created` ON `admin_audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `camp_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`protocol` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`full_name` text NOT NULL,
	`age` integer NOT NULL,
	`guardian_name` text,
	`phone` text NOT NULL,
	`church` text NOT NULL,
	`location` text NOT NULL,
	`allergies` text,
	`medication` text,
	`dietary_restrictions` text,
	`attended_before` text NOT NULL,
	`shirt_size` text NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`registration_status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`receipt_key` text,
	`receipt_name` text,
	`receipt_type` text,
	`consent_at` integer NOT NULL,
	`privacy_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_camp_registrations_protocol` ON `camp_registrations` (`protocol`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_camp_registrations_idempotency` ON `camp_registrations` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_camp_registrations_status_created` ON `camp_registrations` (`registration_status`,`created_at`);--> statement-breakpoint
CREATE TABLE `shirt_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`protocol` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`edition` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`order_status` text DEFAULT 'pending' NOT NULL,
	`consent_at` integer NOT NULL,
	`privacy_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_shirt_orders_protocol` ON `shirt_orders` (`protocol`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_shirt_orders_idempotency` ON `shirt_orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_shirt_orders_status_created` ON `shirt_orders` (`order_status`,`created_at`);