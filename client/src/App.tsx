import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChefHat, Target, User } from "lucide-react";
import Home from "@/pages/Home";
import NutritionTracker from "@/pages/NutritionTracker";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/not-found";
import FloatingTimer from "@/components/FloatingTimer";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2 text-xl font-bold text-primary-green cursor-pointer">
                <ChefHat className="w-8 h-8" />
                <span>RecetApp</span>
              </div>
            </Link>
            
            <div className="flex space-x-4">
              <Link href="/">
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className={location === "/" ? "bg-primary-green hover:bg-green-600 text-white" : ""}
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Recetas
                </Button>
              </Link>
              
              <Link href="/nutrition">
                <Button
                  variant={location === "/nutrition" ? "default" : "ghost"}
                  className={location === "/nutrition" ? "bg-primary-green hover:bg-green-600 text-white" : ""}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Nutrición
                </Button>
              </Link>

              <Link href="/profile">
                <Button
                  variant={location === "/profile" ? "default" : "ghost"}
                  className={location === "/profile" ? "bg-primary-green hover:bg-green-600 text-white" : ""}
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/nutrition" component={NutritionTracker} />
        <Route path="/profile" component={UserProfile} />
        <Route component={NotFound} />
      </Switch>
      <FloatingTimer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
