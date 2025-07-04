
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TournamentLevel } from '@/types/tournament';

interface AdvancedTimerProps {
  timeRemaining: number;
  currentLevel: TournamentLevel;
  progress: number;
  lastMinuteAlert: boolean;
  currentLevelIndex: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function AdvancedTimer({
  timeRemaining,
  currentLevel,
  progress,
  lastMinuteAlert,
  currentLevelIndex,
  isRunning,
  isPaused
}: AdvancedTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Professional timer colors
  const getTimerColor = () => {
    if (currentLevel?.isBreak) return '#06B6D4';
    if (lastMinuteAlert) return '#EF4444';
    if (timeRemaining <= 300) return '#F59E0B';
    return '#10B981';
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Professional Circular Timer */}
      <div className="relative w-80 h-80">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
            style={{
              filter: `drop-shadow(0 0 10px ${getTimerColor()}60)`
            }}
          />
        </svg>
        
        {/* Timer Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Time Display */}
          <motion.div
            key={timeRemaining}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`text-6xl font-bold font-mono ${
              currentLevel?.isBreak ? 'text-cyan-400' :
              lastMinuteAlert ? 'text-red-400' : 'text-white'
            }`}
            style={{
              textShadow: `0 0 20px ${getTimerColor()}40`
            }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          
          {/* Status indicator */}
          {isPaused && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-sm font-medium mt-2 ${
                currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
              }`}
            >
              PAUSADO
            </motion.div>
          )}
          
          {lastMinuteAlert && !currentLevel?.isBreak && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-sm font-bold text-red-400 mt-2"
            >
              ¡ÚLTIMO MINUTO!
            </motion.div>
          )}
        </div>
      </div>

      {/* Critical time overlay */}
      <AnimatePresence>
        {timeRemaining <= 10 && timeRemaining > 0 && !currentLevel?.isBreak && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0.9, 1.1, 0.9]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-4 border-red-500 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
