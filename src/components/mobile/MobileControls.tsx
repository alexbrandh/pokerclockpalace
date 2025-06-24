
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, Maximize, Minimize, Undo } from 'lucide-react';
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
          
          {/* Primary Controls Row - More prominent buttons */}
          <div className="flex justify-center items-center gap-4 px-4 py-4">
            <Button
              onClick={onToggleTimer}
              size="lg"
              className={`h-20 w-20 rounded-full shadow-xl transition-all duration-200 text-lg font-bold ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/40 scale-105' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/40'
              }`}
            >
              {isPaused ? (
                <div className="flex flex-col items-center">
                  <Play className="w-8 h-8 mb-1" />
                  <span className="text-xs">START</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Pause className="w-8 h-8 mb-1" />
                  <span className="text-xs">PAUSE</span>
                </div>
              )}
            </Button>
            
            <Button
              onClick={onNextLevel}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-2 border-blue-500/60 text-blue-400 hover:bg-blue-900/20 hover:border-blue-400 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center">
                <SkipForward className="w-6 h-6 mb-1" />
                <span className="text-xs">NEXT</span>
              </div>
            </Button>
            
            <Button
              onClick={onResetLevel}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-2 border-orange-500/60 text-orange-400 hover:bg-orange-900/20 hover:border-orange-400 transition-all shadow-lg"
            >
              <div className="flex flex-col items-center">
                <RotateCcw className="w-6 h-6 mb-1" />
                <span className="text-xs">RESET</span>
              </div>
            </Button>
          </div>

          {/* Secondary Controls Row - Better organized */}
          <div className="flex justify-between items-center px-6 pb-4">
            
            {/* Player Controls - Left side */}
            <div className="flex items-center gap-4">
              <Button
                onClick={onEliminatePlayer}
                size="sm"
                variant="outline"
                disabled={playersCount <= 0}
                className="h-12 w-12 rounded-full border-red-500/60 text-red-400 hover:bg-red-900/20 hover:border-red-400 disabled:opacity-30 shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <UserMinus className="w-4 h-4 mb-1" />
                  <span className="text-xs">-1</span>
                </div>
              </Button>
              
              <div className="flex items-center justify-center min-w-[70px] h-12 px-4 text-xl font-bold text-white bg-gray-800/80 rounded-full border-2 border-gray-600/50 shadow-lg">
                {playersCount}
              </div>
              
              <Button
                onClick={onAddPlayer}
                size="sm"
                variant="outline"
                className="h-12 w-12 rounded-full border-green-500/60 text-green-400 hover:bg-green-900/20 hover:border-green-400 shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <UserPlus className="w-4 h-4 mb-1" />
                  <span className="text-xs">+1</span>
                </div>
              </Button>
            </div>

            {/* Utility Controls - Right side */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onToggleFullscreen}
                size="sm"
                variant="ghost"
                className="h-12 w-12 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all shadow-lg"
              >
                <div className="flex flex-col items-center">
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4 mb-1" />
                      <span className="text-xs">EXIT</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4 mb-1" />
                      <span className="text-xs">FULL</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Instructions row */}
          <div className="px-4 pb-3 text-center">
            <div className="text-xs text-gray-400">
              Toca los botones para controlar el torneo • Usa FULL para pantalla completa
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
