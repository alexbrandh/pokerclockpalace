import React from 'react';
import { motion } from 'framer-motion';
import { getTimerColor, getCircleCalculations, shouldPulse } from './timer-utils';

interface TimerCircleProps {
  progress: number;
  isBreak: boolean;
  lastMinuteAlert: boolean;
  timeRemaining: number;
}

export function TimerCircle({ progress, isBreak, lastMinuteAlert, timeRemaining }: TimerCircleProps) {
  const timerColor = getTimerColor(isBreak, lastMinuteAlert, timeRemaining);
  const shouldAnimate = shouldPulse(timeRemaining, lastMinuteAlert, isBreak);
  const { radius, circumference, strokeDasharray, strokeDashoffset } = getCircleCalculations(progress);

  return (
    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      {/* Outer glow ring */}
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke={timerColor}
        strokeWidth="0.2"
        fill="none"
        opacity="0.2"
        className={shouldAnimate ? 'animate-pulse' : ''}
      />
      
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="47"
        stroke={isBreak ? "rgba(6, 182, 212, 0.2)" : "rgba(212, 175, 55, 0.2)"}
        strokeWidth="1"
        fill="none"
      />
      
      {/* Progress circle with enhanced animation */}
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        stroke={timerColor}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ 
          strokeDashoffset,
          stroke: timerColor
        }}
        transition={{ 
          strokeDashoffset: { duration: 1, ease: "easeOut" },
          stroke: { duration: 0.3 }
        }}
        style={{
          filter: `drop-shadow(0 0 12px ${timerColor}40)`
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
            stroke={timerColor}
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
        fill={timerColor}
        animate={shouldAnimate ? {
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={shouldAnimate ? {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      />
    </svg>
  );
}