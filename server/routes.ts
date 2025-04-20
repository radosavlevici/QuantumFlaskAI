import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSecurityEventSchema, 
  insertSecurityAlertSchema,
  insertSessionSchema,
  insertStoredPasswordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Mock user ID for demo - in a real app this would come from auth
  const getUserId = (req: Request): number => {
    return 1; // Mock user ID
  };

  // User routes
  apiRouter.get("/user", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Exclude sensitive fields
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Dashboard summary
  apiRouter.get("/dashboard/summary", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const summary = await storage.getUserSecuritySummary(userId);
    res.json(summary);
  });

  // Security events routes
  apiRouter.get("/security-events", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const events = await storage.getSecurityEvents(userId, limit);
    res.json(events);
  });

  apiRouter.post("/security-events", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    try {
      const eventData = insertSecurityEventSchema.parse({
        ...req.body,
        userId
      });
      const event = await storage.createSecurityEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create security event" });
      }
    }
  });

  // Security alerts routes
  apiRouter.get("/security-alerts", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const alerts = await storage.getSecurityAlerts(userId);
    res.json(alerts);
  });

  apiRouter.post("/security-alerts", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    try {
      const alertData = insertSecurityAlertSchema.parse({
        ...req.body,
        userId
      });
      const alert = await storage.createSecurityAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create security alert" });
      }
    }
  });

  apiRouter.post("/security-alerts/:id/dismiss", async (req: Request, res: Response) => {
    const alertId = parseInt(req.params.id);
    const success = await storage.dismissSecurityAlert(alertId);
    
    if (success) {
      res.json({ message: "Alert dismissed successfully" });
    } else {
      res.status(404).json({ message: "Alert not found" });
    }
  });

  // Sessions routes
  apiRouter.get("/sessions", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const sessions = await storage.getSessions(userId);
    res.json(sessions);
  });

  apiRouter.post("/sessions", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    try {
      const sessionData = insertSessionSchema.parse({
        ...req.body,
        userId
      });
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  apiRouter.post("/sessions/:id/terminate", async (req: Request, res: Response) => {
    const sessionId = parseInt(req.params.id);
    const success = await storage.terminateSession(sessionId);
    
    if (success) {
      res.json({ message: "Session terminated successfully" });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  });

  apiRouter.post("/sessions/terminate-all", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const currentSessionId = req.body.currentSessionId ? parseInt(req.body.currentSessionId) : undefined;
    
    await storage.terminateAllSessions(userId, currentSessionId);
    res.json({ message: "All sessions terminated successfully" });
  });

  // Stored passwords routes
  apiRouter.get("/passwords", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const passwords = await storage.getStoredPasswords(userId);
    res.json(passwords);
  });

  apiRouter.post("/passwords", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    try {
      const passwordData = insertStoredPasswordSchema.parse({
        ...req.body,
        userId
      });
      const storedPassword = await storage.createStoredPassword(passwordData);
      res.status(201).json(storedPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid password data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to store password" });
      }
    }
  });

  apiRouter.put("/passwords/:id", async (req: Request, res: Response) => {
    const passwordId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedPassword = await storage.updateStoredPassword(passwordId, updates);
    
    if (updatedPassword) {
      res.json(updatedPassword);
    } else {
      res.status(404).json({ message: "Password not found" });
    }
  });

  apiRouter.delete("/passwords/:id", async (req: Request, res: Response) => {
    const passwordId = parseInt(req.params.id);
    const success = await storage.deleteStoredPassword(passwordId);
    
    if (success) {
      res.json({ message: "Password deleted successfully" });
    } else {
      res.status(404).json({ message: "Password not found" });
    }
  });

  // Security recommendations routes
  apiRouter.get("/recommendations", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const recommendations = await storage.getSecurityRecommendations(userId);
    res.json(recommendations);
  });

  apiRouter.put("/recommendations/:id", async (req: Request, res: Response) => {
    const recommendationId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedRecommendation = await storage.updateSecurityRecommendation(recommendationId, updates);
    
    if (updatedRecommendation) {
      res.json(updatedRecommendation);
    } else {
      res.status(404).json({ message: "Recommendation not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
