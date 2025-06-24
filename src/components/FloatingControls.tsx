
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, Coffee, Undo2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onSkipBreak?: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  playersCount?: number;
  isVisible: boolean;
}

export function FloatingControls({
  isRunning,
  isPaused,
  isOnBreak,
  onToggleTimer,
  onNextLevel,
  onSkipBreak,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  onUndo,
  canUndo = false,
  playersCount = 0,
  isVisible
}: FloatingControlsProps) {
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleConfirmAction = (action: string, callback: () => void) => {
    if (showConfirmation === action) {
      callback();
      setShowConfirmation(null);
    } else {
      setShowConfirmation(action);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirmation(null), 3000);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <>
      {/* Main Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className={`backdrop-blur-md border rounded-full px-3 md:px-4 py-2 flex gap-1 md:gap-2 shadow-2xl transition-all duration-300 ${
          isOnBreak 
            ? 'bg-cyan-900/95 border-cyan-400/40 shadow-cyan-400/20' 
            : 'bg-black/95 border-yellow-400/40 shadow-yellow-400/20'
        }`}>
          
          {/* Primary Action Button - Play/Pause */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setTooltip(isRunning && !isPaused ? 'Pausar (ESPACIO)' : 'Iniciar (ESPACIO)')}
            onHoverEnd={() => setTooltip(null)}
          >
            <Button
              onClick={onToggleTimer}
              size="sm"
              className={`rounded-full w-10 h-10 md:w-12 md:h-12 transition-all duration-200 ${
                isOnBreak
                  ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-600/30'
                  : isRunning && !isPaused 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
              }`}
            >
              {isRunning && !isPaused ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
              )}
            </Button>
          </motion.div>
          
          {/* Break/Next Level Button */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setTooltip(isOnBreak ? 'Terminar Descanso' : 'Siguiente Nivel (N)')}
            onHoverEnd={() => setTooltip(null)}
          >
            {isOnBreak && onSkipBreak ? (
              <Button 
                onClick={() => handleConfirmAction('skipBreak', onSkipBreak)}
                variant="secondary" 
                size="sm" 
                className={`rounded-full w-10 h-10 transition-all duration-200 ${
                  showConfirmation === 'skipBreak'
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white ring-2 ring-cyan-300'
                    : 'bg-cyan-700 hover:bg-cyan-800 text-white'
                }`}
              >
                <Coffee className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => handleConfirmAction('nextLevel', onNextLevel)}
                variant="secondary" 
                size="sm" 
                className={`rounded-full w-10 h-10 transition-all duration-200 ${
                  showConfirmation === 'nextLevel'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black ring-2 ring-yellow-300'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
          
          {/* Reset Level Button */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setTooltip('Reiniciar Nivel (R)')}
            onHoverEnd={() => setTooltip(null)}
          >
            <Button 
              onClick={() => handleConfirmAction('reset', onResetLevel)}
              variant="secondary" 
              size="sm" 
              className={`rounded-full w-10 h-10 transition-all duration-200 ${
                showConfirmation === 'reset'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white ring-2 ring-orange-300'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </motion.div>
          
          {/* Player Controls */}
          <div className="hidden md:flex gap-1">
            {/* Add Player */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setTooltip('Agregar Jugador (CTRL+B)')}
              onHoverEnd={() => setTooltip(null)}
            >
              <Button 
                onClick={onAddPlayer}
                variant="secondary" 
                size="sm" 
                className="rounded-full w-10 h-10 bg-green-700 hover:bg-green-600 text-white transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </motion.div>
            
            {/* Eliminate Player */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setTooltip(playersCount > 0 ? 'Eliminar Jugador (X)' : 'No hay jugadores')}
              onHoverEnd={() => setTooltip(null)}
            >
              <Button 
                onClick={() => handleConfirmAction('eliminate', onEliminatePlayer)}
                variant="secondary" 
                size="sm" 
                disabled={playersCount === 0}
                className={`rounded-full w-10 h-10 transition-all duration-200 ${
                  playersCount === 0 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : showConfirmation === 'eliminate'
                      ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300'
                      : 'bg-red-700 hover:bg-red-600 text-white'
                }`}
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
          
          {/* Undo Button */}
          {canUndo && onUndo && (
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setTooltip('Deshacer (CTRL+Z)')}
              onHoverEnd={() => setTooltip(null)}
            >
              <Button 
                onClick={onUndo}
                variant="secondary" 
                size="sm" 
                className="rounded-full w-10 h-10 bg-blue-700 hover:bg-blue-600 text-white transition-all duration-200"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mobile Player Controls - Separate for better UX */}
      <div className="md:hidden">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ delay: 0.1 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="backdrop-blur-md bg-black/90 border border-gray-600/40 rounded-full px-3 py-1 flex gap-2 shadow-xl">
            {/* Add Player Mobile */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                onClick={onAddPlayer}
                variant="secondary" 
                size="sm" 
                className="rounded-full w-8 h-8 bg-green-700 hover:bg-green-600 text-white"
              >
                <UserPlus className="w-3 h-3" />
              </Button>
            </motion.div>
            
            {/* Eliminate Player Mobile */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                onClick={() => handleConfirmAction('eliminate', onEliminatePlayer)}
                variant="secondary" 
                size="sm" 
                disabled={playersCount === 0}
                className={`rounded-full w-8 h-8 transition-all duration-200 ${
                  playersCount === 0 
                    ? 'bg-gray-800 text-gray-500'
                    : showConfirmation === 'eliminate'
                      ? 'bg-red-500 text-white ring-1 ring-red-300'
                      : 'bg-red-700 hover:bg-red-600 text-white'
                }`}
              >
                <UserMinus className="w-3 h-3" />
              </Button>
            </motion.div>
            
            {/* Undo Mobile */}
            {canUndo && onUndo && (
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button 
                  onClick={onUndo}
                  variant="secondary" 
                  size="sm"
                  className="rounded-full w-8 h-8 bg-blue-700 hover:bg-blue-600 text-white"
                >
                  <Undo2 className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-black/90 text-white px-3 py-1 rounded-lg text-sm font-medium border border-gray-600/50">
              {tooltip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-yellow-600/90 text-white px-4 py-2 rounded-lg shadow-xl border border-yellow-400/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showConfirmation === 'reset' && 'Clic de nuevo para reiniciar nivel'}
                {showConfirmation === 'nextLevel' && 'Clic de nuevo para siguiente nivel'}
                {showConfirmation === 'eliminate' && 'Clic de nuevo para eliminar jugador'}
                {showConfirmation === 'skipBreak' && 'Clic de nuevo para terminar descanso'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
