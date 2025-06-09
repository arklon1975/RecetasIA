import { ChefHat, Menu, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-green rounded-lg flex items-center justify-center">
              <ChefHat className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800">RecetasIA</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="text-neutral-400 hover:text-primary-green">
              Mis Recetas
            </Button>
            <Button variant="ghost" className="text-neutral-400 hover:text-primary-green">
              <Heart className="w-4 h-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="ghost" className="text-neutral-400 hover:text-primary-green">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
          </nav>
          
          <Button variant="ghost" size="icon" className="md:hidden text-neutral-400">
            <Menu className="text-xl" />
          </Button>
        </div>
      </div>
    </header>
  );
}
