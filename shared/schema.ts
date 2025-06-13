import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  handicap: integer("handicap").notNull().default(18),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  holes: integer("holes").notNull(),
  currentHole: integer("current_hole").default(1),
  bettingOptions: jsonb("betting_options").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completed: boolean("completed").default(false),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  name: text("name").notNull(),
  handicap: integer("handicap").notNull(),
  grossTotal: integer("gross_total").default(0),
  netTotal: integer("net_total").default(0),
  moneyBalance: real("money_balance").default(0),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  holeNumber: integer("hole_number").notNull(),
  grossScore: integer("gross_score").notNull(),
  netScore: integer("net_score").notNull(),
  par: integer("par").notNull(),
  strokeIndex: integer("stroke_index").notNull(),
});

// Relations
export const roundsRelations = relations(rounds, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  round: one(rounds, {
    fields: [players.roundId],
    references: [rounds.id],
  }),
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  player: one(players, {
    fields: [scores.playerId],
    references: [players.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  pin: true,
  handicap: true,
});

export const insertRoundSchema = createInsertSchema(rounds).pick({
  course: true,
  holes: true,
  currentHole: true,
  bettingOptions: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  roundId: true,
  name: true,
  handicap: true,
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  playerId: true,
  holeNumber: true,
  grossScore: true,
  netScore: true,
  par: true,
  strokeIndex: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
