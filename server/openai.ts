import OpenAI from 'openai';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface RecipeGenerationParams {
  ingredients: string[];
  dietaryRestrictions?: string[];
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cookingTime?: number;
  servings?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipe> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = createRecipePrompt(params);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un chef experto y nutricionista. Genera recetas detalladas y nutritivas en español. 
          Siempre responde con un JSON válido que contenga toda la información solicitada.
          Asegúrate de que las recetas sean realistas, saludables y deliciosas.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parsear la respuesta JSON
    const recipe = JSON.parse(response) as GeneratedRecipe;
    
    // Validar que la receta tenga la estructura correcta
    validateRecipe(recipe);
    
    return recipe;
  } catch (error) {
    console.error('Error generating recipe with OpenAI:', error);
    throw new Error('Failed to generate recipe');
  }
}

function createRecipePrompt(params: RecipeGenerationParams): string {
  const {
    ingredients,
    dietaryRestrictions = [],
    cuisine = 'internacional',
    difficulty = 'medium',
    cookingTime = 30,
    servings = 4,
    mealType = 'dinner'
  } = params;

  return `
Genera una receta ${mealType === 'breakfast' ? 'de desayuno' : 
                   mealType === 'lunch' ? 'de almuerzo' : 
                   mealType === 'dinner' ? 'de cena' : 'de snack'} 
usando principalmente estos ingredientes: ${ingredients.join(', ')}.

Requisitos:
- Cocina: ${cuisine}
- Dificultad: ${difficulty}
- Tiempo máximo de cocción: ${cookingTime} minutos
- Porciones: ${servings}
${dietaryRestrictions.length > 0 ? `- Restricciones dietéticas: ${dietaryRestrictions.join(', ')}` : ''}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "name": "Nombre de la receta",
  "description": "Descripción breve y apetitosa",
  "ingredients": [
    {
      "name": "nombre del ingrediente",
      "amount": "cantidad",
      "unit": "unidad (g, ml, taza, etc.)"
    }
  ],
  "instructions": [
    "Paso 1 detallado",
    "Paso 2 detallado",
    "..."
  ],
  "prepTime": 15,
  "cookTime": 25,
  "totalTime": 40,
  "servings": ${servings},
  "difficulty": "${difficulty}",
  "cuisine": "${cuisine}",
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15,
    "fiber": 8
  },
  "tags": ["tag1", "tag2", "tag3"]
}

Asegúrate de que:
- Los valores nutricionales sean realistas
- Las instrucciones sean claras y detalladas
- Los ingredientes incluyan cantidades precisas
- El tiempo total no exceda ${cookingTime + 15} minutos
`;
}

function validateRecipe(recipe: any): void {
  const requiredFields = ['name', 'description', 'ingredients', 'instructions', 'nutrition'];
  
  for (const field of requiredFields) {
    if (!recipe[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    throw new Error('Recipe must have at least one ingredient');
  }

  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    throw new Error('Recipe must have at least one instruction');
  }
}

export async function generateRecipeSuggestions(userPreferences: {
  favoriteIngredients?: string[];
  dietaryRestrictions?: string[];
  cuisinePreferences?: string[];
}): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Basándote en estas preferencias del usuario:
- Ingredientes favoritos: ${userPreferences.favoriteIngredients?.join(', ') || 'ninguno especificado'}
- Restricciones dietéticas: ${userPreferences.dietaryRestrictions?.join(', ') || 'ninguna'}
- Cocinas preferidas: ${userPreferences.cuisinePreferences?.join(', ') || 'cualquiera'}

Sugiere 5 nombres de recetas que le podrían gustar. Responde solo con un array JSON de strings:
["Receta 1", "Receta 2", "Receta 3", "Receta 4", "Receta 5"]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un chef experto que sugiere recetas personalizadas. Responde solo con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    throw new Error('Failed to generate recipe suggestions');
  }
} 