import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRoundSchema, insertPlayerSchema, insertScoreSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error(`Error creating user: ${error}`);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/pin/:pin", async (req, res) => {
    try {
      const user = await storage.getUserByPin(req.params.pin);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error(`Error getting user by PIN: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Round routes
  app.post("/api/rounds", async (req, res) => {
    try {
      const roundData = insertRoundSchema.parse(req.body);
      const round = await storage.createRound(roundData);
      res.json(round);
    } catch (error) {
      console.error(`Error creating round: ${error}`);
      res.status(400).json({ error: "Invalid round data" });
    }
  });

  app.get("/api/rounds/:id", async (req, res) => {
    try {
      const round = await storage.getRound(parseInt(req.params.id));
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }
      res.json(round);
    } catch (error) {
      console.error(`Error getting round: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/rounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const round = await storage.updateRound(id, updates);
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }
      res.json(round);
    } catch (error) {
      console.error(`Error updating round: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rounds", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const rounds = await storage.getRecentRounds(limit);
      res.json(rounds);
    } catch (error) {
      console.error(`Error getting recent rounds: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Player routes
  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      console.error(`Error creating player: ${error}`);
      res.status(400).json({ error: "Invalid player data" });
    }
  });

  app.get("/api/rounds/:roundId/players", async (req, res) => {
    try {
      const roundId = parseInt(req.params.roundId);
      const players = await storage.getPlayersByRound(roundId);
      res.json(players);
    } catch (error) {
      console.error(`Error getting players: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const player = await storage.updatePlayer(id, updates);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error(`Error updating player: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Score routes
  app.post("/api/scores", async (req, res) => {
    try {
      const scoreData = insertScoreSchema.parse(req.body);
      const score = await storage.createScore(scoreData);
      res.json(score);
    } catch (error) {
      console.error(`Error creating score: ${error}`);
      res.status(400).json({ error: "Invalid score data" });
    }
  });

  app.get("/api/players/:playerId/scores", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const scores = await storage.getScoresByPlayer(playerId);
      res.json(scores);
    } catch (error) {
      console.error(`Error getting scores: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/scores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const score = await storage.updateScore(id, updates);
      if (!score) {
        return res.status(404).json({ error: "Score not found" });
      }
      res.json(score);
    } catch (error) {
      console.error(`Error updating score: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
