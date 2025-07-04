
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

  // Fullscreen Landscape Layout - Desktop-like but mobile optimized
  if (mobileOpt.isFullscreen && mobileOpt.orientation === 'landscape') {
    return (
      <div className="h-screen flex bg-black text-white relative overflow-hidden">
        {/* Left Side - Timer (60% width) */}
        <div className="flex-[3] flex flex-col items-center justify-center p-4">
          <div className="scale-75 sm:scale-90">
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
          
          {/* Tournament Title Below Timer */}
          <div className="mt-4 text-center">
            <h1 className="text-lg font-bold text-white">
              {tournament.structure.name}
            </h1>
          </div>
        </div>

        {/* Right Side - Info Panel (40% width) */}
        <div className="flex-[2] p-4 overflow-y-auto bg-gray-900/30 backdrop-blur">
          <div className="space-y-4 max-w-sm">
            {/* Current Level Info */}
            <div className="bg-gray-900/70 backdrop-blur rounded-2xl p-4">
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

            {/* Compact Stats */}
            <div className="bg-gray-900/70 backdrop-blur rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Jugadores</div>
                  <div className="text-lg font-bold text-white">{tournament.players}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Nivel</div>
                  <div className="text-lg font-bold text-white">{tournament.currentLevelIndex + 1}</div>
                </div>
              </div>
            </div>

            {/* Prize Info - Compact */}
            <div className="bg-gray-900/70 backdrop-blur rounded-2xl p-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Premio Total</div>
                <div className="text-lg font-bold text-green-400">$25,000</div>
              </div>
            </div>

            {/* Action History */}
            {actionHistory.length > 0 && (
              <div className="bg-gray-900/70 backdrop-blur rounded-2xl p-4">
                <div className="text-center">
                  <div className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Historial</div>
                  <div className="text-sm text-gray-300">{actionHistory.length} acción(es)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Controls */}
        <MobileFloatingControls
          isRunning={tournament.isRunning}
          isPaused={tournament.isPaused}
          isOnBreak={tournament.isOnBreak}
          isFullscreen={mobileOpt.isFullscreen}
          playersCount={tournament.players}
          canUndo={actionHistory.length > 0}
          fullscreenSupported={mobileOpt.fullscreenSupported}
          debugInfo={mobileOpt.debugInfo}
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
        fullscreenSupported={mobileOpt.fullscreenSupported}
        debugInfo={mobileOpt.debugInfo}
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
