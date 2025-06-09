import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Minimize2, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CookingTimer from "./CookingTimer";

export default function FloatingTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFullTimer, setShowFullTimer] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Simple timer state for the floating widget
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && isMinimized) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isCompleted) return "bg-green-500";
    if (remainingSeconds <= 10 && remainingSeconds > 0) return "bg-red-500";
    if (remainingSeconds <= 30 && remainingSeconds > 0) return "bg-yellow-500";
    return "bg-primary-green";
  };

  const getAnimationClass = () => {
    if (isCompleted) return "animate-bounce";
    if (remainingSeconds <= 10 && remainingSeconds > 0) return "animate-pulse";
    return "";
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg",
          "bg-primary-green hover:bg-green-600 text-white",
          "transition-all duration-300 hover:scale-110"
        )}
      >
        <Timer className="w-6 h-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div
        className={cn(
          "fixed z-50 cursor-move select-none",
          getAnimationClass()
        )}
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <Card className={cn(
          "w-24 h-24 shadow-lg border-2 transition-all duration-300",
          getTimerColor(),
          "text-white hover:scale-105"
        )}>
          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
            <Timer className="w-5 h-5 mb-1" />
            <div className="text-xs font-bold">
              {remainingSeconds > 0 ? formatTime(remainingSeconds) : "00:00"}
            </div>
            {isCompleted && (
              <div className="text-xs">¡Listo!</div>
            )}
          </CardContent>
        </Card>
        
        {/* Minimize Controls */}
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <Button
            size="sm"
            variant="secondary"
            className="w-6 h-6 p-0 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-6 h-6 p-0 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-xl border-2 border-primary-green">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800 flex items-center">
              <Timer className="w-4 h-4 mr-2 text-primary-green" />
              Timer Rápido
            </h3>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className={cn(
              "text-4xl font-bold transition-colors duration-300",
              isCompleted ? "text-green-600" : "text-neutral-800",
              getAnimationClass()
            )}>
              {formatTime(remainingSeconds)}
            </div>
            {isCompleted && (
              <div className="text-sm text-green-600 font-medium animate-pulse">
                ¡Tiempo terminado! 🎉
              </div>
            )}
          </div>

          {/* Quick Timer Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 5, 10].map(minutes => (
              <Button
                key={minutes}
                size="sm"
                variant="outline"
                onClick={() => {
                  setRemainingSeconds(minutes * 60);
                  setIsCompleted(false);
                  setIsRunning(false);
                }}
                className="text-xs"
              >
                {minutes}min
              </Button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "flex-1",
                isRunning 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "bg-primary-green hover:bg-green-600",
                "text-white"
              )}
              disabled={remainingSeconds === 0}
            >
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>
            
            <Button
              onClick={() => setShowFullTimer(true)}
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Timer className="w-4 h-4" />
              <span>Completo</span>
            </Button>
          </div>

          {/* Fun Status Messages */}
          {isRunning && remainingSeconds > 0 && (
            <div className="mt-3 text-center text-sm text-neutral-600">
              {remainingSeconds > 300 
                ? "Tiempo de preparar todo 🥄"
                : remainingSeconds > 60
                ? "¡Casi terminamos! 👨‍🍳"
                : remainingSeconds > 10
                ? "¡Los últimos momentos! ⏰"
                : "¡Cuenta regresiva! 🔥"
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Timer Modal */}
      <CookingTimer
        isOpen={showFullTimer}
        onClose={() => setShowFullTimer(false)}
        initialMinutes={10}
        stepName="Timer personalizado"
      />
    </div>
  );
}