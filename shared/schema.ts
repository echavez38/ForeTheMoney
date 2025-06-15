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

// User preferences table for settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  distanceUnit: varchar("distance_unit", { length: 10 }).default('meters').notNull(),
  defaultTees: varchar("default_tees", { length: 20 }).default('Azules').notNull(),
  defaultBettingAmount: integer("default_betting_amount").default(10).notNull(),
  defaultGameFormat: varchar("default_game_format", { length: 10 }).default('both').notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  theme: varchar("theme", { length: 10 }).default('dark').notNull(),
  language: varchar("language", { length: 5 }).default('es').notNull(),
  fontSize: varchar("font_size", { length: 10 }).default('medium').notNull(),
  roundReminders: boolean("round_reminders").default(true).notNull(),
  handicapUpdates: boolean("handicap_updates").default(true).notNull(),
  friendInvites: boolean("friend_invites").default(true).notNull(),
  achievements: boolean("achievements").default(true).notNull(),
  weeklyReports: boolean("weekly_reports").default(false).notNull(),
  socialActivity: boolean("social_activity").default(true).notNull(),
  betResults: boolean("bet_results").default(true).notNull(),
  courseConditions: boolean("course_conditions").default(false).notNull(),
  sound: boolean("sound").default(true).notNull(),
  vibration: boolean("vibration").default(true).notNull(),
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false).notNull(),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default('22:00').notNull(),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default('08:00').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
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
  ghinNumber: z.string().optional().transform(val => !val || val === "" ? undefined : val),
  authType: z.enum(["pin", "password"]),
  pin: z.string().optional().transform(val => !val || val === "" ? undefined : val),
  password: z.string().optional().transform(val => !val || val === "" ? undefined : val),
}).superRefine((data, ctx) => {
  // Validate authentication method
  if (data.authType === "pin") {
    if (!data.pin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIN es requerido cuando seleccionas autenticación por PIN",
        path: ["pin"]
      });
    } else if (data.pin.length !== 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIN debe tener exactamente 6 dígitos",
        path: ["pin"]
      });
    } else if (!/^\d+$/.test(data.pin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIN solo puede contener números",
        path: ["pin"]
      });
    }
  }
  
  if (data.authType === "password") {
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contraseña es requerida cuando seleccionas autenticación por contraseña",
        path: ["password"]
      });
    } else if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contraseña debe tener al menos 8 caracteres",
        path: ["password"]
      });
    }
  }
  
  // Validate GHIN number if provided
  if (data.ghinNumber && !/^\d{7,8}$/.test(data.ghinNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Número GHIN debe tener 7-8 dígitos",
      path: ["ghinNumber"]
    });
  }
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

// User preferences schemas and types
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserPreferencesSchema = insertUserPreferencesSchema.partial().omit({
  userId: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
