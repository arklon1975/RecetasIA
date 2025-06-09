import { Recipe } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Leaf, DollarSign, Clock, Star } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onViewRecipe: () => void;
}

export default function RecipeCard({ recipe, onViewRecipe }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Muy Fácil":
        return "bg-success-green bg-opacity-10 text-success-green";
      case "Fácil":
        return "bg-success-green bg-opacity-10 text-success-green";
      case "Intermedio":
        return "bg-warning-orange bg-opacity-10 text-warning-orange";
      case "Avanzado":
        return "bg-error-red bg-opacity-10 text-error-red";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 95) return "Super Saludable";
    if (score >= 90) return "Muy Saludable";
    if (score >= 80) return "Saludable";
    return "Moderadamente Saludable";
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
            alt={recipe.name}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-neutral-800">
              {recipe.name}
            </h3>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-secondary-orange">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Health & Cost Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-primary-green bg-opacity-10 text-primary-green px-3 py-1 rounded-full text-xs font-medium">
              <Leaf className="w-3 h-3 mr-1" />
              {getHealthScoreLabel(recipe.healthScore)}
            </Badge>
            <Badge className="bg-success-green bg-opacity-10 text-success-green px-3 py-1 rounded-full text-xs font-medium">
              <DollarSign className="w-3 h-3 mr-1" />
              ${recipe.estimatedCost} aprox.
            </Badge>
            <Badge className="bg-accent-blue bg-opacity-10 text-accent-blue px-3 py-1 rounded-full text-xs font-medium">
              <Clock className="w-3 h-3 mr-1" />
              {totalTime} min
            </Badge>
            <Badge className={`${getDifficultyColor(recipe.difficulty)} px-3 py-1 rounded-full text-xs font-medium`}>
              <Star className="w-3 h-3 mr-1" />
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-neutral-800">{recipe.calories}</div>
              <div className="text-xs text-neutral-400">Calorías</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-neutral-800">{recipe.nutrition.protein}g</div>
              <div className="text-xs text-neutral-400">Proteína</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-neutral-800">{recipe.nutrition.fiber}g</div>
              <div className="text-xs text-neutral-400">Fibra</div>
            </div>
          </div>

          {/* Ingredients Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-800 mb-2">Ingredientes principales:</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-neutral-50 px-2 py-1 rounded text-xs text-neutral-600"
                >
                  {ingredient.amount}{ingredient.unit} {ingredient.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">{recipe.description}</p>
            <Button 
              onClick={onViewRecipe}
              className="bg-primary-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ver Receta
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
