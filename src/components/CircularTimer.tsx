
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

  // Calculate the stroke dash array for the progress circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      {/* Circular Timer */}
      <div className="relative w-96 h-96">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle with golden border */}
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
            opacity="0.3"
          />
          
          {/* Inner background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Progress circle - animated */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#D4AF37"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))"
            }}
          />

          {/* Clock markers (12 hour positions) */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const x1 = 50 + 42 * Math.cos(angle - Math.PI / 2);
            const y1 = 50 + 42 * Math.sin(angle - Math.PI / 2);
            const x2 = 50 + 45 * Math.cos(angle - Math.PI / 2);
            const y2 = 50 + 45 * Math.sin(angle - Math.PI / 2);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#D4AF37"
                strokeWidth={i % 3 === 0 ? "0.8" : "0.4"}
                opacity="0.8"
              />
            );
          })}
          
          {/* Center dot */}
          <circle
            cx="50"
            cy="50"
            r="1"
            fill="#D4AF37"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg text-yellow-400 mb-2 font-semibold">
            {currentLevel?.isBreak ? 'Descanso' : `Level ${currentLevelIndex + 1}`}
          </div>
          <motion.div
            key={timeRemaining}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-7xl font-bold font-mono ${lastMinuteAlert ? 'text-red-500' : 'text-white'}`}
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.5)"
            }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          <div className="text-lg text-yellow-400 mt-2 font-semibold">
            Next Break
          </div>
          <div className="text-xl text-yellow-300">
            {nextBreakTime}
          </div>
        </div>
      </div>
      
      {/* Golden decorative lines */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-yellow-400 to-transparent"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-t from-yellow-400 to-transparent"></div>
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-px w-8 bg-gradient-to-r from-yellow-400 to-transparent"></div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-px w-8 bg-gradient-to-l from-yellow-400 to-transparent"></div>
    </div>
  );
}
