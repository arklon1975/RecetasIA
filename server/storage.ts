import { 
  recipes, 
  searchRequests, 
  nutritionalGoals, 
  mealEntries,
  userProfiles,
  favoriteRecipes,
  type Recipe, 
  type InsertRecipe, 
  type SearchRequest, 
  type InsertSearchRequest, 
  type RecipeSearchParams,
  type NutritionalGoal,
  type InsertNutritionalGoal,
  type MealEntry,
  type InsertMealEntry,
  type DailyNutritionSummary,
  type UserProfile,
  type InsertUserProfile,
  type FavoriteRecipe,
  type InsertFavoriteRecipe
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  searchRecipes(params: RecipeSearchParams): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getAllRecipes(): Promise<Recipe[]>;
  
  // Search request operations
  createSearchRequest(request: InsertSearchRequest): Promise<SearchRequest>;
  
  // Nutritional goal operations
  getNutritionalGoal(userId?: string): Promise<NutritionalGoal | undefined>;
  createNutritionalGoal(goal: InsertNutritionalGoal): Promise<NutritionalGoal>;
  updateNutritionalGoal(userId: string, goal: Partial<InsertNutritionalGoal>): Promise<NutritionalGoal>;
  
  // Meal entry operations
  createMealEntry(entry: InsertMealEntry): Promise<MealEntry>;
  getMealEntriesForDate(date: string, userId?: string): Promise<MealEntry[]>;
  getDailyNutritionSummary(date: string, userId?: string): Promise<DailyNutritionSummary>;
  deleteMealEntry(id: number): Promise<void>;
  
  // User profile operations
  getUserProfile(userId?: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Favorite recipe operations
  getFavoriteRecipes(userId?: string): Promise<Recipe[]>;
  addFavoriteRecipe(userId: string, recipeId: number): Promise<FavoriteRecipe>;
  removeFavoriteRecipe(userId: string, recipeId: number): Promise<void>;
  isRecipeFavorite(userId: string, recipeId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
    const { ingredient1, ingredient2, ingredient3, ingredient4, maxTime, difficulty, maxCost, sortBy } = params;
    const searchIngredients = [ingredient1, ingredient2, ingredient3, ingredient4].map(i => i.toLowerCase().trim());
    
    // Get all recipes and filter them
    const allRecipes = await db.select().from(recipes);
    
    let filteredRecipes = allRecipes.filter(recipe => {
      // Check if recipe contains at least 3 of the 4 ingredients
      const recipeIngredients = recipe.baseIngredients.map(i => i.toLowerCase());
      const matchCount = searchIngredients.filter(searchIngredient => 
        recipeIngredients.some(recipeIngredient => 
          recipeIngredient.includes(searchIngredient) || searchIngredient.includes(recipeIngredient)
        )
      ).length;
      
      if (matchCount < 3) return false;
      
      // Apply filters
      if (maxTime && (recipe.prepTime + recipe.cookTime) > maxTime) return false;
      if (difficulty && recipe.difficulty !== difficulty) return false;
      if (maxCost && parseFloat(recipe.estimatedCost) > maxCost) return false;
      
      return true;
    });

    // Sort results
    filteredRecipes.sort((a, b) => {
      switch (sortBy) {
        case "health":
          return b.healthScore - a.healthScore;
        case "time":
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        case "cost":
          return parseFloat(a.estimatedCost) - parseFloat(b.estimatedCost);
        case "difficulty":
          const difficultyOrder = { "Muy Fácil": 1, "Fácil": 2, "Intermedio": 3, "Avanzado": 4 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return b.healthScore - a.healthScore;
      }
    });

    return filteredRecipes;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async createSearchRequest(request: InsertSearchRequest): Promise<SearchRequest> {
    const [newRequest] = await db
      .insert(searchRequests)
      .values({
        ...request,
        maxTime: request.maxTime || null,
        difficulty: request.difficulty || null,
        maxCost: request.maxCost || null,
      })
      .returning();
    return newRequest;
  }

  async getNutritionalGoal(userId: string = "default_user"): Promise<NutritionalGoal | undefined> {
    const [goal] = await db
      .select()
      .from(nutritionalGoals)
      .where(eq(nutritionalGoals.userId, userId))
      .orderBy(sql`${nutritionalGoals.updatedAt} DESC`)
      .limit(1);
    return goal || undefined;
  }

  async createNutritionalGoal(goal: InsertNutritionalGoal): Promise<NutritionalGoal> {
    const [newGoal] = await db
      .insert(nutritionalGoals)
      .values({
        ...goal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    return newGoal;
  }

  async updateNutritionalGoal(userId: string, goalUpdate: Partial<InsertNutritionalGoal>): Promise<NutritionalGoal> {
    const [updatedGoal] = await db
      .update(nutritionalGoals)
      .set({
        ...goalUpdate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(nutritionalGoals.userId, userId))
      .returning();
    return updatedGoal;
  }

  async createMealEntry(entry: InsertMealEntry): Promise<MealEntry> {
    const [newEntry] = await db
      .insert(mealEntries)
      .values({
        ...entry,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return newEntry;
  }

  async getMealEntriesForDate(date: string, userId: string = "default_user"): Promise<MealEntry[]> {
    return await db
      .select()
      .from(mealEntries)
      .where(and(
        eq(mealEntries.date, date),
        eq(mealEntries.userId, userId)
      ))
      .orderBy(mealEntries.createdAt);
  }

  async getDailyNutritionSummary(date: string, userId: string = "default_user"): Promise<DailyNutritionSummary> {
    // Get meal entries for the date
    const mealEntriesForDate = await this.getMealEntriesForDate(date, userId);
    
    // Get nutritional goal
    const goal = await this.getNutritionalGoal(userId);
    
    // Calculate totals from meal entries
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;

    for (const entry of mealEntriesForDate) {
      const recipe = await this.getRecipe(entry.recipeId);
      if (recipe) {
        const servings = parseFloat(entry.servings);
        totalCalories += recipe.nutrition.calories * servings;
        totalProtein += recipe.nutrition.protein * servings;
        totalCarbs += recipe.nutrition.carbs * servings;
        totalFat += recipe.nutrition.fat * servings;
        totalFiber += recipe.nutrition.fiber * servings;
        totalSodium += recipe.nutrition.sodium * servings;
      }
    }

    return {
      date,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      totalFiber: Math.round(totalFiber),
      totalSodium: Math.round(totalSodium),
      goalCalories: goal?.dailyCalories || 2000,
      goalProtein: goal?.dailyProtein || 150,
      goalCarbs: goal?.dailyCarbs || 250,
      goalFat: goal?.dailyFat || 65,
      goalFiber: goal?.dailyFiber || 25,
      goalSodium: goal?.dailySodium || 2300,
    };
  }

  async deleteMealEntry(id: number): Promise<void> {
    await db.delete(mealEntries).where(eq(mealEntries.id, id));
  }

  // User profile operations
  async getUserProfile(userId: string = "default_user"): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profileUpdate: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(profileUpdate)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Favorite recipe operations
  async getFavoriteRecipes(userId: string = "default_user"): Promise<Recipe[]> {
    const favorites = await db
      .select({
        recipe: recipes,
      })
      .from(favoriteRecipes)
      .innerJoin(recipes, eq(favoriteRecipes.recipeId, recipes.id))
      .where(eq(favoriteRecipes.userId, userId));
    
    return favorites.map(f => f.recipe);
  }

  async addFavoriteRecipe(userId: string, recipeId: number): Promise<FavoriteRecipe> {
    // Check if already exists
    const existing = await db
      .select()
      .from(favoriteRecipes)
      .where(and(
        eq(favoriteRecipes.userId, userId),
        eq(favoriteRecipes.recipeId, recipeId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [favorite] = await db
      .insert(favoriteRecipes)
      .values({
        userId,
        recipeId,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return favorite;
  }

  async removeFavoriteRecipe(userId: string, recipeId: number): Promise<void> {
    await db
      .delete(favoriteRecipes)
      .where(and(
        eq(favoriteRecipes.userId, userId),
        eq(favoriteRecipes.recipeId, recipeId)
      ));
  }

  async isRecipeFavorite(userId: string, recipeId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favoriteRecipes)
      .where(and(
        eq(favoriteRecipes.userId, userId),
        eq(favoriteRecipes.recipeId, recipeId)
      ))
      .limit(1);
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
