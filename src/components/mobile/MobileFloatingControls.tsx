
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Settings, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileTournamentControlsModal } from './MobileTournamentControlsModal';

interface MobileFloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  isFullscreen: boolean;
  playersCount: number;
  canUndo: boolean;
  fullscreenSupported?: boolean;
  debugInfo?: string;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  onAddReentry: () => void;
  onSkipBreak: () => void;
  onUndoLastAction: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export function MobileFloatingControls({
  isRunning,
  isPaused,
  isOnBreak,
  isFullscreen,
  playersCount,
  canUndo,
  fullscreenSupported = true,
  debugInfo = '',
  onToggleTimer,
  onNextLevel,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  onAddReentry,
  onSkipBreak,
  onUndoLastAction,
  onToggleFullscreen,
  onOpenSettings
}: MobileFloatingControlsProps) {
  const handleFullscreenClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Fullscreen button clicked - starting process...');
    
    // Add visual feedback immediately
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
    
    // Call the fullscreen function
    onToggleFullscreen();
  };

  return (
    <>
      {/* Debug Info Toast */}
      <AnimatePresence>
        {debugInfo && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[60] pointer-events-none"
          >
            <div className="bg-black/95 backdrop-blur text-white text-sm px-4 py-3 rounded-xl border border-yellow-400/30 text-center shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>{debugInfo}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Fullscreen Toggle - Left */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0"
          >
            <Button
              onClick={handleFullscreenClick}
              size="lg"
              variant="outline"
              disabled={!fullscreenSupported}
              className={`h-12 w-12 rounded-full border-2 text-gray-300 hover:bg-gray-800/50 shadow-xl bg-black/80 backdrop-blur transition-all duration-200 ${
                fullscreenSupported 
                  ? isFullscreen 
                    ? 'border-green-500/60 text-green-400 hover:border-green-400 shadow-green-400/20' 
                    : 'border-yellow-500/60 text-yellow-400 hover:border-yellow-400 shadow-yellow-400/20'
                  : 'border-red-500/60 text-red-400 opacity-50 cursor-not-allowed'
              }`}
              title={
                !fullscreenSupported 
                  ? "Pantalla completa no soportada" 
                  : isFullscreen 
                    ? "Salir de pantalla completa" 
                    : "Pantalla completa horizontal"
              }
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
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
              className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-200 text-lg font-bold ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/50' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/50'
              }`}
            >
              {isPaused ? (
                <Play className="w-8 h-8" />
              ) : (
                <Pause className="w-8 h-8" />
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
              canUndo={canUndo}
              onToggleTimer={onToggleTimer}
              onNextLevel={onNextLevel}
              onResetLevel={onResetLevel}
              onAddPlayer={onAddPlayer}
              onEliminatePlayer={onEliminatePlayer}
              onAddReentry={onAddReentry}
              onSkipBreak={onSkipBreak}
              onUndoLastAction={onUndoLastAction}
              onOpenSettings={onOpenSettings}
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full border-2 border-blue-500/60 text-blue-400 hover:bg-blue-900/20 hover:border-blue-400 shadow-xl bg-black/80 backdrop-blur"
                title="Controles del torneo"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </MobileTournamentControlsModal>
          </motion.div>
        </div>
      </div>
    </>
  );
}
