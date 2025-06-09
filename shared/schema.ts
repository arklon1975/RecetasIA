import { pgTable, text, serial, integer, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ingredients: json("ingredients").$type<RecipeIngredient[]>().notNull(),
  steps: json("steps").$type<RecipeStep[]>().notNull(),
  nutrition: json("nutrition").$type<NutritionInfo>().notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  cookTime: integer("cook_time").notNull(), // in minutes
  difficulty: text("difficulty", { enum: ["Muy Fácil", "Fácil", "Intermedio", "Avanzado"] }).notNull(),
  healthScore: integer("health_score").notNull(), // 1-100
  calories: integer("calories").notNull(),
  servings: integer("servings").notNull().default(2),
  imageUrl: text("image_url"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  baseIngredients: json("base_ingredients").$type<string[]>().notNull() // The 4 main ingredients
});

export const searchRequests = pgTable("search_requests", {
  id: serial("id").primaryKey(),
  ingredient1: text("ingredient1").notNull(),
  ingredient2: text("ingredient2").notNull(),
  ingredient3: text("ingredient3").notNull(),
  ingredient4: text("ingredient4").notNull(),
  maxTime: integer("max_time"),
  difficulty: text("difficulty"),
  maxCost: decimal("max_cost", { precision: 10, scale: 2 }),
  sortBy: text("sort_by").notNull().default("health"),
});

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeMinutes: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sodium: number; // milligrams
}

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertSearchRequestSchema = createInsertSchema(searchRequests).omit({
  id: true,
});

export const recipeSearchSchema = z.object({
  ingredient1: z.string().min(1, "Ingredient 1 is required"),
  ingredient2: z.string().min(1, "Ingredient 2 is required"),
  ingredient3: z.string().min(1, "Ingredient 3 is required"),
  ingredient4: z.string().min(1, "Ingredient 4 is required"),
  maxTime: z.number().optional(),
  difficulty: z.string().optional(),
  maxCost: z.number().optional(),
  sortBy: z.enum(["health", "time", "cost", "difficulty"]).default("health"),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type SearchRequest = typeof searchRequests.$inferSelect;
export type InsertSearchRequest = z.infer<typeof insertSearchRequestSchema>;
export type RecipeSearchParams = z.infer<typeof recipeSearchSchema>;
