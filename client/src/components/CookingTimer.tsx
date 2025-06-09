import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes?: number;
  stepName?: string;
}

export default function CookingTimer({ isOpen, onClose, initialMinutes = 10, stepName = "Cocinar" }: CookingTimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create timer completion sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    if (isCompleted && soundEnabled) {
      createBeepSound();
      // Play multiple beeps
      setTimeout(createBeepSound, 600);
      setTimeout(createBeepSound, 1200);
    }
  }, [isCompleted, soundEnabled]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const handleStart = () => {
    if (!isRunning && remainingSeconds === 0) {
      // Reset timer
      const newTotal = minutes * 60 + seconds;
      setTotalSeconds(newTotal);
      setRemainingSeconds(newTotal);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    const newTotal = minutes * 60 + seconds;
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  };

  const handleSetTimer = () => {
    const newTotal = minutes * 60 + seconds;
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
    setIsCompleted(false);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const getProgressColor = () => {
    const progress = getProgress();
    if (progress < 50) return "text-green-500";
    if (progress < 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getCircleColor = () => {
    const progress = getProgress();
    if (progress < 50) return "stroke-green-500";
    if (progress < 80) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getBounceAnimation = () => {
    if (isCompleted) return "animate-bounce";
    if (isRunning && remainingSeconds <= 10 && remainingSeconds > 0) return "animate-pulse";
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-neutral-800">
            <Timer className="w-6 h-6 mr-3 text-primary-green" />
            Temporizador de Cocina
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Name */}
          {stepName && (
            <div className="text-center">
              <h3 className="text-lg font-medium text-neutral-700">{stepName}</h3>
            </div>
          )}

          {/* Timer Display */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-neutral-200"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className={cn("transition-all duration-1000 ease-linear", getCircleColor())}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Timer Text */}
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                getBounceAnimation()
              )}>
                <div className={cn(
                  "text-3xl font-bold transition-colors duration-300",
                  isCompleted ? "text-green-600" : getProgressColor()
                )}>
                  {formatTime(remainingSeconds)}
                </div>
                {isCompleted && (
                  <div className="text-sm text-green-600 font-medium animate-pulse">
                    ¡Tiempo terminado!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minutes">Minutos</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="seconds">Segundos</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Set Timer Button */}
          {!isRunning && (
            <Button
              onClick={handleSetTimer}
              variant="outline"
              className="w-full"
            >
              Establecer Tiempo
            </Button>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleStart}
              className={cn(
                "flex items-center space-x-2 px-6",
                isRunning 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "bg-primary-green hover:bg-green-600",
                "text-white"
              )}
              disabled={totalSeconds === 0}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Pausar" : "Iniciar"}</span>
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>

            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>

          {/* Fun Cooking Messages */}
          {isRunning && (
            <div className="text-center">
              <div className="text-sm text-neutral-600">
                {remainingSeconds > 60 
                  ? "¡Prepara los ingredientes! 🔥"
                  : remainingSeconds > 30
                  ? "¡Ya casi está listo! 👨‍🍳"
                  : remainingSeconds > 10
                  ? "¡Los últimos momentos! ⏰"
                  : "¡Cuenta regresiva final! 🎉"
                }
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <div className="text-green-800 font-medium">
                  🎉 ¡Tu {stepName.toLowerCase()} está listo!
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Tiempo total: {formatTime(totalSeconds)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}