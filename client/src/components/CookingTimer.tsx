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
    if (isRunning && remainingSeconds <= 3 && remainingSeconds > 0) return "animate-ping";
    return "";
  };

  const getCookingEmoji = () => {
    if (isCompleted) return "✅";
    if (remainingSeconds <= 10 && remainingSeconds > 0) return "🔥";
    if (remainingSeconds <= 30 && remainingSeconds > 0) return "⏰";
    if (remainingSeconds <= 60 && remainingSeconds > 0) return "🍳";
    if (isRunning) return "👨‍🍳";
    return "⏲️";
  };

  const getBackgroundGradient = () => {
    const progress = getProgress();
    if (isCompleted) return "from-green-400 to-green-600";
    if (progress > 80) return "from-red-400 to-red-600";
    if (progress > 50) return "from-yellow-400 to-orange-500";
    return "from-primary-green to-green-600";
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
            <div className="relative w-56 h-56">
              {/* Animated Background Gradient */}
              <div className={cn(
                "absolute inset-4 rounded-full bg-gradient-to-br opacity-20 animate-pulse",
                getBackgroundGradient()
              )}></div>
              
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
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className={cn("transition-all duration-1000 ease-linear", getCircleColor())}
                  strokeLinecap="round"
                />
                {/* Glow effect for critical time */}
                {remainingSeconds <= 10 && remainingSeconds > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="text-red-400 opacity-50 animate-pulse"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              
              {/* Timer Text and Emoji */}
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                getBounceAnimation()
              )}>
                <div className="text-4xl mb-2 transition-all duration-300">
                  {getCookingEmoji()}
                </div>
                <div className={cn(
                  "text-3xl font-bold transition-all duration-300",
                  isCompleted ? "text-green-600" : getProgressColor()
                )}>
                  {formatTime(remainingSeconds)}
                </div>
                {isCompleted && (
                  <div className="text-sm text-green-600 font-medium animate-bounce mt-1">
                    ¡Tiempo terminado!
                  </div>
                )}
                {remainingSeconds <= 3 && remainingSeconds > 0 && (
                  <div className="text-red-600 text-lg font-bold animate-pulse mt-1">
                    ¡{remainingSeconds}!
                  </div>
                )}
              </div>

              {/* Floating particles for completion */}
              {isCompleted && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce"
                      style={{
                        left: `${20 + (i * 10)}%`,
                        top: `${30 + (i % 2) * 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              )}
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
              <div className={cn(
                "text-sm transition-all duration-500",
                remainingSeconds <= 10 ? "text-red-600 font-bold animate-pulse" : "text-neutral-600"
              )}>
                {remainingSeconds > 300 
                  ? "¡Perfecto para organizar los ingredientes! 🥄"
                  : remainingSeconds > 180
                  ? "¡Tiempo ideal para preparar todo! 📋"
                  : remainingSeconds > 60 
                  ? "¡La cocción está en marcha! 🔥"
                  : remainingSeconds > 30
                  ? "¡Ya casi está listo! 👨‍🍳"
                  : remainingSeconds > 10
                  ? "¡Los últimos momentos cruciales! ⏰"
                  : remainingSeconds > 5
                  ? "¡CUENTA REGRESIVA FINAL! 🚨"
                  : "¡SEGUNDOS FINALES! 🎆"
                }
              </div>
            </div>
          )}

          {/* Pulsing Ring Animation for Critical Time */}
          {isRunning && remainingSeconds <= 5 && remainingSeconds > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-red-500 rounded-full animate-ping opacity-30"></div>
              <div className="absolute w-72 h-72 border-2 border-orange-500 rounded-full animate-pulse opacity-20"></div>
            </div>
          )}

          {/* Completion Message with Animation */}
          {isCompleted && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 animate-pulse">
              <CardContent className="pt-4 text-center relative overflow-hidden">
                {/* Celebration Confetti Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-bounce"
                      style={{
                        left: `${10 + (i * 7)}%`,
                        top: `${20 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.2s'
                      }}
                    >
                      {i % 4 === 0 ? '🎉' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🎊' : '⭐'}
                    </div>
                  ))}
                </div>
                
                <div className="relative z-10">
                  <div className="text-2xl animate-bounce mb-2">🎊</div>
                  <div className="text-green-800 font-bold text-lg">
                    ¡Tu {stepName.toLowerCase()} está listo!
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Tiempo total: {formatTime(totalSeconds)}
                  </div>
                  <div className="text-xs text-green-500 mt-2 animate-pulse">
                    ¡Excelente trabajo en la cocina!
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}