
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus } from 'lucide-react';

interface FloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  isVisible: boolean;
}

export function FloatingControls({
  isRunning,
  isPaused,
  onToggleTimer,
  onNextLevel,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  isVisible
}: FloatingControlsProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/90 backdrop-blur border border-yellow-400/30 rounded-full px-4 py-2 flex gap-2 shadow-lg">
        <Button
          onClick={onToggleTimer}
          size="sm"
          className={`rounded-full ${isRunning && !isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isRunning && !isPaused ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <Button onClick={onNextLevel} variant="secondary" size="sm" className="rounded-full">
          <SkipForward className="w-4 h-4" />
        </Button>
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
