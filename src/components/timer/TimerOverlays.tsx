import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerOverlaysProps {
  timeRemaining: number;
  isBreak: boolean;
}

export function TimerOverlays({ timeRemaining, isBreak }: TimerOverlaysProps) {
  return (
    <>
      {/* Critical time overlay */}
      <AnimatePresence>
        {timeRemaining <= 10 && timeRemaining > 0 && !isBreak && (
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
        {isBreak && (
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
            className="absolute inset-0 border-4 border-yellow-400 rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}