
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Settings, Maximize, Minimize } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileTournamentControlsModal } from './MobileTournamentControlsModal';

interface MobileFloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  isFullscreen: boolean;
  playersCount: number;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  onSkipBreak: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export function MobileFloatingControls({
  isRunning,
  isPaused,
  isOnBreak,
  isFullscreen,
  playersCount,
  onToggleTimer,
  onNextLevel,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  onSkipBreak,
  onToggleFullscreen,
  onOpenSettings
}: MobileFloatingControlsProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Fullscreen Toggle - Left */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={onToggleFullscreen}
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-2 border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400 shadow-xl bg-black/80 backdrop-blur"
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </Button>
        </motion.div>

        {/* Main Play/Pause Button - Center */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={onToggleTimer}
            size="lg"
            className={`h-20 w-20 rounded-full shadow-2xl transition-all duration-200 text-lg font-bold ${
              isPaused 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/50' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/50'
            }`}
          >
            {isPaused ? (
              <Play className="w-10 h-10" />
            ) : (
              <Pause className="w-10 h-10" />
            )}
          </Button>
        </motion.div>

        {/* Controls Modal Button - Right */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0"
        >
          <MobileTournamentControlsModal
            isRunning={isRunning}
            isPaused={isPaused}
            isOnBreak={isOnBreak}
            playersCount={playersCount}
            onToggleTimer={onToggleTimer}
            onNextLevel={onNextLevel}
            onResetLevel={onResetLevel}
            onAddPlayer={onAddPlayer}
            onEliminatePlayer={onEliminatePlayer}
            onSkipBreak={onSkipBreak}
            onOpenSettings={onOpenSettings}
          >
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-blue-500/60 text-blue-400 hover:bg-blue-900/20 hover:border-blue-400 shadow-xl bg-black/80 backdrop-blur"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </MobileTournamentControlsModal>
        </motion.div>
      </div>
    </div>
  );
}
