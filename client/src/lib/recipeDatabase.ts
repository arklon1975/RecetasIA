// This file contains the recipe matching logic and would be used
// if we needed client-side recipe generation instead of server-side

export interface IngredientMatch {
  ingredient: string;
  alternatives: string[];
  category: 'protein' | 'vegetable' | 'carb' | 'fruit' | 'dairy' | 'herb' | 'spice';
}

export const ingredientDatabase: IngredientMatch[] = [
  // Proteins
  { ingredient: "pollo", alternatives: ["chicken", "pechuga", "muslos"], category: "protein" },
  { ingredient: "salmón", alternatives: ["salmon", "pescado"], category: "protein" },
  { ingredient: "atún", alternatives: ["tuna", "pescado"], category: "protein" },
  { ingredient: "huevos", alternatives: ["eggs", "huevo"], category: "protein" },
  { ingredient: "tofu", alternatives: ["soja"], category: "protein" },
  
  // Vegetables
  { ingredient: "brócoli", alternatives: ["broccoli"], category: "vegetable" },
  { ingredient: "espárragos", alternatives: ["asparagus"], category: "vegetable" },
  { ingredient: "zanahoria", alternatives: ["carrot", "zanahorias"], category: "vegetable" },
  { ingredient: "espinaca", alternatives: ["spinach", "espinacas"], category: "vegetable" },
  { ingredient: "tomate", alternatives: ["tomato", "tomates"], category: "vegetable" },
  
  // Carbs
  { ingredient: "arroz integral", alternatives: ["brown rice", "arroz"], category: "carb" },
  { ingredient: "quinoa", alternatives: ["quinua"], category: "carb" },
  { ingredient: "avena", alternatives: ["oats", "avenas"], category: "carb" },
  { ingredient: "pasta integral", alternatives: ["whole wheat pasta", "pasta"], category: "carb" },
  
  // Fruits
  { ingredient: "limón", alternatives: ["lemon", "lima"], category: "fruit" },
  { ingredient: "aguacate", alternatives: ["avocado", "palta"], category: "fruit" },
  { ingredient: "manzana", alternatives: ["apple", "manzanas"], category: "fruit" },
  { ingredient: "plátano", alternatives: ["banana", "banano"], category: "fruit" },
];

export function findIngredientMatches(searchIngredient: string): IngredientMatch | null {
  const normalized = searchIngredient.toLowerCase().trim();
  
  return ingredientDatabase.find(item => 
    item.ingredient.includes(normalized) || 
    normalized.includes(item.ingredient) ||
    item.alternatives.some(alt => 
      alt.includes(normalized) || normalized.includes(alt)
    )
  ) || null;
}

export function categorizeIngredients(ingredients: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    protein: [],
    vegetable: [],
    carb: [],
    fruit: [],
    dairy: [],
    herb: [],
    spice: []
  };

  ingredients.forEach(ingredient => {
    const match = findIngredientMatches(ingredient);
    if (match) {
      categories[match.category].push(ingredient);
    }
  });

  return categories;
}
