import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Coffee, Play } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';
import { formatTime, getTimerColor, shouldPulse } from './timer-utils';

interface TimerContentProps {
  timeRemaining: number;
  currentLevel: TournamentLevel;
  currentLevelIndex: number;
  lastMinuteAlert: boolean;
  isPaused: boolean;
  nextBreakTime: string;
}

export function TimerContent({ 
  timeRemaining, 
  currentLevel, 
  currentLevelIndex, 
  lastMinuteAlert, 
  isPaused,
  nextBreakTime 
}: TimerContentProps) {
  const timerColor = getTimerColor(currentLevel?.isBreak || false, lastMinuteAlert, timeRemaining);
  const shouldAnimate = shouldPulse(timeRemaining, lastMinuteAlert, currentLevel?.isBreak || false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Level indicator with special break styling */}
      <motion.div
        key={`${currentLevelIndex}-${currentLevel?.isBreak}`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
          currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
        }`}
      >
        {currentLevel?.isBreak ? (
          <>
            <Coffee className="w-5 h-5" />
            <span>DESCANSO</span>
          </>
        ) : (
          `Level ${currentLevelIndex + 1}`
        )}
      </motion.div>
      
      {/* Main time display with enhanced styling */}
      <motion.div
        key={timeRemaining}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`text-7xl font-bold font-mono ${
          currentLevel?.isBreak ? 'text-cyan-400' :
          lastMinuteAlert ? 'text-red-500' : 'text-white'
        }`}
        style={{
          textShadow: `0 0 30px ${timerColor}60`,
          filter: shouldAnimate ? 'brightness(1.1)' : 'brightness(1)'
        }}
      >
        {formatTime(timeRemaining)}
      </motion.div>
      
      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-2">
        {isPaused && !currentLevel?.isBreak && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-yellow-400"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">PAUSADO</span>
          </motion.div>
        )}
        
        {currentLevel?.isBreak && isPaused && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-cyan-400"
          >
            <Coffee className="w-4 h-4" />
            <span className="text-sm font-medium">EN DESCANSO</span>
          </motion.div>
        )}
        
        {currentLevel?.isBreak && !isPaused && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 text-cyan-300"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-bold">DESCANSO ACTIVO</span>
          </motion.div>
        )}
        
        {lastMinuteAlert && !currentLevel?.isBreak && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="flex items-center gap-1 text-red-400"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">¡ÚLTIMO MINUTO!</span>
          </motion.div>
        )}
      </div>
      
      {/* Next break info - only show when not in break */}
      {!currentLevel?.isBreak && (
        <div className="mt-3 text-center">
          <div className="text-sm text-yellow-400 font-medium">Next Break</div>
          <div className="text-lg text-yellow-300 font-semibold">{nextBreakTime}</div>
        </div>
      )}
      
      {/* Break duration info when in break */}
      {currentLevel?.isBreak && (
        <div className="mt-3 text-center">
          <div className="text-sm text-cyan-400 font-medium">Break Duration</div>
          <div className="text-lg text-cyan-300 font-semibold">
            {currentLevel.duration} minutos
          </div>
        </div>
      )}
    </div>
  );
}