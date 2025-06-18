
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface ClockControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
}

export function ClockControls({ 
  isRunning, 
  isPaused, 
  onToggleTimer, 
  onNextLevel, 
  onResetLevel 
}: ClockControlsProps) {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <Button
        onClick={onToggleTimer}
        size="lg"
        className={isRunning && !isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
      >
        {isRunning && !isPaused ? (
          <><Pause className="w-5 h-5 mr-2" />Pausar</>
        ) : (
          <><Play className="w-5 h-5 mr-2" />Iniciar</>
        )}
      </Button>
      <Button onClick={onNextLevel} variant="secondary" size="lg">
        <SkipForward className="w-5 h-5 mr-2" />
        Siguiente
      </Button>
      <Button onClick={onResetLevel} variant="secondary" size="lg">
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </div>
  );
}
