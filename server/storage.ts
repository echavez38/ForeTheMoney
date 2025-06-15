import { users, rounds, players, scores, userPreferences, socialPosts, socialPostLikes, socialPostComments, type User, type InsertUser, type RegisterUser, type LoginUser, type Round, type Player, type Score, type InsertRound, type InsertPlayer, type InsertScore, type UserPreferences, type InsertUserPreferences, type UpdateUserPreferences, type SocialPost, type InsertSocialPost, type SocialComment, type InsertSocialComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and } from "drizzle-orm";
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
  updateUser(userId: number, updates: Partial<User>): Promise<User>;
  deleteUser(userId: number): Promise<void>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: UpdateUserPreferences): Promise<UserPreferences>;
  deleteUserPreferences(userId: number): Promise<void>;
  
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
  
  // Social operations
  getSocialFeed(userId?: number, limit?: number, offset?: number): Promise<any[]>;
  createSocialPost(post: Partial<InsertSocialPost>): Promise<SocialPost>;
  likeSocialPost(postId: number, userId: number): Promise<void>;
  unlikeSocialPost(postId: number, userId: number): Promise<void>;
  addSocialComment(postId: number, userId: number, content: string): Promise<SocialComment>;
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

  async updateHandicap(userId: number, handicap: number): Promise<void> {
    await db
      .update(users)
      .set({
        handicap: handicap,
        handicapVerified: true,
        handicapLastVerified: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  async deleteUser(userId: number): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [newPreferences] = await db
      .insert(userPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async updateUserPreferences(userId: number, updates: UpdateUserPreferences): Promise<UserPreferences> {
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning();
    
    if (!updatedPreferences) {
      // Create preferences if they don't exist
      return this.createUserPreferences({ userId, ...updates });
    }
    
    return updatedPreferences;
  }

  async deleteUserPreferences(userId: number): Promise<void> {
    await db
      .delete(userPreferences)
      .where(eq(userPreferences.userId, userId));
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

  // Social operations
  async getSocialFeed(userId?: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const posts = await db
      .select({
        id: socialPosts.id,
        userId: socialPosts.userId,
        userName: users.name,
        userHandicap: users.handicap,
        content: socialPosts.content,
        courseId: socialPosts.courseId,
        courseName: socialPosts.courseName,
        roundDate: socialPosts.roundDate,
        totalScore: socialPosts.totalScore,
        par: socialPosts.par,
        highlights: socialPosts.highlights,
        imageUrl: socialPosts.imageUrl,
        visibility: socialPosts.visibility,
        likes: socialPosts.likes,
        commentsCount: socialPosts.commentsCount,
        createdAt: socialPosts.createdAt,
      })
      .from(socialPosts)
      .innerJoin(users, eq(socialPosts.userId, users.id))
      .where(eq(socialPosts.visibility, 'public'))
      .orderBy(desc(socialPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return posts.map(post => ({
      ...post,
      scoreTopar: post.totalScore && post.par ? post.totalScore - post.par : 0,
      highlights: post.highlights || [],
      hasLiked: false,
      comments: [],
    }));
  }

  async createSocialPost(postData: Partial<InsertSocialPost>): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values(postData as InsertSocialPost)
      .returning();
    return post;
  }

  async likeSocialPost(postId: number, userId: number): Promise<void> {
    await db.insert(socialPostLikes).values({ postId, userId }).onConflictDoNothing();
  }

  async unlikeSocialPost(postId: number, userId: number): Promise<void> {
    await db.delete(socialPostLikes)
      .where(and(eq(socialPostLikes.postId, postId), eq(socialPostLikes.userId, userId)));
  }

  async addSocialComment(postId: number, userId: number, content: string): Promise<SocialComment> {
    const [comment] = await db
      .insert(socialPostComments)
      .values({ postId, userId, content })
      .returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
