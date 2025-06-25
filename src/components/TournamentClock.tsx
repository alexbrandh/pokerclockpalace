
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { TournamentSettings } from '@/components/TournamentSettings';
import { useSupabaseTournamentLogic } from '@/components/tournament-clock/useSupabaseTournamentLogic';
import { DesktopTournamentClock } from '@/components/tournament-clock/DesktopTournamentClock';
import { MobileTournamentClock } from '@/components/tournament-clock/MobileTournamentClock';
import { ConnectionStatus, LastMinuteAlert, LoadingScreen } from '@/components/tournament-clock/SharedComponents';

export function TournamentClock() {
  const mobileOpt = useMobileOptimization();
  const {
    tournament,
    isConnected,
    connectionStatus,
    reconnect,
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
  } = useSupabaseTournamentLogic();
  
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
          addReentry={addReentry}
          undoLastAction={undoLastAction}
          setShowSettings={setShowSettings}
        />
      )}

      {/* Enhanced Connection Status with reconnect option */}
      <ConnectionStatus 
        isConnected={isConnected} 
        connectionStatus={connectionStatus}
        onReconnect={reconnect}
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
              console.log('Tournament updates:', updates);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
