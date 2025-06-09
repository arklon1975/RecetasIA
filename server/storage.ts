import { recipes, searchRequests, type Recipe, type InsertRecipe, type SearchRequest, type InsertSearchRequest, type RecipeSearchParams } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  searchRecipes(params: RecipeSearchParams): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getAllRecipes(): Promise<Recipe[]>;
  
  // Search request operations
  createSearchRequest(request: InsertSearchRequest): Promise<SearchRequest>;
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
}

export const storage = new DatabaseStorage();
