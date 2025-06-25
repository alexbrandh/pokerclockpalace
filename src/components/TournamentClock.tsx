
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { TournamentSettings } from '@/components/TournamentSettings';
import { useTournamentLogic } from '@/components/tournament-clock/useTournamentLogic';
import { DesktopTournamentClock } from '@/components/tournament-clock/DesktopTournamentClock';
import { MobileTournamentClock } from '@/components/tournament-clock/MobileTournamentClock';
import { ConnectionStatus, LastMinuteAlert, LoadingScreen } from '@/components/tournament-clock/SharedComponents';

export function TournamentClock() {
  const mobileOpt = useMobileOptimization();
  const {
    tournament,
    isConnected,
    error,
    lastMinuteAlert,
    actionHistory,
    toggleTimer,
    nextLevel,
    skipBreak,
    resetLevel,
    addPlayer,
    eliminatePlayer,
    addReentry,
    undoLastAction
  } = useTournamentLogic();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);

  // Show/hide controls popup based on pause state or break
  useEffect(() => {
    if (tournament?.isPaused || tournament?.isOnBreak) {
      setShowFloatingControls(true);
    } else {
      setShowFloatingControls(false);
    }
  }, [tournament?.isPaused, tournament?.isOnBreak]);

  if (!tournament) {
    return <LoadingScreen error={error} />;
  }

  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  const nextLevelData = tournament.structure.levels[tournament.currentLevelIndex + 1];
  
  const progress = currentLevel ? 
    ((currentLevel.duration * 60 - tournament.timeRemaining) / (currentLevel.duration * 60)) * 100 : 0;

  const nextBreakTime = "35:09";

  return (
    <div className={`min-h-screen h-screen bg-black text-white overflow-hidden ${
      mobileOpt.isMobile && mobileOpt.isFullscreen ? 'select-none' : ''
    }`}>
      
      {/* Render appropriate layout based on device */}
      {mobileOpt.isMobile ? (
        <MobileTournamentClock
          tournament={tournament}
          currentLevel={currentLevel}
          nextLevelData={nextLevelData}
          progress={progress}
          lastMinuteAlert={lastMinuteAlert}
          nextBreakTime={nextBreakTime}
          actionHistory={actionHistory}
          toggleTimer={toggleTimer}
          nextLevel={nextLevel}
          resetLevel={resetLevel}
          addPlayer={addPlayer}
          eliminatePlayer={eliminatePlayer}
          addReentry={addReentry}
          skipBreak={skipBreak}
          undoLastAction={undoLastAction}
          setShowSettings={setShowSettings}
        />
      ) : (
        <DesktopTournamentClock
          tournament={tournament}
          currentLevel={currentLevel}
          nextLevelData={nextLevelData}
          progress={progress}
          lastMinuteAlert={lastMinuteAlert}
          nextBreakTime={nextBreakTime}
          actionHistory={actionHistory}
          showFloatingControls={showFloatingControls}
          setShowFloatingControls={setShowFloatingControls}
          toggleTimer={toggleTimer}
          nextLevel={nextLevel}
          skipBreak={skipBreak}
          resetLevel={resetLevel}
          addPlayer={addPlayer}
          eliminatePlayer={eliminatePlayer}
          undoLastAction={undoLastAction}
          setShowSettings={setShowSettings}
        />
      )}

      {/* Shared Components */}
      <ConnectionStatus 
        isConnected={isConnected} 
        onSettingsClick={() => setShowSettings(true)} 
      />

      <LastMinuteAlert isVisible={lastMinuteAlert} />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <TournamentSettings 
            tournament={tournament}
            onClose={() => setShowSettings(false)}
            onUpdate={(updates) => {
              // Handle tournament updates through the context
              if (tournament) {
                // This would need to be connected to the tournament context
                console.log('Tournament updates:', updates);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
