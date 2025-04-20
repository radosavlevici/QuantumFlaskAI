import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  securityScore: integer("security_score").default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  securityScore: true,
  avatarUrl: true,
});

// Security Event Schema
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventType: text("event_type").notNull(), // login, logout, password_change, etc.
  ipAddress: text("ip_address"),
  location: text("location"),
  deviceInfo: text("device_info"),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status"), // success, failed, etc.
  details: jsonb("details"),
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).pick({
  userId: true,
  eventType: true,
  ipAddress: true,
  location: true,
  deviceInfo: true,
  status: true,
  details: true,
});

// Security Alert Schema
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  alertType: text("alert_type").notNull(), // suspicious_login, password_breach, etc.
  severity: text("severity").notNull(), // high, medium, low
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
  details: jsonb("details"),
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).pick({
  userId: true,
  alertType: true,
  severity: true,
  message: true,
  isRead: true,
  details: true,
});

// Session Schema
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceType: text("device_type").notNull(), // desktop, mobile, tablet
  deviceName: text("device_name").notNull(),
  browser: text("browser"),
  operatingSystem: text("operating_system"),
  ipAddress: text("ip_address"),
  location: text("location"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  isCurrentSession: boolean("is_current_session").default(false),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  deviceType: true,
  deviceName: true,
  browser: true,
  operatingSystem: true,
  ipAddress: true,
  location: true,
  isActive: true,
  isCurrentSession: true,
});

// Password Manager Schema
export const storedPasswords = pgTable("stored_passwords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  website: text("website").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  strength: text("strength"), // strong, medium, weak
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
});

export const insertStoredPasswordSchema = createInsertSchema(storedPasswords).pick({
  userId: true,
  website: true,
  username: true,
  password: true,
  strength: true,
  notes: true,
});

// Security Recommendation Schema
export const securityRecommendations = pgTable("security_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 2fa, password_update, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").default(false),
  priority: text("priority").default("medium"), // high, medium, low
});

export const insertSecurityRecommendationSchema = createInsertSchema(securityRecommendations).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  isCompleted: true,
  priority: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type StoredPassword = typeof storedPasswords.$inferSelect;
export type InsertStoredPassword = z.infer<typeof insertStoredPasswordSchema>;

export type SecurityRecommendation = typeof securityRecommendations.$inferSelect;
export type InsertSecurityRecommendation = z.infer<typeof insertSecurityRecommendationSchema>;
