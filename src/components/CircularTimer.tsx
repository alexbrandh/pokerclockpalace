
import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
  timeRemaining: number;
  currentLevel: any;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  currentLevelIndex: number;
}

export function CircularTimer({ 
  timeRemaining, 
  currentLevel, 
  progress, 
  lastMinuteAlert, 
  nextBreakTime,
  currentLevelIndex 
}: CircularTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Circular Timer */}
      <div className="relative w-96 h-96">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            fill="none"
          />
          {/* Progress dots around the circle */}
          {Array.from({ length: 60 }, (_, i) => {
            const angle = (i * 6) * Math.PI / 180;
            const isActive = i < (progress / 100) * 60;
            const x = 50 + 45 * Math.cos(angle - Math.PI / 2);
            const y = 50 + 45 * Math.sin(angle - Math.PI / 2);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.5"
                fill={isActive ? "#fbbf24" : "rgba(255,255,255,0.3)"}
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg text-gray-300 mb-2">
            {currentLevel?.isBreak ? 'Descanso' : `Level ${currentLevelIndex + 1}`}
          </div>
          <motion.div
            key={timeRemaining}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-7xl font-bold font-mono ${lastMinuteAlert ? 'text-red-500' : 'text-white'}`}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          <div className="text-lg text-gray-300 mt-2">
            Next Break
          </div>
          <div className="text-xl text-gray-300">
            {nextBreakTime}
          </div>
        </div>
      </div>
    </div>
  );
}
