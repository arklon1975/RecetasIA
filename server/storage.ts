import { recipes, searchRequests, type Recipe, type InsertRecipe, type SearchRequest, type InsertSearchRequest, type RecipeSearchParams } from "@shared/schema";

export interface IStorage {
  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  searchRecipes(params: RecipeSearchParams): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getAllRecipes(): Promise<Recipe[]>;
  
  // Search request operations
  createSearchRequest(request: InsertSearchRequest): Promise<SearchRequest>;
}

export class MemStorage implements IStorage {
  private recipes: Map<number, Recipe>;
  private searchRequests: Map<number, SearchRequest>;
  private currentRecipeId: number;
  private currentSearchId: number;

  constructor() {
    this.recipes = new Map();
    this.searchRequests = new Map();
    this.currentRecipeId = 1;
    this.currentSearchId = 1;
    this.initializeRecipes();
  }

  private initializeRecipes() {
    // Initialize with comprehensive healthy recipes
    const initialRecipes: Omit<Recipe, 'id'>[] = [
      {
        name: "Pollo Salteado con Brócoli y Arroz Integral",
        description: "Rica en proteínas y fibra, baja en grasas saturadas",
        baseIngredients: ["pollo", "brócoli", "arroz integral", "limón"],
        ingredients: [
          { name: "Pechuga de pollo", amount: "300", unit: "g" },
          { name: "Brócoli fresco", amount: "200", unit: "g" },
          { name: "Arroz integral", amount: "150", unit: "g" },
          { name: "Limón", amount: "1", unit: "unidad" },
          { name: "Aceite de oliva", amount: "2", unit: "cdas" },
          { name: "Ajo", amount: "2", unit: "dientes" },
          { name: "Sal y pimienta", amount: "Al gusto", unit: "" }
        ],
        steps: [
          { stepNumber: 1, instruction: "Cocina el arroz integral según las instrucciones del paquete. Reserva caliente.", timeMinutes: 15 },
          { stepNumber: 2, instruction: "Corta el pollo en trozos medianos y sazona con sal y pimienta.", timeMinutes: 3 },
          { stepNumber: 3, instruction: "Corta el brócoli en floretes pequeños y blanquea en agua hirviendo por 2 minutos.", timeMinutes: 3 },
          { stepNumber: 4, instruction: "Calienta aceite en una sartén grande y cocina el pollo hasta dorar por todos lados.", timeMinutes: 5 },
          { stepNumber: 5, instruction: "Agrega el ajo picado y el brócoli. Saltea por 2-3 minutos más.", timeMinutes: 3 },
          { stepNumber: 6, instruction: "Sirve sobre el arroz integral y decora con rodajas de limón. ¡Disfruta!", timeMinutes: 1 }
        ],
        nutrition: {
          calories: 320,
          protein: 25,
          carbs: 35,
          fat: 8,
          fiber: 8,
          sodium: 420
        },
        estimatedCost: "15.00",
        prepTime: 10,
        cookTime: 15,
        difficulty: "Fácil",
        healthScore: 92,
        calories: 320,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Saludable", "Alto en proteína", "Bajo en grasa", "Rico en fibra"]
      },
      {
        name: "Ensalada Power de Pollo con Brócoli",
        description: "Perfecta para almuerzo ligero y nutritivo",
        baseIngredients: ["pollo", "brócoli", "arroz integral", "limón"],
        ingredients: [
          { name: "Pollo a la plancha", amount: "250", unit: "g" },
          { name: "Brócoli al vapor", amount: "150", unit: "g" },
          { name: "Arroz integral cocido", amount: "100", unit: "g" },
          { name: "Limón", amount: "1", unit: "unidad" },
          { name: "Aceite de oliva extra virgen", amount: "1", unit: "cda" },
          { name: "Hojas verdes mixtas", amount: "50", unit: "g" },
          { name: "Tomates cherry", amount: "100", unit: "g" }
        ],
        steps: [
          { stepNumber: 1, instruction: "Cocina el pollo a la plancha y córtalo en tiras.", timeMinutes: 8 },
          { stepNumber: 2, instruction: "Cocina el brócoli al vapor hasta que esté tierno.", timeMinutes: 5 },
          { stepNumber: 3, instruction: "Prepara el arroz integral según instrucciones.", timeMinutes: 15 },
          { stepNumber: 4, instruction: "Mezcla el jugo de limón con aceite de oliva para la vinagreta.", timeMinutes: 2 },
          { stepNumber: 5, instruction: "Arma la ensalada combinando todos los ingredientes.", timeMinutes: 3 },
          { stepNumber: 6, instruction: "Aliña con la vinagreta de limón y sirve inmediatamente.", timeMinutes: 1 }
        ],
        nutrition: {
          calories: 280,
          protein: 30,
          carbs: 25,
          fat: 6,
          fiber: 12,
          sodium: 380
        },
        estimatedCost: "12.00",
        prepTime: 15,
        cookTime: 0,
        difficulty: "Muy Fácil",
        healthScore: 95,
        calories: 280,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Super Saludable", "Bajo en calorías", "Alto en fibra", "Ensalada"]
      },
      {
        name: "Pollo Asiático con Brócoli y Limón",
        description: "Sabores asiáticos con un toque cítrico refrescante",
        baseIngredients: ["pollo", "brócoli", "arroz integral", "limón"],
        ingredients: [
          { name: "Muslos de pollo", amount: "350", unit: "g" },
          { name: "Brócoli", amount: "200", unit: "g" },
          { name: "Arroz integral", amount: "180", unit: "g" },
          { name: "Limón", amount: "1", unit: "unidad" },
          { name: "Salsa de soja baja en sodio", amount: "2", unit: "cdas" },
          { name: "Jengibre fresco", amount: "1", unit: "cda" },
          { name: "Aceite de sésamo", amount: "1", unit: "cda" },
          { name: "Cebolla verde", amount: "2", unit: "tallos" }
        ],
        steps: [
          { stepNumber: 1, instruction: "Prepara el arroz integral y manténlo caliente.", timeMinutes: 20 },
          { stepNumber: 2, instruction: "Corta el pollo en trozos y marina con salsa de soja y jengibre.", timeMinutes: 5 },
          { stepNumber: 3, instruction: "Blanquea el brócoli en agua hirviendo por 2 minutos.", timeMinutes: 3 },
          { stepNumber: 4, instruction: "Saltea el pollo marinado en aceite de sésamo hasta dorar.", timeMinutes: 6 },
          { stepNumber: 5, instruction: "Agrega el brócoli y saltea 2 minutos más.", timeMinutes: 2 },
          { stepNumber: 6, instruction: "Exprime el limón sobre el plato y decora con cebolla verde.", timeMinutes: 2 }
        ],
        nutrition: {
          calories: 380,
          protein: 28,
          carbs: 42,
          fat: 12,
          fiber: 6,
          sodium: 520
        },
        estimatedCost: "18.00",
        prepTime: 15,
        cookTime: 20,
        difficulty: "Intermedio",
        healthScore: 85,
        calories: 380,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d25a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Saludable", "Asiático", "Sabroso", "Aromático"]
      },
      {
        name: "Salmón al Horno con Espárragos y Quinoa",
        description: "Rico en omega-3 y proteínas completas",
        baseIngredients: ["salmón", "espárragos", "quinoa", "limón"],
        ingredients: [
          { name: "Filete de salmón", amount: "300", unit: "g" },
          { name: "Espárragos frescos", amount: "200", unit: "g" },
          { name: "Quinoa", amount: "150", unit: "g" },
          { name: "Limón", amount: "1", unit: "unidad" },
          { name: "Aceite de oliva", amount: "2", unit: "cdas" },
          { name: "Hierbas frescas", amount: "2", unit: "cdas" },
          { name: "Ajo en polvo", amount: "1", unit: "cdta" }
        ],
        steps: [
          { stepNumber: 1, instruction: "Precalienta el horno a 200°C.", timeMinutes: 5 },
          { stepNumber: 2, instruction: "Enjuaga y cocina la quinoa según instrucciones del paquete.", timeMinutes: 15 },
          { stepNumber: 3, instruction: "Corta los extremos duros de los espárragos.", timeMinutes: 2 },
          { stepNumber: 4, instruction: "Coloca el salmón y espárragos en una bandeja, rocía con aceite y especias.", timeMinutes: 3 },
          { stepNumber: 5, instruction: "Hornea por 12-15 minutos hasta que el salmón esté cocido.", timeMinutes: 15 },
          { stepNumber: 6, instruction: "Sirve sobre quinoa y exprime limón fresco encima.", timeMinutes: 2 }
        ],
        nutrition: {
          calories: 420,
          protein: 32,
          carbs: 28,
          fat: 18,
          fiber: 7,
          sodium: 280
        },
        estimatedCost: "22.00",
        prepTime: 10,
        cookTime: 20,
        difficulty: "Fácil",
        healthScore: 98,
        calories: 420,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Super Saludable", "Omega-3", "Proteína completa", "Antiinflamatorio"]
      },
      {
        name: "Bowl de Atún con Aguacate y Quinoa",
        description: "Combinación perfecta de proteínas y grasas saludables",
        baseIngredients: ["atún", "aguacate", "quinoa", "limón"],
        ingredients: [
          { name: "Atún fresco", amount: "250", unit: "g" },
          { name: "Aguacate maduro", amount: "1", unit: "unidad" },
          { name: "Quinoa cocida", amount: "150", unit: "g" },
          { name: "Limón", amount: "1", unit: "unidad" },
          { name: "Pepino", amount: "100", unit: "g" },
          { name: "Edamame", amount: "80", unit: "g" },
          { name: "Semillas de sésamo", amount: "1", unit: "cda" }
        ],
        steps: [
          { stepNumber: 1, instruction: "Prepara la quinoa y déjala enfriar.", timeMinutes: 15 },
          { stepNumber: 2, instruction: "Corta el atún en cubos pequeños.", timeMinutes: 3 },
          { stepNumber: 3, instruction: "Pela y corta el aguacate en láminas.", timeMinutes: 2 },
          { stepNumber: 4, instruction: "Corta el pepino en rodajas finas.", timeMinutes: 2 },
          { stepNumber: 5, instruction: "Arma el bowl colocando cada ingrediente por secciones.", timeMinutes: 3 },
          { stepNumber: 6, instruction: "Exprime limón sobre todo y espolvorea semillas de sésamo.", timeMinutes: 1 }
        ],
        nutrition: {
          calories: 380,
          protein: 28,
          carbs: 30,
          fat: 16,
          fiber: 10,
          sodium: 320
        },
        estimatedCost: "19.00",
        prepTime: 20,
        cookTime: 5,
        difficulty: "Muy Fácil",
        healthScore: 96,
        calories: 380,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        tags: ["Super Saludable", "Grasas saludables", "Proteína magra", "Fresco"]
      }
    ];

    initialRecipes.forEach(recipe => {
      const id = this.currentRecipeId++;
      this.recipes.set(id, { ...recipe, id });
    });
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
    const { ingredient1, ingredient2, ingredient3, ingredient4, maxTime, difficulty, maxCost, sortBy } = params;
    const searchIngredients = [ingredient1, ingredient2, ingredient3, ingredient4].map(i => i.toLowerCase().trim());
    
    let filteredRecipes = Array.from(this.recipes.values()).filter(recipe => {
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
    const id = this.currentRecipeId++;
    const newRecipe: Recipe = { ...recipe, id };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async createSearchRequest(request: InsertSearchRequest): Promise<SearchRequest> {
    const id = this.currentSearchId++;
    const newRequest: SearchRequest = { ...request, id };
    this.searchRequests.set(id, newRequest);
    return newRequest;
  }
}

export const storage = new MemStorage();
