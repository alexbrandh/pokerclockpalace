
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  onToggleFullscreen: () => void;
  playersCount: number;
  isVisible: boolean;
}

export function MobileControls({
  isRunning,
  isPaused,
  isFullscreen,
  onToggleTimer,
  onNextLevel,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  onToggleFullscreen,
  playersCount,
  isVisible
}: MobileControlsProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      >
        <div className="bg-black/95 backdrop-blur-xl border-t border-gray-700/50">
          
          {/* Primary Controls Row */}
          <div className="flex justify-center items-center gap-6 px-6 py-4">
            <Button
              onClick={onToggleTimer}
              size="lg"
              className={`h-16 w-16 rounded-full shadow-lg transition-all duration-200 ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/25' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/25'
              }`}
            >
              {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
            </Button>
            
            <Button
              onClick={onNextLevel}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-gray-600 hover:bg-gray-800 hover:border-gray-500 transition-all"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={onResetLevel}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-gray-600 hover:bg-gray-800 hover:border-gray-500 transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>

          {/* Secondary Controls Row */}
          <div className="flex justify-between items-center px-6 pb-4">
            {/* Player Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onEliminatePlayer}
                size="sm"
                variant="outline"
                disabled={playersCount <= 0}
                className="h-10 w-10 rounded-full border-red-600/60 text-red-400 hover:bg-red-900/20 hover:border-red-500 disabled:opacity-30"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center min-w-[60px] h-10 px-4 text-lg font-bold text-white bg-gray-800/80 rounded-full border border-gray-600/50">
                {playersCount}
              </div>
              
              <Button
                onClick={onAddPlayer}
                size="sm"
                variant="outline"
                className="h-10 w-10 rounded-full border-green-600/60 text-green-400 hover:bg-green-900/20 hover:border-green-500"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              onClick={onToggleFullscreen}
              size="sm"
              variant="ghost"
              className="h-10 w-10 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
