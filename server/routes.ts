import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recipeSearchSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
