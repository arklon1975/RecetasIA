import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Clock, Users, ChefHat } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface GeneratedRecipe {
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

export function AIRecipeGenerator() {
  const [ingredients, setIngredients] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [cookingTime, setCookingTime] = useState<string>('30');
  const [servings, setServings] = useState<string>('4');
  const [mealType, setMealType] = useState<string>('dinner');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [error, setError] = useState<string>('');

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Por favor, ingresa al menos un ingrediente');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedRecipe(null);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
          cuisine: cuisine || 'internacional',
          difficulty,
          cookingTime: parseInt(cookingTime),
          servings: parseInt(servings),
          mealType,
          dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(',').map(r => r.trim()) : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error generando la receta');
      }

      const recipe = await response.json();
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generador de Recetas con IA
          </CardTitle>
          <CardDescription>
            Describe tus ingredientes y preferencias, y la IA creará una receta personalizada para ti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes disponibles *</Label>
              <Textarea
                id="ingredients"
                placeholder="Ej: pollo, brócoli, arroz, ajo, cebolla"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-sm text-muted-foreground">
                Separa los ingredientes con comas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary-restrictions">Restricciones dietéticas</Label>
              <Textarea
                id="dietary-restrictions"
                placeholder="Ej: vegetariano, sin gluten, bajo en sodio"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-sm text-muted-foreground">
                Opcional: separa con comas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Tipo de comida</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cocina</Label>
              <Input
                id="cuisine"
                placeholder="Ej: italiana, mexicana"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooking-time">Tiempo (min)</Label>
              <Input
                id="cooking-time"
                type="number"
                min="10"
                max="180"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Porciones</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="12"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateRecipe} 
            disabled={isGenerating || !ingredients.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando receta...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Receta con IA
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-green-500" />
              {generatedRecipe.name}
            </CardTitle>
            <CardDescription>{generatedRecipe.description}</CardDescription>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {generatedRecipe.totalTime} min
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {generatedRecipe.servings} porciones
              </Badge>
              <Badge variant="outline">{generatedRecipe.difficulty}</Badge>
              <Badge variant="outline">{generatedRecipe.cuisine}</Badge>
              {generatedRecipe.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Ingredientes</h3>
                <ul className="space-y-1">
                  {generatedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Información Nutricional</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Calorías:</span>
                    <span>{generatedRecipe.nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proteína:</span>
                    <span>{generatedRecipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohidratos:</span>
                    <span>{generatedRecipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grasa:</span>
                    <span>{generatedRecipe.nutrition.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fibra:</span>
                    <span>{generatedRecipe.nutrition.fiber}g</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Instrucciones</h3>
              <ol className="space-y-2">
                {generatedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                Guardar Receta
              </Button>
              <Button variant="outline" className="flex-1">
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 