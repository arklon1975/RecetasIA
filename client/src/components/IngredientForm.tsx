import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSearchSchema, type RecipeSearchParams } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Sparkles, Sprout, Search } from "lucide-react";

interface IngredientFormProps {
  onSearch: (params: RecipeSearchParams) => void;
  isLoading: boolean;
}

export default function IngredientForm({ onSearch, isLoading }: IngredientFormProps) {
  const form = useForm<RecipeSearchParams>({
    resolver: zodResolver(recipeSearchSchema),
    defaultValues: {
      ingredient1: "",
      ingredient2: "",
      ingredient3: "",
      ingredient4: "",
      sortBy: "health",
    },
  });

  const onSubmit = (data: RecipeSearchParams) => {
    onSearch(data);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-100">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
          <Sprout className="text-primary-green mr-2" />
          Encuentra tu receta saludable
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-neutral-800">
                Ingresa 4 ingredientes principales
              </Label>
              
              {/* Ingredient Input Fields */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="ingredient1"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ej: Pollo"
                            {...field}
                            className="w-full px-4 py-3 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all pr-10"
                          />
                          <Search className="absolute right-3 top-3.5 h-4 w-4 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ingredient2"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ej: Brócoli"
                            {...field}
                            className="w-full px-4 py-3 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all pr-10"
                          />
                          <Search className="absolute right-3 top-3.5 h-4 w-4 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ingredient3"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ej: Arroz integral"
                            {...field}
                            className="w-full px-4 py-3 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all pr-10"
                          />
                          <Search className="absolute right-3 top-3.5 h-4 w-4 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ingredient4"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ej: Limón"
                            {...field}
                            className="w-full px-4 py-3 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all pr-10"
                          />
                          <Search className="absolute right-3 top-3.5 h-4 w-4 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-800 mb-3">Filtros opcionales</h3>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="maxTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-neutral-400">Tiempo máximo</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}>
                          <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Cualquiera" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Cualquiera</SelectItem>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-neutral-400">Dificultad</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}>
                          <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Cualquiera" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Cualquiera</SelectItem>
                            <SelectItem value="Muy Fácil">Muy Fácil</SelectItem>
                            <SelectItem value="Fácil">Fácil</SelectItem>
                            <SelectItem value="Intermedio">Intermedio</SelectItem>
                            <SelectItem value="Avanzado">Avanzado</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-neutral-400">Presupuesto máximo</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseFloat(value))}>
                          <SelectTrigger className="w-full text-sm">
                            <SelectValue placeholder="Cualquiera" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Cualquiera</SelectItem>
                            <SelectItem value="10">Menos de $10</SelectItem>
                            <SelectItem value="20">$10 - $20</SelectItem>
                            <SelectItem value="30">$20 - $30</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary-green hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isLoading ? "Generando..." : "Generar Recetas"}</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
