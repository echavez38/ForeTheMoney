import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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

  // Game room management
  interface GameRoom {
    id: string;
    code: string;
    hostId: string;
    players: Array<{
      id: string;
      name: string;
      handicap: number;
      isHost: boolean;
      connected: boolean;
    }>;
    roundData?: any;
    createdAt: Date;
    status: 'waiting' | 'playing' | 'finished';
  }

  const gameRooms = new Map<string, GameRoom>();
  const playerConnections = new Map<string, { ws: WebSocket; roomCode?: string; playerId?: string }>();

  // Generate unique room code
  function generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Room API routes
  app.post("/api/rooms/create", async (req, res) => {
    try {
      const { hostName, hostHandicap, hostId } = req.body;
      
      let roomCode;
      do {
        roomCode = generateRoomCode();
      } while (gameRooms.has(roomCode));

      const room: GameRoom = {
        id: `room_${Date.now()}`,
        code: roomCode,
        hostId,
        players: [{
          id: hostId,
          name: hostName,
          handicap: hostHandicap,
          isHost: true,
          connected: false
        }],
        createdAt: new Date(),
        status: 'waiting'
      };

      gameRooms.set(roomCode, room);
      res.json({ roomCode, room });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  app.post("/api/rooms/:code/join", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId, playerName, playerHandicap } = req.body;
      
      const room = gameRooms.get(code);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      if (room.status !== 'waiting') {
        return res.status(400).json({ error: 'Room is not accepting new players' });
      }

      if (room.players.length >= 6) {
        return res.status(400).json({ error: 'Room is full' });
      }

      // Check if player already in room
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (existingPlayer) {
        return res.json({ room });
      }

      room.players.push({
        id: playerId,
        name: playerName,
        handicap: playerHandicap,
        isHost: false,
        connected: false
      });

      // Notify all players in room
      broadcastToRoom(code, {
        type: 'player_joined',
        player: { id: playerId, name: playerName, handicap: playerHandicap },
        room
      });

      res.json({ room });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ error: 'Failed to join room' });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = gameRooms.get(code);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({ room });
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/rooms/:code/start", async (req, res) => {
    try {
      const { code } = req.params;
      const { roundData } = req.body;
      
      const room = gameRooms.get(code);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      room.status = 'playing';
      room.roundData = roundData;

      // Broadcast round start to all players
      broadcastToRoom(code, {
        type: 'round_started',
        roundData,
        room
      });

      res.json({ success: true, room });
    } catch (error) {
      console.error('Error starting round:', error);
      res.status(500).json({ error: 'Failed to start round' });
    }
  });

  function broadcastToRoom(roomCode: string, message: any) {
    const room = gameRooms.get(roomCode);
    if (!room) return;

    room.players.forEach(player => {
      playerConnections.forEach((connection, connectionId) => {
        if (connection.roomCode === roomCode && connection.playerId === player.id) {
          if (connection.ws.readyState === WebSocket.OPEN) {
            connection.ws.send(JSON.stringify(message));
          }
        }
      });
    });
  }

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const connectionId = `conn_${Date.now()}_${Math.random()}`;
    playerConnections.set(connectionId, { ws });

    console.log(`New WebSocket connection: ${connectionId}`);

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        const connection = playerConnections.get(connectionId);
        
        if (!connection) return;

        switch (message.type) {
          case 'join_room':
            const { roomCode, playerId } = message;
            const room = gameRooms.get(roomCode);
            
            if (room && room.players.find(p => p.id === playerId)) {
              connection.roomCode = roomCode;
              connection.playerId = playerId;
              
              // Update player connection status
              const player = room.players.find(p => p.id === playerId);
              if (player) {
                player.connected = true;
              }

              // Send current room state
              ws.send(JSON.stringify({
                type: 'room_joined',
                room
              }));

              // Notify others of connection
              broadcastToRoom(roomCode, {
                type: 'player_connected',
                playerId,
                room
              });
            } else {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Room not found or player not in room'
              }));
            }
            break;

          case 'score_update':
            if (connection.roomCode && connection.playerId) {
              const { holeNumber, score, playerId: scorePlayerId } = message;
              
              broadcastToRoom(connection.roomCode, {
                type: 'score_updated',
                holeNumber,
                score,
                playerId: scorePlayerId,
                updatedBy: connection.playerId
              });
            }
            break;

          case 'hole_navigation':
            if (connection.roomCode && connection.playerId) {
              const { currentHole, direction } = message;
              
              broadcastToRoom(connection.roomCode, {
                type: 'hole_changed',
                currentHole,
                direction,
                changedBy: connection.playerId
              });
            }
            break;

          case 'round_complete':
            if (connection.roomCode && connection.playerId) {
              const room = gameRooms.get(connection.roomCode);
              if (room) {
                room.status = 'finished';
                broadcastToRoom(connection.roomCode, {
                  type: 'round_completed',
                  room
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      const connection = playerConnections.get(connectionId);
      if (connection && connection.roomCode && connection.playerId) {
        const room = gameRooms.get(connection.roomCode);
        if (room) {
          const player = room.players.find(p => p.id === connection.playerId);
          if (player) {
            player.connected = false;
          }
          
          broadcastToRoom(connection.roomCode, {
            type: 'player_disconnected',
            playerId: connection.playerId,
            room
          });
        }
      }
      
      playerConnections.delete(connectionId);
      console.log(`WebSocket connection closed: ${connectionId}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      playerConnections.delete(connectionId);
    });
  });

  // Cleanup old rooms periodically
  setInterval(() => {
    const now = new Date();
    gameRooms.forEach((room, code) => {
      const hoursSinceCreated = (now.getTime() - room.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreated > 24) { // Remove rooms older than 24 hours
        gameRooms.delete(code);
      }
    });
  }, 60 * 60 * 1000); // Check every hour

  return httpServer;
}
