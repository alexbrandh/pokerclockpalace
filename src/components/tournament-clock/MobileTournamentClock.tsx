
import React from 'react';
import { AdvancedTimer } from '@/components/timer/AdvancedTimer';
import { MobileFloatingControls } from '@/components/mobile/MobileFloatingControls';
import { MobileExpandedStats } from '@/components/mobile/MobileExpandedStats';
import { MobilePrizeInfo } from '@/components/mobile/MobilePrizeInfo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { TournamentState } from '@/types/tournament';

interface MobileTournamentClockProps {
  tournament: TournamentState;
  currentLevel: any;
  nextLevelData: any;
  progress: number;
  lastMinuteAlert: boolean;
  nextBreakTime: string;
  actionHistory: any[];
  toggleTimer: () => void;
  nextLevel: () => void;
  resetLevel: () => void;
  addPlayer: () => void;
  eliminatePlayer: () => void;
  addReentry: () => void;
  skipBreak: () => void;
  undoLastAction: () => void;
  setShowSettings: (show: boolean) => void;
}

export function MobileTournamentClock({
  tournament,
  currentLevel,
  nextLevelData,
  progress,
  lastMinuteAlert,
  nextBreakTime,
  actionHistory,
  toggleTimer,
  nextLevel,
  resetLevel,
  addPlayer,
  eliminatePlayer,
  addReentry,
  skipBreak,
  undoLastAction,
  setShowSettings
}: MobileTournamentClockProps) {
  const mobileOpt = useMobileOptimization();

  // Create landscape-specific layout for fullscreen
  if (mobileOpt.isFullscreen && mobileOpt.orientation === 'landscape') {
    return (
      <div className="h-screen flex bg-black text-white">
        {/* Left Side - Timer */}
        <div className="flex-1 flex items-center justify-center">
          <div className="scale-90">
            <AdvancedTimer
              timeRemaining={tournament.timeRemaining}
              currentLevel={currentLevel}
              progress={progress}
              lastMinuteAlert={lastMinuteAlert}
              nextBreakTime={nextBreakTime}
              currentLevelIndex={tournament.currentLevelIndex}
              isRunning={tournament.isRunning}
              isPaused={tournament.isPaused}
            />
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="flex-1 p-4 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Tournament Title */}
              <div className="text-center">
                <h1 className="text-lg font-bold text-white">
                  {tournament.structure.name}
                </h1>
              </div>

              {/* Current Level Info */}
              <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
                <div className="text-center space-y-3">
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                      currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
                    }`}>
                      {currentLevel?.isBreak ? 'DESCANSO' : `NIVEL ${tournament.currentLevelIndex + 1}`}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {currentLevel?.isBreak ? 
                        `${currentLevel.duration} minutos` :
                        `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                      }
                      {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                        <div className="text-sm text-gray-300 mt-1">Ante: {currentLevel.ante}</div>
                      )}
                    </div>
                  </div>

                  {/* Next Level Preview */}
                  {nextLevelData && !currentLevel?.isBreak && (
                    <div className="pt-3 border-t border-gray-700/50">
                      <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                        Siguiente Nivel
                      </div>
                      <div className="text-sm font-bold text-gray-300">
                        {nextLevelData.isBreak ? 
                          `Descanso ${nextLevelData.duration}min` :
                          `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                        }
                        {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                          <span className="text-xs text-gray-400 ml-2">({nextLevelData.ante})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <MobileExpandedStats 
                tournament={tournament} 
                currentLevel={currentLevel}
              />

              {/* Prize Info */}
              <MobilePrizeInfo />
            </div>
          </ScrollArea>
        </div>

        {/* Floating Controls */}
        <MobileFloatingControls
          isRunning={tournament.isRunning}
          isPaused={tournament.isPaused}
          isOnBreak={tournament.isOnBreak}
          isFullscreen={mobileOpt.isFullscreen}
          playersCount={tournament.players}
          canUndo={actionHistory.length > 0}
          onToggleTimer={toggleTimer}
          onNextLevel={nextLevel}
          onResetLevel={resetLevel}
          onAddPlayer={addPlayer}
          onEliminatePlayer={eliminatePlayer}
          onAddReentry={addReentry}
          onSkipBreak={skipBreak}
          onUndoLastAction={undoLastAction}
          onToggleFullscreen={mobileOpt.toggleFullscreen}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>
    );
  }

  // Portrait layout with scroll enabled
  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollArea className="h-screen">
        <div 
          className="px-4 pb-24" 
          style={{
            paddingTop: mobileOpt.isFullscreen ? 
              `${mobileOpt.safeAreaInsets.top + 12}px` : '12px'
          }}
        >
          
          {/* Tournament Title */}
          <div className="text-center py-4">
            <h1 className="text-xl font-bold text-white">
              {tournament.structure.name}
            </h1>
          </div>

          {/* Expanded Stats */}
          <div className="mb-4">
            <MobileExpandedStats 
              tournament={tournament} 
              currentLevel={currentLevel}
            />
          </div>

          {/* Timer - Centered */}
          <div className="flex items-center justify-center py-6">
            <div className="scale-85 md:scale-95">
              <AdvancedTimer
                timeRemaining={tournament.timeRemaining}
                currentLevel={currentLevel}
                progress={progress}
                lastMinuteAlert={lastMinuteAlert}
                nextBreakTime={nextBreakTime}
                currentLevelIndex={tournament.currentLevelIndex}
                isRunning={tournament.isRunning}
                isPaused={tournament.isPaused}
              />
            </div>
          </div>

          {/* Current Level Info */}
          <div className="mb-4">
            <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
              <div className="text-center space-y-3">
                
                {/* Current Level */}
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                    currentLevel?.isBreak ? 'text-cyan-400' : 'text-yellow-400'
                  }`}>
                    {currentLevel?.isBreak ? 'DESCANSO' : `NIVEL ${tournament.currentLevelIndex + 1}`}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {currentLevel?.isBreak ? 
                      `${currentLevel.duration} minutos` :
                      `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                    }
                    {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                      <div className="text-lg text-gray-300 mt-1">Ante: {currentLevel.ante}</div>
                    )}
                  </div>
                </div>

                {/* Next Level Preview */}
                {nextLevelData && !currentLevel?.isBreak && (
                  <div className="pt-3 border-t border-gray-700/50">
                    <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                      Siguiente Nivel
                    </div>
                    <div className="text-sm font-bold text-gray-300">
                      {nextLevelData.isBreak ? 
                        `Descanso ${nextLevelData.duration}min` :
                        `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                      }
                      {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                        <span className="text-xs text-gray-400 ml-2">({nextLevelData.ante})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prize Info */}
          <div className="mb-4">
            <MobilePrizeInfo />
          </div>

          {/* Action History (if available) */}
          {actionHistory.length > 0 && (
            <div className="mb-4">
              <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
                <div className="text-yellow-400 text-sm font-semibold mb-3 text-center">
                  Historial de Acciones
                </div>
                <div className="text-center text-xs text-gray-300">
                  {actionHistory.length} acción(es) disponible(s) para deshacer
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Controls */}
      <MobileFloatingControls
        isRunning={tournament.isRunning}
        isPaused={tournament.isPaused}
        isOnBreak={tournament.isOnBreak}
        isFullscreen={mobileOpt.isFullscreen}
        playersCount={tournament.players}
        canUndo={actionHistory.length > 0}
        onToggleTimer={toggleTimer}
        onNextLevel={nextLevel}
        onResetLevel={resetLevel}
        onAddPlayer={addPlayer}
        onEliminatePlayer={eliminatePlayer}
        onAddReentry={addReentry}
        onSkipBreak={skipBreak}
        onUndoLastAction={undoLastAction}
        onToggleFullscreen={mobileOpt.toggleFullscreen}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
}
