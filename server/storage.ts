import {
  User, InsertUser,
  SecurityEvent, InsertSecurityEvent,
  SecurityAlert, InsertSecurityAlert,
  Session, InsertSession,
  StoredPassword, InsertStoredPassword,
  SecurityRecommendation, InsertSecurityRecommendation
} from "@shared/schema";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Security Events
  getSecurityEvents(userId: number, limit?: number): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  
  // Security Alerts
  getSecurityAlerts(userId: number): Promise<SecurityAlert[]>;
  createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert>;
  updateSecurityAlert(id: number, updates: Partial<SecurityAlert>): Promise<SecurityAlert | undefined>;
  dismissSecurityAlert(id: number): Promise<boolean>;
  
  // Sessions
  getSessions(userId: number): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  terminateSession(id: number): Promise<boolean>;
  terminateAllSessions(userId: number, exceptSessionId?: number): Promise<boolean>;
  
  // Stored Passwords
  getStoredPasswords(userId: number): Promise<StoredPassword[]>;
  getStoredPassword(id: number): Promise<StoredPassword | undefined>;
  createStoredPassword(password: InsertStoredPassword): Promise<StoredPassword>;
  updateStoredPassword(id: number, updates: Partial<StoredPassword>): Promise<StoredPassword | undefined>;
  deleteStoredPassword(id: number): Promise<boolean>;
  
  // Security Recommendations
  getSecurityRecommendations(userId: number): Promise<SecurityRecommendation[]>;
  updateSecurityRecommendation(id: number, updates: Partial<SecurityRecommendation>): Promise<SecurityRecommendation | undefined>;

  // Dashboard
  getUserSecuritySummary(userId: number): Promise<{
    securityScore: number;
    activeSessions: number;
    weakPasswords: number;
    recommendations: number;
    alerts: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private securityEvents: Map<number, SecurityEvent>;
  private securityAlerts: Map<number, SecurityAlert>;
  private sessions: Map<number, Session>;
  private storedPasswords: Map<number, StoredPassword>;
  private securityRecommendations: Map<number, SecurityRecommendation>;
  
  private currentUserId: number;
  private currentEventId: number;
  private currentAlertId: number;
  private currentSessionId: number;
  private currentPasswordId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.securityEvents = new Map();
    this.securityAlerts = new Map();
    this.sessions = new Map();
    this.storedPasswords = new Map();
    this.securityRecommendations = new Map();
    
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentAlertId = 1;
    this.currentSessionId = 1;
    this.currentPasswordId = 1;
    this.currentRecommendationId = 1;
    
    // Initialize sample data
    this.initializeData();
  }

  // Initialize with sample data for demo
  private initializeData() {
    // Create a sample user
    const user: User = {
      id: this.currentUserId++,
      username: "alex_johnson",
      password: "hashed_password", // In real app, this would be properly hashed
      email: "alex@example.com",
      securityScore: 82,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Add security recommendations
    const recommendations = [
      {
        id: this.currentRecommendationId++,
        userId: user.id,
        type: "2fa",
        title: "Enable two-factor authentication",
        description: "Add an extra layer of security by requiring a second form of authentication.",
        isCompleted: false,
        priority: "high"
      },
      {
        id: this.currentRecommendationId++,
        userId: user.id,
        type: "password_update",
        title: "Update weak passwords",
        description: "Replace weak or reused passwords with strong, unique ones.",
        isCompleted: true,
        priority: "high"
      },
      {
        id: this.currentRecommendationId++,
        userId: user.id,
        type: "recovery",
        title: "Set up account recovery options",
        description: "Add backup email addresses or phone numbers for account recovery.",
        isCompleted: false,
        priority: "medium"
      },
      {
        id: this.currentRecommendationId++,
        userId: user.id,
        type: "inactive_sessions",
        title: "Revoke inactive session access",
        description: "Log out from devices you haven't used recently.",
        isCompleted: false,
        priority: "low"
      }
    ] as SecurityRecommendation[];
    
    recommendations.forEach(rec => {
      this.securityRecommendations.set(rec.id, rec);
    });
    
    // Add security events
    const events = [
      {
        id: this.currentEventId++,
        userId: user.id,
        eventType: "failed_login",
        ipAddress: "198.51.100.14",
        location: "New York, USA",
        deviceInfo: "Unknown Device",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: "failed",
        details: { reason: "Incorrect password" }
      },
      {
        id: this.currentEventId++,
        userId: user.id,
        eventType: "login",
        ipAddress: "192.0.2.75",
        location: "Los Angeles, USA",
        deviceInfo: "Chrome on Windows",
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        status: "success",
        details: { browser: "Chrome", os: "Windows" }
      },
      {
        id: this.currentEventId++,
        userId: user.id,
        eventType: "password_change",
        ipAddress: "192.0.2.75",
        location: "Los Angeles, USA",
        deviceInfo: "Chrome on Windows",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: "success",
        details: { method: "manual" }
      },
      {
        id: this.currentEventId++,
        userId: user.id,
        eventType: "new_device",
        ipAddress: "192.0.2.75",
        location: "Los Angeles, USA",
        deviceInfo: "iPhone 13",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
        status: "success",
        details: { deviceName: "iPhone 13", deviceType: "mobile" }
      }
    ] as SecurityEvent[];
    
    events.forEach(event => {
      this.securityEvents.set(event.id, event);
    });
    
    // Add security alert
    const alert: SecurityAlert = {
      id: this.currentAlertId++,
      userId: user.id,
      alertType: "suspicious_login",
      severity: "medium",
      message: "We detected a login attempt from a new location. Please review your recent activity.",
      timestamp: new Date(),
      isRead: false,
      details: { ipAddress: "198.51.100.14", location: "New York, USA" }
    };
    this.securityAlerts.set(alert.id, alert);
    
    // Add sessions
    const sessions = [
      {
        id: this.currentSessionId++,
        userId: user.id,
        deviceType: "desktop",
        deviceName: "Chrome on Windows",
        browser: "Chrome",
        operatingSystem: "Windows",
        ipAddress: "192.0.2.75",
        location: "Los Angeles, USA",
        lastActiveAt: new Date(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        isActive: true,
        isCurrentSession: true
      },
      {
        id: this.currentSessionId++,
        userId: user.id,
        deviceType: "mobile",
        deviceName: "iOS App",
        browser: "Safari",
        operatingSystem: "iOS",
        ipAddress: "192.0.2.80",
        location: "Los Angeles, USA",
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
        isActive: true,
        isCurrentSession: false
      },
      {
        id: this.currentSessionId++,
        userId: user.id,
        deviceType: "tablet",
        deviceName: "Safari on iPad",
        browser: "Safari",
        operatingSystem: "iPadOS",
        ipAddress: "192.0.2.112",
        location: "New York, USA",
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        isActive: true,
        isCurrentSession: false
      }
    ] as Session[];
    
    sessions.forEach(session => {
      this.sessions.set(session.id, session);
    });
    
    // Add stored passwords
    const passwords = [
      {
        id: this.currentPasswordId++,
        userId: user.id,
        website: "example.com",
        username: "alex_johnson",
        password: "encrypted_password_1", // In real app, this would be encrypted
        strength: "strong",
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        notes: "Main account"
      },
      {
        id: this.currentPasswordId++,
        userId: user.id,
        website: "bank.example.com",
        username: "alex.johnson",
        password: "encrypted_password_2",
        strength: "strong",
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        notes: "Banking account"
      },
      {
        id: this.currentPasswordId++,
        userId: user.id,
        website: "social.example.com",
        username: "alex.j",
        password: "encrypted_password_3",
        strength: "weak",
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
        notes: "Social media account"
      },
      {
        id: this.currentPasswordId++,
        userId: user.id,
        website: "email.example.com",
        username: "alex.johnson",
        password: "encrypted_password_4",
        strength: "weak",
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120), // 120 days ago
        notes: "Secondary email"
      }
    ] as StoredPassword[];
    
    passwords.forEach(password => {
      this.storedPasswords.set(password.id, password);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Security Events methods
  async getSecurityEvents(userId: number, limit?: number): Promise<SecurityEvent[]> {
    const events = Array.from(this.securityEvents.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? events.slice(0, limit) : events;
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = this.currentEventId++;
    const now = new Date();
    const securityEvent: SecurityEvent = { ...event, id, timestamp: now };
    this.securityEvents.set(id, securityEvent);
    return securityEvent;
  }

  // Security Alerts methods
  async getSecurityAlerts(userId: number): Promise<SecurityAlert[]> {
    return Array.from(this.securityAlerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert> {
    const id = this.currentAlertId++;
    const now = new Date();
    const securityAlert: SecurityAlert = { ...alert, id, timestamp: now };
    this.securityAlerts.set(id, securityAlert);
    return securityAlert;
  }

  async updateSecurityAlert(id: number, updates: Partial<SecurityAlert>): Promise<SecurityAlert | undefined> {
    const alert = this.securityAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updates };
    this.securityAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async dismissSecurityAlert(id: number): Promise<boolean> {
    const alert = this.securityAlerts.get(id);
    if (!alert) return false;
    
    const updatedAlert = { ...alert, isRead: true };
    this.securityAlerts.set(id, updatedAlert);
    return true;
  }

  // Sessions methods
  async getSessions(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive)
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const now = new Date();
    const newSession: Session = { 
      ...session, 
      id, 
      lastActiveAt: now, 
      createdAt: now 
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async terminateSession(id: number): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    const updatedSession = { ...session, isActive: false };
    this.sessions.set(id, updatedSession);
    return true;
  }

  async terminateAllSessions(userId: number, exceptSessionId?: number): Promise<boolean> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive);
    
    userSessions.forEach(session => {
      if (exceptSessionId === undefined || session.id !== exceptSessionId) {
        this.sessions.set(session.id, { ...session, isActive: false });
      }
    });
    
    return true;
  }

  // Stored Passwords methods
  async getStoredPasswords(userId: number): Promise<StoredPassword[]> {
    return Array.from(this.storedPasswords.values())
      .filter(password => password.userId === userId)
      .sort((a, b) => a.website.localeCompare(b.website));
  }

  async getStoredPassword(id: number): Promise<StoredPassword | undefined> {
    return this.storedPasswords.get(id);
  }

  async createStoredPassword(password: InsertStoredPassword): Promise<StoredPassword> {
    const id = this.currentPasswordId++;
    const now = new Date();
    const storedPassword: StoredPassword = { ...password, id, lastUpdated: now };
    this.storedPasswords.set(id, storedPassword);
    return storedPassword;
  }

  async updateStoredPassword(id: number, updates: Partial<StoredPassword>): Promise<StoredPassword | undefined> {
    const password = this.storedPasswords.get(id);
    if (!password) return undefined;
    
    const now = new Date();
    const updatedPassword = { ...password, ...updates, lastUpdated: now };
    this.storedPasswords.set(id, updatedPassword);
    return updatedPassword;
  }

  async deleteStoredPassword(id: number): Promise<boolean> {
    return this.storedPasswords.delete(id);
  }

  // Security Recommendations methods
  async getSecurityRecommendations(userId: number): Promise<SecurityRecommendation[]> {
    return Array.from(this.securityRecommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      });
  }

  async updateSecurityRecommendation(id: number, updates: Partial<SecurityRecommendation>): Promise<SecurityRecommendation | undefined> {
    const recommendation = this.securityRecommendations.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation = { ...recommendation, ...updates };
    this.securityRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  // Dashboard summary
  async getUserSecuritySummary(userId: number): Promise<{
    securityScore: number;
    activeSessions: number;
    weakPasswords: number;
    recommendations: number;
    alerts: number;
  }> {
    const user = await this.getUser(userId);
    const activeSessions = (await this.getSessions(userId)).length;
    const weakPasswords = (await this.getStoredPasswords(userId)).filter(p => p.strength === 'weak').length;
    const pendingRecommendations = (await this.getSecurityRecommendations(userId)).filter(r => !r.isCompleted).length;
    const unreadAlerts = (await this.getSecurityAlerts(userId)).filter(a => !a.isRead).length;
    
    return {
      securityScore: user?.securityScore || 0,
      activeSessions,
      weakPasswords,
      recommendations: pendingRecommendations,
      alerts: unreadAlerts
    };
  }
}

import { db } from "./db";
import { eq, desc, and, ne, count } from "drizzle-orm";
import * as schema from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Security Events methods
  async getSecurityEvents(userId: number, limit?: number): Promise<SecurityEvent[]> {
    let query = db
      .select()
      .from(schema.securityEvents)
      .where(eq(schema.securityEvents.userId, userId))
      .orderBy(desc(schema.securityEvents.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const [securityEvent] = await db
      .insert(schema.securityEvents)
      .values(event)
      .returning();
    return securityEvent;
  }

  // Security Alerts methods
  async getSecurityAlerts(userId: number): Promise<SecurityAlert[]> {
    return await db
      .select()
      .from(schema.securityAlerts)
      .where(eq(schema.securityAlerts.userId, userId))
      .orderBy(desc(schema.securityAlerts.timestamp));
  }

  async createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert> {
    const [securityAlert] = await db
      .insert(schema.securityAlerts)
      .values(alert)
      .returning();
    return securityAlert;
  }

  async updateSecurityAlert(id: number, updates: Partial<SecurityAlert>): Promise<SecurityAlert | undefined> {
    const [updatedAlert] = await db
      .update(schema.securityAlerts)
      .set(updates)
      .where(eq(schema.securityAlerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async dismissSecurityAlert(id: number): Promise<boolean> {
    const result = await db
      .update(schema.securityAlerts)
      .set({ isRead: true })
      .where(eq(schema.securityAlerts.id, id))
      .returning({ id: schema.securityAlerts.id });
    return result.length > 0;
  }

  // Sessions methods
  async getSessions(userId: number): Promise<Session[]> {
    return await db
      .select()
      .from(schema.sessions)
      .where(and(
        eq(schema.sessions.userId, userId),
        eq(schema.sessions.isActive, true)
      ))
      .orderBy(desc(schema.sessions.lastActiveAt));
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, id));
    return session || undefined;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(schema.sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(schema.sessions)
      .set(updates)
      .where(eq(schema.sessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async terminateSession(id: number): Promise<boolean> {
    const result = await db
      .update(schema.sessions)
      .set({ isActive: false })
      .where(eq(schema.sessions.id, id))
      .returning({ id: schema.sessions.id });
    return result.length > 0;
  }

  async terminateAllSessions(userId: number, exceptSessionId?: number): Promise<boolean> {
    const conditions = [
      eq(schema.sessions.userId, userId),
      eq(schema.sessions.isActive, true)
    ];
    
    if (exceptSessionId !== undefined) {
      conditions.push(ne(schema.sessions.id, exceptSessionId));
    }
    
    const result = await db
      .update(schema.sessions)
      .set({ isActive: false })
      .where(and(...conditions))
      .returning({ id: schema.sessions.id });
    
    return true;
  }

  // Stored Passwords methods
  async getStoredPasswords(userId: number): Promise<StoredPassword[]> {
    return await db
      .select()
      .from(schema.storedPasswords)
      .where(eq(schema.storedPasswords.userId, userId))
      .orderBy(schema.storedPasswords.website);
  }

  async getStoredPassword(id: number): Promise<StoredPassword | undefined> {
    const [password] = await db
      .select()
      .from(schema.storedPasswords)
      .where(eq(schema.storedPasswords.id, id));
    return password || undefined;
  }

  async createStoredPassword(password: InsertStoredPassword): Promise<StoredPassword> {
    const [storedPassword] = await db
      .insert(schema.storedPasswords)
      .values(password)
      .returning();
    return storedPassword;
  }

  async updateStoredPassword(id: number, updates: Partial<StoredPassword>): Promise<StoredPassword | undefined> {
    const [updatedPassword] = await db
      .update(schema.storedPasswords)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(schema.storedPasswords.id, id))
      .returning();
    return updatedPassword || undefined;
  }

  async deleteStoredPassword(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.storedPasswords)
      .where(eq(schema.storedPasswords.id, id))
      .returning({ id: schema.storedPasswords.id });
    return result.length > 0;
  }

  // Security Recommendations methods
  async getSecurityRecommendations(userId: number): Promise<SecurityRecommendation[]> {
    return await db
      .select()
      .from(schema.securityRecommendations)
      .where(eq(schema.securityRecommendations.userId, userId));
  }

  async updateSecurityRecommendation(id: number, updates: Partial<SecurityRecommendation>): Promise<SecurityRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(schema.securityRecommendations)
      .set(updates)
      .where(eq(schema.securityRecommendations.id, id))
      .returning();
    return updatedRecommendation || undefined;
  }

  // Dashboard methods
  async getUserSecuritySummary(userId: number): Promise<{
    securityScore: number;
    activeSessions: number;
    weakPasswords: number;
    recommendations: number;
    alerts: number;
  }> {
    // Get user information
    const [user] = await db
      .select({ securityScore: schema.users.securityScore })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    // Count active sessions
    const [sessionCount] = await db
      .select({ count: count() })
      .from(schema.sessions)
      .where(and(
        eq(schema.sessions.userId, userId),
        eq(schema.sessions.isActive, true)
      ));

    // Count weak passwords
    const [weakPasswordCount] = await db
      .select({ count: count() })
      .from(schema.storedPasswords)
      .where(and(
        eq(schema.storedPasswords.userId, userId),
        eq(schema.storedPasswords.strength, "weak")
      ));

    // Count pending recommendations
    const [recommendationsCount] = await db
      .select({ count: count() })
      .from(schema.securityRecommendations)
      .where(and(
        eq(schema.securityRecommendations.userId, userId),
        eq(schema.securityRecommendations.isCompleted, false)
      ));

    // Count unread alerts
    const [alertsCount] = await db
      .select({ count: count() })
      .from(schema.securityAlerts)
      .where(and(
        eq(schema.securityAlerts.userId, userId),
        eq(schema.securityAlerts.isRead, false)
      ));

    return {
      securityScore: user?.securityScore || 0,
      activeSessions: sessionCount?.count || 0,
      weakPasswords: weakPasswordCount?.count || 0,
      recommendations: recommendationsCount?.count || 0,
      alerts: alertsCount?.count || 0
    };
  }
}

// Use DatabaseStorage with PostgreSQL instead of MemStorage
export const storage = new DatabaseStorage();
