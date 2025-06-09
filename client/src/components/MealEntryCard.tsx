import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MealEntry, Recipe } from "@shared/schema";

interface MealEntryCardProps {
  meal: MealEntry;
  onDelete: () => void;
  detailed?: boolean;
}

export default function MealEntryCard({ meal, onDelete, detailed = false }: MealEntryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch recipe details
  const { data: recipe } = useQuery({
    queryKey: ["/api/recipes", meal.recipeId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/recipes/${meal.recipeId}`);
      return response.json() as Promise<Recipe>;
    },
  });

  if (!recipe) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-neutral-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const servings = parseFloat(meal.servings);
  const totalCalories = Math.round(recipe.calories * servings);
  const totalProtein = Math.round(recipe.nutrition.protein * servings);
  const totalCarbs = Math.round(recipe.nutrition.carbs * servings);
  const totalFat = Math.round(recipe.nutrition.fat * servings);

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "Desayuno":
        return "bg-yellow-100 text-yellow-800";
      case "Almuerzo":
        return "bg-blue-100 text-blue-800";
      case "Cena":
        return "bg-purple-100 text-purple-800";
      case "Snack":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <img
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
            alt={recipe.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-800 truncate">{recipe.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${getMealTypeColor(meal.mealType)}`}>
                    {meal.mealType}
                  </Badge>
                  <div className="flex items-center text-xs text-neutral-500">
                    <Users className="w-3 h-3 mr-1" />
                    {servings} {servings === 1 ? "porción" : "porciones"}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className={`text-neutral-400 hover:text-red-600 ${
                  showDeleteConfirm ? "text-red-600 bg-red-50" : ""
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Calorías:</span>
                <span className="ml-1 font-medium text-neutral-800">{totalCalories}</span>
              </div>
              <div>
                <span className="text-neutral-500">Proteína:</span>
                <span className="ml-1 font-medium text-neutral-800">{totalProtein}g</span>
              </div>
              <div>
                <span className="text-neutral-500">Carbohidratos:</span>
                <span className="ml-1 font-medium text-neutral-800">{totalCarbs}g</span>
              </div>
              <div>
                <span className="text-neutral-500">Grasas:</span>
                <span className="ml-1 font-medium text-neutral-800">{totalFat}g</span>
              </div>
            </div>

            {detailed && (
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center text-xs text-neutral-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {recipe.prepTime + recipe.cookTime} min
                  </div>
                  <div>
                    Dificultad: {recipe.difficulty}
                  </div>
                  <div>
                    Fibra: {Math.round(recipe.nutrition.fiber * servings)}g
                  </div>
                  <div>
                    Sodio: {Math.round(recipe.nutrition.sodium * servings)}mg
                  </div>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ¿Confirmar eliminación? Haz clic en el icono de basura nuevamente.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}