
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
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="bg-black/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4">
          {/* Primary Controls Row */}
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={onToggleTimer}
              size="lg"
              className={`h-16 w-16 rounded-full ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
            </Button>
            
            <Button
              onClick={onNextLevel}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-gray-600 hover:bg-gray-800"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={onResetLevel}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-gray-600 hover:bg-gray-800"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>

          {/* Secondary Controls Row */}
          <div className="flex justify-between items-center">
            {/* Player Controls */}
            <div className="flex gap-2">
              <Button
                onClick={onEliminatePlayer}
                size="sm"
                variant="outline"
                disabled={playersCount <= 0}
                className="border-red-600 text-red-400 hover:bg-red-900/20"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-3 py-2 text-sm text-white bg-gray-800 rounded">
                {playersCount}
              </span>
              <Button
                onClick={onAddPlayer}
                size="sm"
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-900/20"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              onClick={onToggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
