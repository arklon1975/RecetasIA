import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, List, ChefHat, PieChart, DollarSign, Clock } from "lucide-react";

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white border-b border-neutral-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-neutral-800 pr-8">
            {recipe.name}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>
        
        <div className="pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients Column */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <List className="text-primary-green mr-2" />
                Ingredientes
              </h3>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="text-neutral-800">{ingredient.name}</span>
                    <span className="text-neutral-600 font-medium">
                      {ingredient.amount}{ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recipe Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-green to-green-600 text-white p-4 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-2xl font-bold">${recipe.estimatedCost}</div>
                  <div className="text-sm text-green-100">Costo aprox.</div>
                </div>
                <div className="bg-gradient-to-br from-accent-blue to-blue-600 text-white p-4 rounded-lg text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{totalTime}min</div>
                  <div className="text-sm text-blue-100">Tiempo total</div>
                </div>
              </div>
            </div>

            {/* Instructions Column */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <ChefHat className="text-primary-green mr-2" />
                Preparación
              </h3>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {step.stepNumber}
                    </div>
                    <div>
                      <p className="text-neutral-800">{step.instruction}</p>
                      <span className="text-xs text-neutral-400 mt-1 block flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.timeMinutes} minutos
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nutrition Info */}
              <div className="mt-6 bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-800 mb-3 flex items-center">
                  <PieChart className="text-primary-green mr-2 w-4 h-4" />
                  Información Nutricional
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Calorías:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Proteínas:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Carbohidratos:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Grasas:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Fibra:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sodio:</span>
                    <span className="font-medium text-neutral-800">{recipe.nutrition.sodium}mg</span>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="mt-4 p-3 bg-primary-green bg-opacity-10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-green">Puntuación de Salud</span>
                  <Badge className="bg-primary-green text-white">
                    {recipe.healthScore}/100
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
