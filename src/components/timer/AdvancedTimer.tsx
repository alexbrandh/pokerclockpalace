
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';

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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced progress calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Dynamic color based on time remaining
  const getTimerColor = () => {
    if (lastMinuteAlert) return '#EF4444'; // red-500
    if (timeRemaining <= 300) return '#F59E0B'; // amber-500
    return '#D4AF37'; // gold
  };

  // Pulse animation for critical times
  const shouldPulse = timeRemaining <= 60 || lastMinuteAlert;

  return (
    <div className="relative">
      {/* Main Timer Circle */}
      <div className="relative w-96 h-96">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Outer glow ring */}
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke={getTimerColor()}
            strokeWidth="0.2"
            fill="none"
            opacity="0.2"
            className={shouldPulse ? 'animate-pulse' : ''}
          />
          
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Progress circle with enhanced animation */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getTimerColor()}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset,
              stroke: getTimerColor()
            }}
            transition={{ 
              strokeDashoffset: { duration: 1, ease: "easeOut" },
              stroke: { duration: 0.3 }
            }}
            style={{
              filter: `drop-shadow(0 0 12px ${getTimerColor()}40)`
            }}
          />

          {/* Enhanced clock markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const x1 = 50 + 41 * Math.cos(angle - Math.PI / 2);
            const y1 = 50 + 41 * Math.sin(angle - Math.PI / 2);
            const x2 = 50 + 45 * Math.cos(angle - Math.PI / 2);
            const y2 = 50 + 45 * Math.sin(angle - Math.PI / 2);
            const isMainMark = i % 3 === 0;
            
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={getTimerColor()}
                strokeWidth={isMainMark ? "1.2" : "0.6"}
                opacity={isMainMark ? "0.9" : "0.6"}
                initial={{ opacity: 0 }}
                animate={{ opacity: isMainMark ? 0.9 : 0.6 }}
                transition={{ delay: i * 0.05 }}
              />
            );
          })}
          
          {/* Center dot with pulse */}
          <motion.circle
            cx="50"
            cy="50"
            r="1.5"
            fill={getTimerColor()}
            animate={shouldPulse ? {
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            } : {}}
            transition={shouldPulse ? {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          />
        </svg>
        
        {/* Timer Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Level indicator with animation */}
          <motion.div
            key={currentLevelIndex}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-lg font-semibold mb-2 ${currentLevel?.isBreak ? 'text-blue-400' : 'text-yellow-400'}`}
          >
            {currentLevel?.isBreak ? 'Descanso' : `Level ${currentLevelIndex + 1}`}
          </motion.div>
          
          {/* Main time display with enhanced styling */}
          <motion.div
            key={timeRemaining}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`text-7xl font-bold font-mono ${
              lastMinuteAlert ? 'text-red-500' : 'text-white'
            }`}
            style={{
              textShadow: `0 0 30px ${getTimerColor()}60`,
              filter: shouldPulse ? 'brightness(1.1)' : 'brightness(1)'
            }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
            {isPaused && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-yellow-400"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">PAUSADO</span>
              </motion.div>
            )}
            {lastMinuteAlert && (
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
          
          {/* Next break info */}
          <div className="mt-3 text-center">
            <div className="text-sm text-yellow-400 font-medium">Next Break</div>
            <div className="text-lg text-yellow-300 font-semibold">{nextBreakTime}</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-yellow-400 via-yellow-300 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-px h-12 bg-gradient-to-t from-yellow-400 via-yellow-300 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className="h-px w-12 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
      
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className="h-px w-12 bg-gradient-to-l from-yellow-400 via-yellow-300 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      {/* Critical time overlay */}
      <AnimatePresence>
        {timeRemaining <= 10 && timeRemaining > 0 && (
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
