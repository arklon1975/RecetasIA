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

export const nutritionalGoals = pgTable("nutritional_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default_user"), // For future user system
  dailyCalories: integer("daily_calories").notNull(),
  dailyProtein: integer("daily_protein").notNull(), // grams
  dailyCarbs: integer("daily_carbs").notNull(), // grams
  dailyFat: integer("daily_fat").notNull(), // grams
  dailyFiber: integer("daily_fiber").notNull(), // grams
  dailySodium: integer("daily_sodium").notNull(), // milligrams
  createdAt: text("created_at").notNull().default("now()"),
  updatedAt: text("updated_at").notNull().default("now()"),
});

export const mealEntries = pgTable("meal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default_user"),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  servings: decimal("servings", { precision: 4, scale: 2 }).notNull().default("1"),
  mealType: text("meal_type", { enum: ["Desayuno", "Almuerzo", "Cena", "Snack"] }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  createdAt: text("created_at").notNull().default("now()"),
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

export const insertNutritionalGoalSchema = createInsertSchema(nutritionalGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMealEntrySchema = createInsertSchema(mealEntries).omit({
  id: true,
  createdAt: true,
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

export const nutritionalGoalSchema = z.object({
  dailyCalories: z.number().min(1000).max(5000),
  dailyProtein: z.number().min(10).max(300),
  dailyCarbs: z.number().min(50).max(800),
  dailyFat: z.number().min(20).max(200),
  dailyFiber: z.number().min(15).max(100),
  dailySodium: z.number().min(500).max(5000),
});

export const mealEntrySchema = z.object({
  recipeId: z.number(),
  servings: z.number().min(0.1).max(10),
  mealType: z.enum(["Desayuno", "Almuerzo", "Cena", "Snack"]),
  date: z.string(), // YYYY-MM-DD format
});

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalFiber: number;
  goalSodium: number;
}

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type SearchRequest = typeof searchRequests.$inferSelect;
export type InsertSearchRequest = z.infer<typeof insertSearchRequestSchema>;
export type RecipeSearchParams = z.infer<typeof recipeSearchSchema>;
export type NutritionalGoal = typeof nutritionalGoals.$inferSelect;
export type InsertNutritionalGoal = z.infer<typeof insertNutritionalGoalSchema>;
export type MealEntry = typeof mealEntries.$inferSelect;
export type InsertMealEntry = z.infer<typeof insertMealEntrySchema>;
