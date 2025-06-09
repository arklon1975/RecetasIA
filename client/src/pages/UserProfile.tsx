import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Target, Heart, Activity, Calculator, Trash2, Plus } from "lucide-react";
import { userProfileSchema } from "@shared/schema";
import type { UserProfile, Recipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");
  const [customPreference, setCustomPreference] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profile");
      return response.json() as Promise<UserProfile | null>;
    },
  });

  // Fetch favorite recipes
  const { data: favoriteRecipes = [] } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/favorites");
      return response.json() as Promise<Recipe[]>;
    },
  });

  const form = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      age: profile?.age || undefined,
      height: profile?.height || undefined,
      weight: profile?.weight || undefined,
      gender: profile?.gender || undefined,
      activityLevel: profile?.activityLevel || "Moderado",
      goal: profile?.goal || "Mantener peso",
      restrictions: profile?.restrictions || [],
      allergies: profile?.allergies || [],
      preferences: profile?.preferences || [],
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        age: profile.age || undefined,
        height: profile.height || undefined,
        weight: profile.weight || undefined,
        gender: profile.gender || undefined,
        activityLevel: profile.activityLevel || "Moderado",
        goal: profile.goal || "Mantener peso",
        restrictions: profile.restrictions || [],
        allergies: profile.allergies || [],
        preferences: profile.preferences || [],
      });
      setSelectedRestrictions(profile.restrictions || []);
      setSelectedAllergies(profile.allergies || []);
      setSelectedPreferences(profile.preferences || []);
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const method = profile ? "PUT" : "POST";
      const response = await apiRequest(method, "/api/profile", {
        ...data,
        restrictions: selectedRestrictions,
        allergies: selectedAllergies,
        preferences: selectedPreferences,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/goals"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido guardada correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      await apiRequest("DELETE", `/api/favorites/${recipeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Receta eliminada",
        description: "La receta ha sido eliminada de tus favoritos.",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  // Calculate BMR (Basal Metabolic Rate) and daily calories
  const calculateNutritionGoals = () => {
    const { age, height, weight, gender, activityLevel, goal } = form.getValues();
    
    if (!age || !height || !weight || !gender) {
      return null;
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === "Masculino") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      "Sedentario": 1.2,
      "Ligero": 1.375,
      "Moderado": 1.55,
      "Activo": 1.725,
      "Muy Activo": 1.9,
    };

    let dailyCalories = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Adjust based on goal
    if (goal === "Perder peso") {
      dailyCalories -= 500; // 500 calorie deficit
    } else if (goal === "Ganar peso" || goal === "Ganar masa muscular") {
      dailyCalories += 500; // 500 calorie surplus
    }

    // Calculate macros (example ratios)
    const protein = Math.round((dailyCalories * 0.25) / 4); // 25% protein
    const carbs = Math.round((dailyCalories * 0.45) / 4); // 45% carbs
    const fat = Math.round((dailyCalories * 0.30) / 9); // 30% fat

    return {
      calories: Math.round(dailyCalories),
      protein,
      carbs,
      fat,
      fiber: 25,
      sodium: 2300,
    };
  };

  const nutritionGoals = calculateNutritionGoals();

  // Predefined options
  const commonRestrictions = [
    "Sin gluten", "Sin lactosa", "Bajo en sodio", "Bajo en azúcar", 
    "Sin frutos secos", "Sin huevos", "Sin soja", "Kosher", "Halal"
  ];

  const commonAllergies = [
    "Nueces", "Maní", "Mariscos", "Pescado", "Huevos", "Leche", 
    "Soja", "Trigo", "Sesamo", "Mostaza"
  ];

  const commonPreferences = [
    "Vegetariano", "Vegano", "Pescetariano", "Keto", "Paleo", 
    "Mediterránea", "Baja en carbohidratos", "Alta en proteínas"
  ];

  const addCustomItem = (
    type: "restrictions" | "allergies" | "preferences",
    value: string,
    setter: (items: string[]) => void,
    current: string[]
  ) => {
    if (value.trim() && !current.includes(value.trim())) {
      const newItems = [...current, value.trim()];
      setter(newItems);
      if (type === "restrictions") setCustomRestriction("");
      if (type === "allergies") setCustomAllergy("");
      if (type === "preferences") setCustomPreference("");
    }
  };

  const removeItem = (
    type: "restrictions" | "allergies" | "preferences",
    item: string,
    setter: (items: string[]) => void,
    current: string[]
  ) => {
    setter(current.filter(i => i !== item));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 flex items-center">
            <User className="w-8 h-8 mr-3 text-primary-green" />
            Mi Perfil
          </h1>
          <p className="text-neutral-600 mt-2">
            Personaliza tu experiencia nutricional y de recetas
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="dietary">Alimentación</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-green" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Edad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="25"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="170"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="70"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Género</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Masculino">Masculino</SelectItem>
                                  <SelectItem value="Femenino">Femenino</SelectItem>
                                  <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="activityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel de Actividad</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sedentario">Sedentario</SelectItem>
                                  <SelectItem value="Ligero">Ligero</SelectItem>
                                  <SelectItem value="Moderado">Moderado</SelectItem>
                                  <SelectItem value="Activo">Activo</SelectItem>
                                  <SelectItem value="Muy Activo">Muy Activo</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objetivo</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Mantener peso">Mantener peso</SelectItem>
                                  <SelectItem value="Perder peso">Perder peso</SelectItem>
                                  <SelectItem value="Ganar peso">Ganar peso</SelectItem>
                                  <SelectItem value="Ganar masa muscular">Ganar masa muscular</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="bg-primary-green hover:bg-green-600 text-white"
                    >
                      {mutation.isPending ? "Guardando..." : "Guardar Información"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dietary">
            <div className="space-y-6">
              {/* Dietary Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Restricciones Dietéticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonRestrictions.map((restriction) => (
                        <Badge
                          key={restriction}
                          variant={selectedRestrictions.includes(restriction) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            selectedRestrictions.includes(restriction)
                              ? "bg-primary-green text-white"
                              : "hover:bg-neutral-100"
                          }`}
                          onClick={() => {
                            if (selectedRestrictions.includes(restriction)) {
                              removeItem("restrictions", restriction, setSelectedRestrictions, selectedRestrictions);
                            } else {
                              setSelectedRestrictions([...selectedRestrictions, restriction]);
                            }
                          }}
                        >
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Agregar restricción personalizada"
                        value={customRestriction}
                        onChange={(e) => setCustomRestriction(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addCustomItem("restrictions", customRestriction, setSelectedRestrictions, selectedRestrictions)
                        }
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedRestrictions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Restricciones seleccionadas:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedRestrictions.map((restriction) => (
                            <Badge key={restriction} className="bg-red-100 text-red-800">
                              {restriction}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-4 w-4 p-0"
                                onClick={() =>
                                  removeItem("restrictions", restriction, setSelectedRestrictions, selectedRestrictions)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Allergies */}
              <Card>
                <CardHeader>
                  <CardTitle>Alergias Alimentarias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonAllergies.map((allergy) => (
                        <Badge
                          key={allergy}
                          variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            selectedAllergies.includes(allergy)
                              ? "bg-red-500 text-white"
                              : "hover:bg-neutral-100"
                          }`}
                          onClick={() => {
                            if (selectedAllergies.includes(allergy)) {
                              removeItem("allergies", allergy, setSelectedAllergies, selectedAllergies);
                            } else {
                              setSelectedAllergies([...selectedAllergies, allergy]);
                            }
                          }}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Agregar alergia personalizada"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addCustomItem("allergies", customAllergy, setSelectedAllergies, selectedAllergies)
                        }
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedAllergies.length > 0 && (
                      <div className="space-y-2">
                        <Label>Alergias seleccionadas:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedAllergies.map((allergy) => (
                            <Badge key={allergy} className="bg-red-100 text-red-800">
                              {allergy}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-4 w-4 p-0"
                                onClick={() =>
                                  removeItem("allergies", allergy, setSelectedAllergies, selectedAllergies)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias Dietéticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonPreferences.map((preference) => (
                        <Badge
                          key={preference}
                          variant={selectedPreferences.includes(preference) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            selectedPreferences.includes(preference)
                              ? "bg-blue-500 text-white"
                              : "hover:bg-neutral-100"
                          }`}
                          onClick={() => {
                            if (selectedPreferences.includes(preference)) {
                              removeItem("preferences", preference, setSelectedPreferences, selectedPreferences);
                            } else {
                              setSelectedPreferences([...selectedPreferences, preference]);
                            }
                          }}
                        >
                          {preference}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Agregar preferencia personalizada"
                        value={customPreference}
                        onChange={(e) => setCustomPreference(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          addCustomItem("preferences", customPreference, setSelectedPreferences, selectedPreferences)
                        }
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedPreferences.length > 0 && (
                      <div className="space-y-2">
                        <Label>Preferencias seleccionadas:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPreferences.map((preference) => (
                            <Badge key={preference} className="bg-blue-100 text-blue-800">
                              {preference}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-4 w-4 p-0"
                                onClick={() =>
                                  removeItem("preferences", preference, setSelectedPreferences, selectedPreferences)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => mutation.mutate(form.getValues())}
                disabled={mutation.isPending}
                className="bg-primary-green hover:bg-green-600 text-white"
              >
                {mutation.isPending ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-primary-green" />
                  Objetivos Nutricionales Calculados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nutritionGoals ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-primary-green bg-opacity-10 rounded-lg">
                        <div className="text-2xl font-bold text-primary-green">
                          {nutritionGoals.calories}
                        </div>
                        <div className="text-sm text-neutral-600">Calorías diarias</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {nutritionGoals.protein}g
                        </div>
                        <div className="text-sm text-neutral-600">Proteína</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {nutritionGoals.carbs}g
                        </div>
                        <div className="text-sm text-neutral-600">Carbohidratos</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {nutritionGoals.fat}g
                        </div>
                        <div className="text-sm text-neutral-600">Grasas</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {nutritionGoals.fiber}g
                        </div>
                        <div className="text-sm text-neutral-600">Fibra</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {nutritionGoals.sodium}mg
                        </div>
                        <div className="text-sm text-neutral-600">Sodio</div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h4 className="font-medium text-neutral-800 mb-2">Información del Cálculo</h4>
                      <p className="text-sm text-neutral-600">
                        Estos objetivos se calculan basándose en tu información personal, nivel de actividad
                        y meta específica. Los cálculos usan la ecuación Mifflin-St Jeor para determinar
                        tu metabolismo basal y se ajustan según tu objetivo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      Completa tu información personal
                    </h3>
                    <p className="text-neutral-500">
                      Para calcular tus objetivos nutricionales, necesitamos tu edad, altura, peso y género.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary-green" />
                  Recetas Favoritas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      No tienes recetas favoritas
                    </h3>
                    <p className="text-neutral-500">
                      Comienza agregando recetas a tus favoritos para verlas aquí.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-800">{recipe.name}</h4>
                            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                              {recipe.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                              <span>{recipe.calories} kcal</span>
                              <span>{recipe.prepTime + recipe.cookTime} min</span>
                              <span>${recipe.estimatedCost}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavoriteMutation.mutate(recipe.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}