import React from 'react';
import { motion } from 'framer-motion';

interface TimerDecorationsProps {
  isBreak: boolean;
}

export function TimerDecorations({ isBreak }: TimerDecorationsProps) {
  const gradientClass = isBreak 
    ? 'from-cyan-400 via-cyan-300 to-transparent' 
    : 'from-yellow-400 via-yellow-300 to-transparent';

  return (
    <>
      {/* Top decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`w-px h-12 bg-gradient-to-b ${gradientClass}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`w-px h-12 bg-gradient-to-t ${gradientClass}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      {/* Left decoration */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className={`h-px w-12 bg-gradient-to-r ${gradientClass}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
      
      {/* Right decoration */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <motion.div
          className={`h-px w-12 bg-gradient-to-l ${gradientClass}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
    </>
  );
}