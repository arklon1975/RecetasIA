import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { mealEntrySchema } from "@shared/schema";
import type { Recipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AddMealModalProps {
  date: string;
  onClose: () => void;
  onSave: () => void;
}

export default function AddMealModal({ date, onClose, onSave }: AddMealModalProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const form = useForm({
    resolver: zodResolver(mealEntrySchema),
    defaultValues: {
      recipeId: 0,
      servings: 1,
      mealType: "Almuerzo" as const,
      date,
    },
  });

  // Fetch all recipes
  const { data: recipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/recipes");
      return response.json() as Promise<Recipe[]>;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/nutrition/meals", data);
      return response.json();
    },
    onSuccess: () => {
      onSave();
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === parseInt(recipeId));
    setSelectedRecipe(recipe || null);
    form.setValue("recipeId", parseInt(recipeId));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-neutral-800">
            <Plus className="w-6 h-6 mr-3 text-primary-green" />
            Agregar Comida
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecciona una receta</FormLabel>
                  <FormControl>
                    <Select onValueChange={handleRecipeSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar receta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id.toString()}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRecipe && (
              <Card className="bg-neutral-50">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedRecipe.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt={selectedRecipe.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">{selectedRecipe.name}</h4>
                      <p className="text-sm text-neutral-600">
                        {selectedRecipe.calories} kcal • {selectedRecipe.nutrition.protein}g proteína
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porciones</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de comida</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Desayuno">Desayuno</SelectItem>
                          <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                          <SelectItem value="Cena">Cena</SelectItem>
                          <SelectItem value="Snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedRecipe && form.watch("servings") && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-green-800 mb-2">Información nutricional</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-700">Calorías:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(selectedRecipe.calories * form.watch("servings"))}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Proteína:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(selectedRecipe.nutrition.protein * form.watch("servings"))}g
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Carbohidratos:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(selectedRecipe.nutrition.carbs * form.watch("servings"))}g
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Grasas:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(selectedRecipe.nutrition.fat * form.watch("servings"))}g
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !selectedRecipe}
                className="flex-1 bg-primary-green hover:bg-green-600 text-white"
              >
                {mutation.isPending ? "Agregando..." : "Agregar Comida"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}