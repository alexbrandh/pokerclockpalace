
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Coffee, Play } from 'lucide-react';
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

  // Dynamic color based on time remaining and break status
  const getTimerColor = () => {
    if (currentLevel?.isBreak) return '#06B6D4'; // cyan-500 for breaks
    if (lastMinuteAlert) return '#EF4444'; // red-500
    if (timeRemaining <= 300) return '#F59E0B'; // amber-500
    return '#D4AF37'; // gold
  };

  // Pulse animation for critical times or breaks
  const shouldPulse = timeRemaining <= 60 || lastMinuteAlert || currentLevel?.isBreak;

  return (
    <div className="relative">
      {/* Poker Chip Style Timer */}
      <div className="relative w-96 h-96">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          {/* Outer Ring - Main chip border */}
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          
          {/* Inner Ring - Secondary border */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="#374151"
            strokeWidth="4"
          />
          
          {/* Poker Chip Segments - 8 segments around the edge */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = 200 + 160 * Math.cos(angle);
            const y1 = 200 + 160 * Math.sin(angle);
            const x2 = 200 + 185 * Math.cos(angle);
            const y2 = 200 + 185 * Math.sin(angle);
            
            const segmentColor = currentLevel?.isBreak ? '#06B6D4' : 
                               i % 2 === 0 ? '#EF4444' : '#FFFFFF';
            
            return (
              <g key={i}>
                {/* Segment rectangles */}
                <rect
                  x={x1 - 8}
                  y={y1 - 15}
                  width="16"
                  height="30"
                  fill={segmentColor}
                  transform={`rotate(${i * 45} ${x1} ${y1})`}
                  rx="2"
                />
              </g>
            );
          })}
          
          {/* Main chip background */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="url(#chipGradient)"
            stroke="#4B5563"
            strokeWidth="2"
          />
          
          {/* Inner decorative circles */}
          <circle
            cx="200"
            cy="200"
            r="130"
            fill="none"
            stroke={currentLevel?.isBreak ? '#06B6D4' : '#D4AF37'}
            strokeWidth="2"
            opacity="0.6"
          />
          
          <circle
            cx="200"
            cy="200"
            r="110"
            fill="none"
            stroke={currentLevel?.isBreak ? '#0891B2' : '#B45309'}
            strokeWidth="1"
            opacity="0.4"
          />
          
          {/* Progress arc */}
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
            transform="rotate(-90 200 200)"
            style={{
              filter: `drop-shadow(0 0 8px ${getTimerColor()}60)`
            }}
          />
          
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="chipGradient" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Timer Content */}
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
              textShadow: `0 0 30px ${getTimerColor()}60`,
              filter: shouldPulse ? 'brightness(1.1)' : 'brightness(1)'
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
      </div>
      
      {/* Enhanced decorative elements with break colors */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`w-px h-12 bg-gradient-to-b ${
            currentLevel?.isBreak 
              ? 'from-cyan-400 via-cyan-300 to-transparent' 
              : 'from-yellow-400 via-yellow-300 to-transparent'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`w-px h-12 bg-gradient-to-t ${
            currentLevel?.isBreak 
              ? 'from-cyan-400 via-cyan-300 to-transparent' 
              : 'from-yellow-400 via-yellow-300 to-transparent'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className={`h-px w-12 bg-gradient-to-r ${
            currentLevel?.isBreak 
              ? 'from-cyan-400 via-cyan-300 to-transparent' 
              : 'from-yellow-400 via-yellow-300 to-transparent'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
      
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className={`h-px w-12 bg-gradient-to-l ${
            currentLevel?.isBreak 
              ? 'from-cyan-400 via-cyan-300 to-transparent' 
              : 'from-yellow-400 via-yellow-300 to-transparent'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
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

      {/* Break mode overlay */}
      <AnimatePresence>
        {currentLevel?.isBreak && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [0.9, 1.05, 0.9]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-4 border-cyan-400 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
