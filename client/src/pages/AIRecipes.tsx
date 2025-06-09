import { AIRecipeGenerator } from "@/components/AIRecipeGenerator";

export default function AIRecipes() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generador de Recetas con IA
        </h1>
        <p className="text-gray-600">
          Utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias
        </p>
      </div>
      
      <AIRecipeGenerator />
    </div>
  );
} 