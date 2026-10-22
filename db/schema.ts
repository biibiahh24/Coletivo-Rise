import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const submissionAttempts = sqliteTable("submission_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fingerprintHash: text("fingerprint_hash").notNull(),
  kind: text("kind").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("idx_submission_attempts_fingerprint_created").on(table.fingerprintHash, table.createdAt),
]);

export const submissionReceipts = sqliteTable("submission_receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idempotencyKey: text("idempotency_key").notNull(),
  protocol: text("protocol").notNull(),
  kind: text("kind").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  uniqueIndex("idx_submission_receipts_idempotency").on(table.idempotencyKey),
]);

export const campRegistrations = sqliteTable("camp_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  protocol: text("protocol").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  guardianName: text("guardian_name"),
  phone: text("phone").notNull(),
  church: text("church").notNull(),
  location: text("location").notNull(),
  allergies: text("allergies"),
  medication: text("medication"),
  dietaryRestrictions: text("dietary_restrictions"),
  attendedBefore: text("attended_before").notNull(),
  shirtSize: text("shirt_size").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  registrationStatus: text("registration_status").notNull().default("pending"),
  notes: text("notes"),
  receiptKey: text("receipt_key"),
  receiptName: text("receipt_name"),
  receiptType: text("receipt_type"),
  consentAt: integer("consent_at").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_camp_registrations_protocol").on(table.protocol),
  uniqueIndex("idx_camp_registrations_idempotency").on(table.idempotencyKey),
  index("idx_camp_registrations_status_created").on(table.registrationStatus, table.createdAt),
]);

export const shirtOrders = sqliteTable("shirt_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  protocol: text("protocol").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  edition: text("edition").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  orderStatus: text("order_status").notNull().default("pending"),
  consentAt: integer("consent_at").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_shirt_orders_protocol").on(table.protocol),
  uniqueIndex("idx_shirt_orders_idempotency").on(table.idempotencyKey),
  index("idx_shirt_orders_status_created").on(table.orderStatus, table.createdAt),
]);

export const adminAuditLogs = sqliteTable("admin_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("idx_admin_audit_created").on(table.createdAt),
]);
