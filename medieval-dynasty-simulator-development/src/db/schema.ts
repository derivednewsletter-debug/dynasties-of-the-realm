import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const dynastySaves = pgTable("dynasty_saves", {
  id: uuid("id").defaultRandom().primaryKey(),
  slot: text("slot").notNull().unique(),
  houseName: text("house_name").notNull(),
  rulerName: text("ruler_name").notNull(),
  payload: jsonb("payload").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DynastySave = typeof dynastySaves.$inferSelect;
export type NewDynastySave = typeof dynastySaves.$inferInsert;
