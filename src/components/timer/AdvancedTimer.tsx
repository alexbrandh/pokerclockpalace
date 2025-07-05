
import React from 'react';
import { TournamentLevel } from '@/types/tournament';
import { TimerCircle } from './TimerCircle';
import { TimerContent } from './TimerContent';
import { TimerDecorations } from './TimerDecorations';
import { TimerOverlays } from './TimerOverlays';

interface AdvancedTimerProps {
  timeRemaining: number;
  currentLevel: TournamentLevel;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  currentLevelIndex: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function AdvancedTimer({
  timeRemaining,
  currentLevel,
  progress,
  lastMinuteAlert,
  nextBreakTime,
  currentLevelIndex,
  isRunning,
  isPaused
}: AdvancedTimerProps) {
  return (
    <div className="relative">
      {/* Main Timer Circle */}
      <div className="relative w-96 h-96">
        <TimerCircle
          progress={progress}
          isBreak={currentLevel?.isBreak || false}
          lastMinuteAlert={lastMinuteAlert}
          timeRemaining={timeRemaining}
        />
        
        <TimerContent
          timeRemaining={timeRemaining}
          currentLevel={currentLevel}
          currentLevelIndex={currentLevelIndex}
          lastMinuteAlert={lastMinuteAlert}
          isPaused={isPaused}
          nextBreakTime={nextBreakTime}
        />
      </div>
      
      <TimerDecorations isBreak={currentLevel?.isBreak || false} />
      
      <TimerOverlays 
        timeRemaining={timeRemaining}
        isBreak={currentLevel?.isBreak || false}
      />
    </div>
  );
}
