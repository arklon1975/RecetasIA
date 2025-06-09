import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Target, TrendingUp, Plus, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DailyNutritionSummary, NutritionalGoal, MealEntry } from "@shared/schema";
import NutritionGoalsForm from "../components/NutritionGoalsForm";
import AddMealModal from "../components/AddMealModal";
import MealEntryCard from "../components/MealEntryCard";

export default function NutritionTracker() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch nutritional goals
  const { data: goals } = useQuery({
    queryKey: ["/api/nutrition/goals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/nutrition/goals");
      return response.json() as Promise<NutritionalGoal | null>;
    },
  });

  // Fetch daily nutrition summary
  const { data: summary } = useQuery({
    queryKey: ["/api/nutrition/summary", selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/nutrition/summary/${selectedDate}`);
      return response.json() as Promise<DailyNutritionSummary>;
    },
  });

  // Fetch meal entries for the day
  const { data: meals = [] } = useQuery({
    queryKey: ["/api/nutrition/meals", selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/nutrition/meals/${selectedDate}`);
      return response.json() as Promise<MealEntry[]>;
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: number) => {
      await apiRequest("DELETE", `/api/nutrition/meals/${mealId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meals", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/summary", selectedDate] });
    },
  });

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage <= 110) return "bg-green-500";
    return "bg-orange-500";
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'EEEE, d MMMM', { locale: es });
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 flex items-center">
              <Target className="w-8 h-8 mr-3 text-primary-green" />
              Seguimiento Nutricional
            </h1>
            <p className="text-neutral-600 mt-2">Rastrea tus objetivos nutricionales diarios</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
            <Button
              onClick={() => setShowGoalsForm(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Objetivos</span>
            </Button>
          </div>
        </div>

        {/* Date Display */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 capitalize">
            {formatDate(selectedDate)}
          </h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="meals">Comidas</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Calories */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-600">Calorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-neutral-800">
                        {summary.totalCalories}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Meta: {summary.goalCalories}
                      </Badge>
                    </div>
                    <Progress 
                      value={(summary.totalCalories / summary.goalCalories) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {summary.goalCalories - summary.totalCalories > 0 
                        ? `${summary.goalCalories - summary.totalCalories} restantes`
                        : `${summary.totalCalories - summary.goalCalories} sobre la meta`
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Protein */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-600">Proteína</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-neutral-800">
                        {summary.totalProtein}g
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Meta: {summary.goalProtein}g
                      </Badge>
                    </div>
                    <Progress 
                      value={(summary.totalProtein / summary.goalProtein) * 100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* Carbs */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-600">Carbohidratos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-neutral-800">
                        {summary.totalCarbs}g
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Meta: {summary.goalCarbs}g
                      </Badge>
                    </div>
                    <Progress 
                      value={(summary.totalCarbs / summary.goalCarbs) * 100} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Add Meal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Comidas de Hoy</span>
                  <Button
                    onClick={() => setShowAddMeal(true)}
                    className="bg-primary-green hover:bg-green-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Comida
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No has registrado comidas para hoy
                  </p>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal) => (
                      <MealEntryCard
                        key={meal.id}
                        meal={meal}
                        onDelete={() => deleteMealMutation.mutate(meal.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-800">Registro de Comidas</h3>
                <Button
                  onClick={() => setShowAddMeal(true)}
                  className="bg-primary-green hover:bg-green-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Comida
                </Button>
              </div>

              {meals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      No hay comidas registradas
                    </h3>
                    <p className="text-neutral-500">
                      Comienza agregando tus comidas para rastrear tu progreso nutricional
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <MealEntryCard
                      key={meal.id}
                      meal={meal}
                      onDelete={() => deleteMealMutation.mutate(meal.id)}
                      detailed
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            {summary && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-800">Progreso del Día</h3>
                
                <div className="grid gap-6">
                  {[
                    { label: "Calorías", current: summary.totalCalories, goal: summary.goalCalories, unit: "" },
                    { label: "Proteína", current: summary.totalProtein, goal: summary.goalProtein, unit: "g" },
                    { label: "Carbohidratos", current: summary.totalCarbs, goal: summary.goalCarbs, unit: "g" },
                    { label: "Grasas", current: summary.totalFat, goal: summary.goalFat, unit: "g" },
                    { label: "Fibra", current: summary.totalFiber, goal: summary.goalFiber, unit: "g" },
                    { label: "Sodio", current: summary.totalSodium, goal: summary.goalSodium, unit: "mg" },
                  ].map((nutrient) => {
                    const percentage = (nutrient.current / nutrient.goal) * 100;
                    return (
                      <Card key={nutrient.label}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-neutral-800">{nutrient.label}</h4>
                            <div className="text-right">
                              <div className="text-sm font-medium text-neutral-800">
                                {nutrient.current}{nutrient.unit} / {nutrient.goal}{nutrient.unit}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {percentage.toFixed(0)}% de la meta
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className={`h-3 ${getProgressColor(nutrient.current, nutrient.goal)}`}
                          />
                          {percentage > 100 && (
                            <p className="text-xs text-orange-600 mt-1">
                              Has superado tu meta por {(nutrient.current - nutrient.goal).toFixed(0)}{nutrient.unit}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showGoalsForm && (
        <NutritionGoalsForm
          currentGoals={goals}
          onClose={() => setShowGoalsForm(false)}
          onSave={() => {
            setShowGoalsForm(false);
            queryClient.invalidateQueries({ queryKey: ["/api/nutrition/goals"] });
            queryClient.invalidateQueries({ queryKey: ["/api/nutrition/summary", selectedDate] });
          }}
        />
      )}

      {showAddMeal && (
        <AddMealModal
          date={selectedDate}
          onClose={() => setShowAddMeal(false)}
          onSave={() => {
            setShowAddMeal(false);
            queryClient.invalidateQueries({ queryKey: ["/api/nutrition/meals", selectedDate] });
            queryClient.invalidateQueries({ queryKey: ["/api/nutrition/summary", selectedDate] });
          }}
        />
      )}
    </div>
  );
}