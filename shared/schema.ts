import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  handicap: integer("handicap").notNull().default(18),
  ghinNumber: varchar("ghin_number", { length: 20 }),
  handicapVerified: boolean("handicap_verified").notNull().default(false),
  handicapLastVerified: timestamp("handicap_last_verified"),
  pin: varchar("pin", { length: 6 }),
  password: text("password"),
  authType: varchar("auth_type", { length: 10 }).notNull().default("pin"), // "pin" or "password"
  isActive: boolean("is_active").notNull().default(true),
  subscriptionType: varchar("subscription_type", { length: 20 }).notNull().default("free"), // "free" or "premium"
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  roundsThisMonth: integer("rounds_this_month").notNull().default(0),
  lastMonthReset: timestamp("last_month_reset").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  course: text("course").notNull(),
  holes: integer("holes").notNull(),
  currentHole: integer("current_hole").default(1),
  gameFormats: jsonb("game_formats").notNull(),
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
  email: true,
  username: true,
  name: true,
  handicap: true,
  pin: true,
  password: true,
  authType: true,
});

// Schemas de validación para registro y login
export const registerUserSchema = z.object({
  email: z.string().email("Email válido requerido"),
  username: z.string()
    .min(3, "Username debe tener al menos 3 caracteres")
    .max(20, "Username no puede exceder 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Username solo puede contener letras, números y guiones bajos"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  handicap: z.number().min(0).max(54).default(18),
  ghinNumber: z.string()
    .regex(/^\d{7,8}$/, "Número GHIN debe tener 7-8 dígitos")
    .optional(),
  authType: z.enum(["pin", "password"]),
  pin: z.string().length(6, "PIN debe tener exactamente 6 dígitos").regex(/^\d+$/, "PIN solo puede contener números").optional(),
  password: z.string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial")
    .optional(),
}).refine((data) => {
  if (data.authType === "pin" && !data.pin) {
    return false;
  }
  if (data.authType === "password" && !data.password) {
    return false;
  }
  return true;
}, {
  message: "PIN o contraseña requerido según el tipo de autenticación seleccionado",
});

export const loginUserSchema = z.object({
  identifier: z.string().min(1, "Email o username requerido"), // email o username
  credential: z.string().min(1, "PIN o contraseña requerido"), // pin o password
});

export const insertRoundSchema = createInsertSchema(rounds).pick({
  course: true,
  holes: true,
  currentHole: true,
  gameFormats: true,
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
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
