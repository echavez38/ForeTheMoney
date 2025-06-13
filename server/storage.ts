import { users, rounds, players, scores, type User, type InsertUser, type Round, type Player, type Score, type InsertRound, type InsertPlayer, type InsertScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPin(pin: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Round operations
  createRound(round: InsertRound): Promise<Round>;
  getRound(id: number): Promise<Round | undefined>;
  updateRound(id: number, updates: Partial<Round>): Promise<Round | undefined>;
  getRecentRounds(limit?: number): Promise<Round[]>;
  
  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByRound(roundId: number): Promise<Player[]>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  
  // Score operations
  createScore(score: InsertScore): Promise<Score>;
  getScoresByPlayer(playerId: number): Promise<Score[]>;
  updateScore(id: number, updates: Partial<Score>): Promise<Score | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPin(pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.pin, pin));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const [round] = await db
      .insert(rounds)
      .values(insertRound)
      .returning();
    return round;
  }

  async getRound(id: number): Promise<Round | undefined> {
    const [round] = await db.select().from(rounds).where(eq(rounds.id, id));
    return round || undefined;
  }

  async updateRound(id: number, updates: Partial<Round>): Promise<Round | undefined> {
    const [round] = await db
      .update(rounds)
      .set(updates)
      .where(eq(rounds.id, id))
      .returning();
    return round || undefined;
  }

  async getRecentRounds(limit: number = 10): Promise<Round[]> {
    return await db
      .select()
      .from(rounds)
      .orderBy(desc(rounds.createdAt))
      .limit(limit);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async getPlayersByRound(roundId: number): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.roundId, roundId));
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db
      .insert(scores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getScoresByPlayer(playerId: number): Promise<Score[]> {
    return await db
      .select()
      .from(scores)
      .where(eq(scores.playerId, playerId));
  }

  async updateScore(id: number, updates: Partial<Score>): Promise<Score | undefined> {
    const [score] = await db
      .update(scores)
      .set(updates)
      .where(eq(scores.id, id))
      .returning();
    return score || undefined;
  }
}

export const storage = new DatabaseStorage();
