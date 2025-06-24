
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, Coffee } from 'lucide-react';

interface FloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onSkipBreak?: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  isVisible: boolean;
}

export function FloatingControls({
  isRunning,
  isPaused,
  isOnBreak,
  onToggleTimer,
  onNextLevel,
  onSkipBreak,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  isVisible
}: FloatingControlsProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className={`backdrop-blur border rounded-full px-4 py-2 flex gap-2 shadow-lg ${
        isOnBreak 
          ? 'bg-cyan-900/90 border-cyan-400/30' 
          : 'bg-black/90 border-yellow-400/30'
      }`}>
        <Button
          onClick={onToggleTimer}
          size="sm"
          className={`rounded-full ${
            isOnBreak
              ? 'bg-cyan-600 hover:bg-cyan-700'
              : isRunning && !isPaused 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning && !isPaused ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        {isOnBreak && onSkipBreak ? (
          <Button 
            onClick={onSkipBreak} 
            variant="secondary" 
            size="sm" 
            className="rounded-full bg-cyan-700 hover:bg-cyan-800 text-white"
          >
            <Coffee className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={onNextLevel} variant="secondary" size="sm" className="rounded-full">
            <SkipForward className="w-4 h-4" />
          </Button>
        )}
        
        <Button onClick={onResetLevel} variant="secondary" size="sm" className="rounded-full">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={onAddPlayer} variant="secondary" size="sm" className="rounded-full">
          <UserPlus className="w-4 h-4" />
        </Button>
        <Button onClick={onEliminatePlayer} variant="secondary" size="sm" className="rounded-full">
          <UserMinus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
