import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recipeSearchSchema, nutritionalGoalSchema, mealEntrySchema, userProfileSchema } from "@shared/schema";
import { z } from "zod";
import { generateRecipe, generateRecipeSuggestions, type RecipeGenerationParams } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Search recipes based on ingredients and filters
  app.post("/api/recipes/search", async (req, res) => {
    try {
      const searchParams = recipeSearchSchema.parse(req.body);
      
      // Log the search request
      await storage.createSearchRequest({
        ingredient1: searchParams.ingredient1,
        ingredient2: searchParams.ingredient2,
        ingredient3: searchParams.ingredient3,
        ingredient4: searchParams.ingredient4,
        maxTime: searchParams.maxTime,
        difficulty: searchParams.difficulty,
        maxCost: searchParams.maxCost ? searchParams.maxCost.toString() : undefined,
        sortBy: searchParams.sortBy,
      });

      const recipes = await storage.searchRecipes(searchParams);
      res.json(recipes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Error searching recipes" 
        });
      }
    }
  });

  // Get all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching recipes" 
      });
    }
  });

  // Get specific recipe by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching recipe" 
      });
    }
  });

  // Nutritional Goals API
  app.get("/api/nutrition/goals", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default_user";
      const goal = await storage.getNutritionalGoal(userId);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Error fetching nutritional goals" });
    }
  });

  app.post("/api/nutrition/goals", async (req, res) => {
    try {
      const goalData = nutritionalGoalSchema.parse(req.body);
      const goal = await storage.createNutritionalGoal({
        ...goalData,
        userId: "default_user"
      });
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating nutritional goal" });
      }
    }
  });

  app.put("/api/nutrition/goals", async (req, res) => {
    try {
      const goalData = nutritionalGoalSchema.partial().parse(req.body);
      const userId = "default_user";
      const goal = await storage.updateNutritionalGoal(userId, goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating nutritional goal" });
      }
    }
  });

  // Meal Entries API
  app.post("/api/nutrition/meals", async (req, res) => {
    try {
      const mealData = mealEntrySchema.parse(req.body);
      const meal = await storage.createMealEntry({
        ...mealData,
        servings: mealData.servings.toString(),
        userId: "default_user"
      });
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating meal entry" });
      }
    }
  });

  app.get("/api/nutrition/meals/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const userId = req.query.userId as string || "default_user";
      const meals = await storage.getMealEntriesForDate(date, userId);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal entries" });
    }
  });

  app.delete("/api/nutrition/meals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meal entry ID" });
      }
      await storage.deleteMealEntry(id);
      res.json({ message: "Meal entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting meal entry" });
    }
  });

  // Daily Nutrition Summary API
  app.get("/api/nutrition/summary/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const userId = req.query.userId as string || "default_user";
      const summary = await storage.getDailyNutritionSummary(date, userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Error fetching daily nutrition summary" });
    }
  });

  // User Profile API
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default_user";
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = userProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile({
        ...profileData,
        userId: "default_user"
      });
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating user profile" });
      }
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const profileData = userProfileSchema.partial().parse(req.body);
      const userId = "default_user";
      const profile = await storage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating user profile" });
      }
    }
  });

  // Favorite Recipes API
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default_user";
      const favorites = await storage.getFavoriteRecipes(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorite recipes" });
    }
  });

  app.post("/api/favorites/:recipeId", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const userId = "default_user";
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      const favorite = await storage.addFavoriteRecipe(userId, recipeId);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Error adding favorite recipe" });
    }
  });

  app.delete("/api/favorites/:recipeId", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const userId = "default_user";
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      await storage.removeFavoriteRecipe(userId, recipeId);
      res.json({ message: "Favorite recipe removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing favorite recipe" });
    }
  });

  app.get("/api/favorites/:recipeId/check", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      const userId = "default_user";
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      const isFavorite = await storage.isRecipeFavorite(userId, recipeId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Error checking favorite status" });
    }
  });

  // AI Recipe Generation API
  app.post("/api/ai/generate-recipe", async (req, res) => {
    try {
      const params: RecipeGenerationParams = req.body;
      
      // Validar parámetros básicos
      if (!params.ingredients || params.ingredients.length === 0) {
        return res.status(400).json({ 
          message: "Se requiere al menos un ingrediente para generar la receta" 
        });
      }

      const recipe = await generateRecipe(params);
      res.json(recipe);
    } catch (error) {
      console.error('Error generating AI recipe:', error);
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API key')) {
          res.status(500).json({ 
            message: "Servicio de IA no configurado. Contacta al administrador." 
          });
        } else {
          res.status(500).json({ 
            message: "Error generando receta con IA: " + error.message 
          });
        }
      } else {
        res.status(500).json({ 
          message: "Error interno del servidor" 
        });
      }
    }
  });

  app.post("/api/ai/recipe-suggestions", async (req, res) => {
    try {
      const userPreferences = req.body;
      const suggestions = await generateRecipeSuggestions(userPreferences);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error generating recipe suggestions:', error);
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API key')) {
          res.status(500).json({ 
            message: "Servicio de IA no configurado. Contacta al administrador." 
          });
        } else {
          res.status(500).json({ 
            message: "Error generando sugerencias: " + error.message 
          });
        }
      } else {
        res.status(500).json({ 
          message: "Error interno del servidor" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
