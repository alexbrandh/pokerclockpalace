
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Play, Pause, SkipForward, RotateCcw, UserPlus, UserMinus, Settings, FastForward, RotateCcw as Undo, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileTournamentControlsModalProps {
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  playersCount: number;
  canUndo: boolean;
  onToggleTimer: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onAddPlayer: () => void;
  onEliminatePlayer: () => void;
  onAddReentry: () => void;
  onSkipBreak: () => void;
  onUndoLastAction: () => void;
  onOpenSettings: () => void;
  children: React.ReactNode;
}

export function MobileTournamentControlsModal({
  isRunning,
  isPaused,
  isOnBreak,
  playersCount,
  canUndo,
  onToggleTimer,
  onNextLevel,
  onResetLevel,
  onAddPlayer,
  onEliminatePlayer,
  onAddReentry,
  onSkipBreak,
  onUndoLastAction,
  onOpenSettings,
  children
}: MobileTournamentControlsModalProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-black/95 border-gray-700 text-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-xl font-bold text-center">
            Controles del Torneo
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Timer Controls Section */}
          <div className="space-y-3">
            <h3 className="text-yellow-400 font-semibold text-sm border-b border-yellow-400/20 pb-1">
              Control del Timer
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onToggleTimer}
                  size="lg"
                  className={`w-full h-12 text-sm font-bold rounded-xl ${
                    isPaused 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30' 
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span>INICIAR</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>PAUSAR</span>
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onResetLevel}
                  size="lg"
                  variant="outline"
                  className="w-full h-12 border-2 border-orange-500/60 text-orange-400 hover:bg-orange-900/20 hover:border-orange-400 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">REINICIAR</span>
                  </div>
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onNextLevel}
                  size="sm"
                  variant="outline"
                  className="w-full h-10 border-2 border-blue-500/60 text-blue-400 hover:bg-blue-900/20 hover:border-blue-400 rounded-xl shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <SkipForward className="w-3 h-3 mb-0.5" />
                    <span className="text-xs">SIGUIENTE</span>
                  </div>
                </Button>
              </motion.div>

              {isOnBreak && (
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onSkipBreak}
                    size="sm"
                    variant="outline"
                    className="w-full h-10 border-2 border-cyan-500/60 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-400 rounded-xl shadow-lg"
                  >
                    <div className="flex flex-col items-center">
                      <FastForward className="w-3 h-3 mb-0.5" />
                      <span className="text-xs">SALTAR</span>
                    </div>
                  </Button>
                </motion.div>
              )}

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onUndoLastAction}
                  disabled={!canUndo}
                  size="sm"
                  variant="outline"
                  className="w-full h-10 border-2 border-purple-500/60 text-purple-400 hover:bg-purple-900/20 hover:border-purple-400 disabled:opacity-30 rounded-xl shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <Undo className="w-3 h-3 mb-0.5" />
                    <span className="text-xs">DESHACER</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Player Management Section */}
          <div className="space-y-3">
            <h3 className="text-yellow-400 font-semibold text-sm border-b border-yellow-400/20 pb-1">
              Gestión de Jugadores
            </h3>
            
            <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-3">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onEliminatePlayer}
                  disabled={playersCount <= 0}
                  size="lg"
                  variant="outline"
                  className="h-10 w-10 rounded-full border-2 border-red-500/60 text-red-400 hover:bg-red-900/20 hover:border-red-400 disabled:opacity-30 shadow-lg"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Jugadores</div>
                <div className="text-2xl font-bold text-white">{playersCount}</div>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onAddPlayer}
                  size="lg"
                  variant="outline"
                  className="h-10 w-10 rounded-full border-2 border-green-500/60 text-green-400 hover:bg-green-900/20 hover:border-green-400 shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Re-entry Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAddReentry}
                size="sm"
                variant="outline"
                className="w-full h-10 border-2 border-emerald-500/60 text-emerald-400 hover:bg-emerald-900/20 hover:border-emerald-400 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm">AGREGAR RE-ENTRY</span>
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Tournament Settings Section */}
          <div className="space-y-3">
            <h3 className="text-yellow-400 font-semibold text-sm border-b border-yellow-400/20 pb-1">
              Configuración
            </h3>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onOpenSettings}
                size="lg"
                variant="outline"
                className="w-full h-10 border-2 border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Configuración del Torneo</span>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
