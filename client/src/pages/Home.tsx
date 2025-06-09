import { useState } from "react";
import Header from "@/components/Header";
import IngredientForm from "@/components/IngredientForm";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { useQuery } from "@tanstack/react-query";
import { Recipe, RecipeSearchParams } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Lightbulb, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [searchParams, setSearchParams] = useState<RecipeSearchParams | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [sortBy, setSortBy] = useState<string>("health");

  // Query for searching recipes
  const { data: recipes = [], isLoading: isSearching, error } = useQuery({
    queryKey: ["/api/recipes/search", searchParams],
    queryFn: async () => {
      if (!searchParams) return [];
      console.log("Searching with params:", searchParams);
      const response = await apiRequest("POST", "/api/recipes/search", searchParams);
      const data = await response.json();
      console.log("Search results:", data);
      return data;
    },
    enabled: !!searchParams,
  });

  // Query for getting all recipes initially
  const { data: allRecipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: !searchParams,
  });

  const displayRecipes = searchParams ? recipes : allRecipes;
  
  console.log("Display logic:", { 
    searchParams, 
    hasSearchParams: !!searchParams, 
    recipesLength: recipes.length, 
    allRecipesLength: allRecipes.length,
    displayRecipesLength: displayRecipes.length,
    isSearching
  });

  const handleSearch = (params: RecipeSearchParams) => {
    setSearchParams({ ...params, sortBy });
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    if (searchParams) {
      setSearchParams({ ...searchParams, sortBy: newSortBy as RecipeSearchParams["sortBy"] });
    }
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left sidebar - Ingredient Form */}
          <div className="lg:col-span-4 mb-8 lg:mb-0">
            <IngredientForm onSearch={handleSearch} isLoading={isSearching} />
            
            {/* Health Tips Card */}
            <div className="mt-6 bg-gradient-to-br from-primary-green to-green-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Consejo Saludable
              </h3>
              <p className="text-sm text-green-50">
                Combina proteínas magras con vegetales de diferentes colores para obtener una variedad completa de nutrientes.
              </p>
            </div>
          </div>

          {/* Right content - Recipe Results */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 flex items-center">
                <ChefHat className="w-8 h-8 mr-3 text-primary-green" />
                {searchParams ? "Recetas Recomendadas" : "Todas las Recetas"}
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-neutral-400">Ordenar por:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Más saludable</SelectItem>
                    <SelectItem value="time">Menor tiempo</SelectItem>
                    <SelectItem value="cost">Menor costo</SelectItem>
                    <SelectItem value="difficulty">Más fácil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading state */}
            {isSearching && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="md:flex">
                        <div className="md:w-1/3 bg-neutral-100 h-48 rounded-lg"></div>
                        <div className="md:w-2/3 md:ml-6 mt-4 md:mt-0">
                          <div className="h-6 bg-neutral-100 rounded mb-3"></div>
                          <div className="h-4 bg-neutral-100 rounded mb-4 w-3/4"></div>
                          <div className="flex gap-2 mb-4">
                            <div className="h-6 bg-neutral-100 rounded w-20"></div>
                            <div className="h-6 bg-neutral-100 rounded w-16"></div>
                            <div className="h-6 bg-neutral-100 rounded w-14"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <Card className="border-error-red">
                <CardContent className="p-6 text-center">
                  <p className="text-error-red">Error al buscar recetas. Por favor, intenta nuevamente.</p>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!isSearching && !error && displayRecipes.length === 0 && searchParams && (
              <Card>
                <CardContent className="p-6 text-center">
                  <ChefHat className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    No encontramos recetas
                  </h3>
                  <p className="text-neutral-400">
                    Intenta con otros ingredientes o ajusta los filtros de búsqueda.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recipe Results */}
            {!isSearching && displayRecipes.length > 0 && (
              <div className="space-y-6">
                {displayRecipes.map((recipe: Recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onViewRecipe={() => openRecipeModal(recipe)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={closeRecipeModal}
        />
      )}
    </div>
  );
}
