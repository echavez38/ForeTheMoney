import { users, rounds, players, scores, type User, type InsertUser, type RegisterUser, type LoginUser, type Round, type Player, type Score, type InsertRound, type InsertPlayer, type InsertScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPin(pin: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>; // email o username
  createUser(user: InsertUser): Promise<User>;
  registerUser(userData: RegisterUser): Promise<User>;
  authenticateUser(loginData: LoginUser): Promise<User | null>;
  updateLastLogin(userId: number): Promise<void>;
  updateSubscription(userId: number, subscriptionData: {
    subscriptionType: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
  }): Promise<void>;
  incrementRoundCount(userId: number): Promise<void>;
  updateHandicap(userId: number, handicap: number): Promise<void>;
  
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(eq(users.email, identifier), eq(users.username, identifier))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async registerUser(userData: RegisterUser): Promise<User> {
    // Hash password if provided
    let hashedPassword = null;
    if (userData.password) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    }

    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        handicap: userData.handicap,
        pin: userData.pin || null,
        password: hashedPassword,
        authType: userData.authType,
        isActive: true,
      })
      .returning();
    
    return user;
  }

  async authenticateUser(loginData: LoginUser): Promise<User | null> {
    const user = await this.getUserByIdentifier(loginData.identifier);
    if (!user || !user.isActive) {
      return null;
    }

    // Verify credentials based on auth type
    if (user.authType === 'pin' && user.pin) {
      if (loginData.credential === user.pin) {
        await this.updateLastLogin(user.id);
        return user;
      }
    } else if (user.authType === 'password' && user.password) {
      const isValidPassword = await bcrypt.compare(loginData.credential, user.password);
      if (isValidPassword) {
        await this.updateLastLogin(user.id);
        return user;
      }
    }

    return null;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  async updateSubscription(userId: number, subscriptionData: {
    subscriptionType: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        subscriptionType: subscriptionData.subscriptionType,
        subscriptionStartDate: subscriptionData.subscriptionStartDate,
        subscriptionEndDate: subscriptionData.subscriptionEndDate
      })
      .where(eq(users.id, userId));
  }

  async incrementRoundCount(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const now = new Date();
    const lastReset = user.lastMonthReset || user.createdAt || now;
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    // Reset counter if it's been more than 30 days
    if (daysSinceReset >= 30) {
      await db
        .update(users)
        .set({
          roundsThisMonth: 1,
          lastMonthReset: now
        })
        .where(eq(users.id, userId));
    } else {
      await db
        .update(users)
        .set({
          roundsThisMonth: user.roundsThisMonth + 1
        })
        .where(eq(users.id, userId));
    }
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
