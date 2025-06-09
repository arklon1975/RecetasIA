import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Target, Save } from "lucide-react";
import { nutritionalGoalSchema } from "@shared/schema";
import type { NutritionalGoal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface NutritionGoalsFormProps {
  currentGoals?: NutritionalGoal | null;
  onClose: () => void;
  onSave: () => void;
}

export default function NutritionGoalsForm({ currentGoals, onClose, onSave }: NutritionGoalsFormProps) {
  const form = useForm({
    resolver: zodResolver(nutritionalGoalSchema),
    defaultValues: {
      dailyCalories: currentGoals?.dailyCalories || 2000,
      dailyProtein: currentGoals?.dailyProtein || 150,
      dailyCarbs: currentGoals?.dailyCarbs || 250,
      dailyFat: currentGoals?.dailyFat || 65,
      dailyFiber: currentGoals?.dailyFiber || 25,
      dailySodium: currentGoals?.dailySodium || 2300,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const method = currentGoals ? "PUT" : "POST";
      const response = await apiRequest(method, "/api/nutrition/goals", data);
      return response.json();
    },
    onSuccess: () => {
      onSave();
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-neutral-800">
            <Target className="w-6 h-6 mr-3 text-primary-green" />
            {currentGoals ? "Actualizar Objetivos" : "Establecer Objetivos"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dailyCalories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calorías diarias</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">kcal</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyProtein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proteína diaria</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="150"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">g</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyCarbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbohidratos diarios</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="250"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">g</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyFat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grasas diarias</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="65"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">g</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyFiber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fibra diaria</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">g</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailySodium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sodio diario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="2300"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-3 text-sm text-neutral-500">mg</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={mutation.isPending}
                className="flex-1 bg-primary-green hover:bg-green-600 text-white"
              >
                {mutation.isPending ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}