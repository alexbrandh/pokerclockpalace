
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
      {/* Professional Poker Chip Timer */}
      <div className="relative w-96 h-96">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            {/* Main chip gradient - realistic 3D effect */}
            <radialGradient id="chipGradient" cx="0.3" cy="0.3" r="0.9">
              <stop offset="0%" stopColor="#2D3748" />
              <stop offset="30%" stopColor="#1A202C" />
              <stop offset="70%" stopColor="#0F1419" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            
            {/* Segment gradients for 3D effect */}
            <linearGradient id="redSegment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F56565" />
              <stop offset="50%" stopColor="#E53E3E" />
              <stop offset="100%" stopColor="#C53030" />
            </linearGradient>
            
            <linearGradient id="whiteSegment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F7FAFC" />
              <stop offset="100%" stopColor="#EDF2F7" />
            </linearGradient>
            
            <linearGradient id="blueSegment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4299E1" />
              <stop offset="50%" stopColor="#3182CE" />
              <stop offset="100%" stopColor="#2B6CB0" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Outer shadow ring */}
          <circle
            cx="200"
            cy="200"
            r="195"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
          />
          
          {/* Main chip body */}
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="url(#chipGradient)"
            stroke="#2D3748"
            strokeWidth="3"
            filter="url(#shadow)"
          />
          
          {/* Poker Chip Edge Segments - 12 larger segments like real chips */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const innerRadius = 150;
            const outerRadius = 180;
            
            // Calculate arc path
            const x1 = 200 + innerRadius * Math.cos(angle - Math.PI / 12);
            const y1 = 200 + innerRadius * Math.sin(angle - Math.PI / 12);
            const x2 = 200 + outerRadius * Math.cos(angle - Math.PI / 12);
            const y2 = 200 + outerRadius * Math.sin(angle - Math.PI / 12);
            const x3 = 200 + outerRadius * Math.cos(angle + Math.PI / 12);
            const y3 = 200 + outerRadius * Math.sin(angle + Math.PI / 12);
            const x4 = 200 + innerRadius * Math.cos(angle + Math.PI / 12);
            const y4 = 200 + innerRadius * Math.sin(angle + Math.PI / 12);
            
            const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`;
            
            const segmentColor = currentLevel?.isBreak ? 
              (i % 2 === 0 ? 'url(#blueSegment)' : 'url(#whiteSegment)') :
              (i % 2 === 0 ? 'url(#redSegment)' : 'url(#whiteSegment)');
            
            return (
              <path
                key={i}
                d={pathData}
                fill={segmentColor}
                stroke="#1A202C"
                strokeWidth="1"
                opacity="0.9"
              />
            );
          })}
          
          {/* Inner chip area */}
          <circle
            cx="200"
            cy="200"
            r="145"
            fill="url(#chipGradient)"
            stroke="#4A5568"
            strokeWidth="2"
          />
          
          {/* Decorative inner rings */}
          <circle
            cx="200"
            cy="200"
            r="120"
            fill="none"
            stroke={currentLevel?.isBreak ? '#4299E1' : '#D69E2E'}
            strokeWidth="3"
            opacity="0.7"
          />
          
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke={currentLevel?.isBreak ? '#3182CE' : '#B7791F'}
            strokeWidth="2"
            opacity="0.5"
          />
          
          {/* Progress indicator - follows chip edge */}
          <circle
            cx="200"
            cy="200"
            r="165"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 165}`}
            strokeDashoffset={`${2 * Math.PI * 165 * (1 - progress / 100)}`}
            transform="rotate(-90 200 200)"
            opacity="0.8"
            style={{
              filter: `drop-shadow(0 0 12px ${getTimerColor()}80)`
            }}
          />
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
