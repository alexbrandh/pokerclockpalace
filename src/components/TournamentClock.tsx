import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentSettings } from '@/components/TournamentSettings';
import { CircularTimer } from '@/components/CircularTimer';
import { PlayerInfo } from '@/components/PlayerInfo';
import { PrizeInfo } from '@/components/PrizeInfo';
import { LevelInfo } from '@/components/LevelInfo';
import { ClockControls } from '@/components/ClockControls';

export function TournamentClock() {
  const { tournament, updateTournament, isConnected, error } = useTournament();
  const [showSettings, setShowSettings] = useState(false);
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!tournament || !tournament.isRunning || tournament.isPaused) return;

    const interval = setInterval(() => {
      const newTime = tournament.timeRemaining - 1;
      
      if (newTime <= 0) {
        // Level completed, advance to next
        const nextLevelIndex = tournament.currentLevelIndex + 1;
        const nextLevelData = tournament.structure.levels[nextLevelIndex];
        
        if (nextLevelData) {
          updateTournament({
            currentLevelIndex: nextLevelIndex,
            timeRemaining: nextLevelData.duration * 60,
            isOnBreak: nextLevelData.isBreak,
            isPaused: nextLevelData.isBreak // Auto-pause on breaks
          });
        } else {
          // Tournament ended
          updateTournament({
            isRunning: false,
            isPaused: true
          });
        }
        setLastMinuteAlert(false);
      } else {
        updateTournament({ timeRemaining: newTime });
        
        // Last minute alert
        if (newTime === 60 && !lastMinuteAlert) {
          setLastMinuteAlert(true);
          // Play alert sound
          const audio = new Audio('/alert.mp3');
          audio.play().catch(() => {}); // Fail silently if no audio file
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament, updateTournament, lastMinuteAlert]);

  // Hotkeys
  useHotkeys('space', () => toggleTimer(), { preventDefault: true });
  useHotkeys('n', () => nextLevel(), { preventDefault: true });
  useHotkeys('r', () => resetLevel(), { preventDefault: true });
  useHotkeys('s', () => setShowSettings(!showSettings), { preventDefault: true });

  const toggleTimer = () => {
    if (!tournament) return;
    
    if (tournament.isPaused) {
      // Start the timer
      updateTournament({
        isRunning: true,
        isPaused: false
      });
    } else {
      // Pause the timer
      updateTournament({
        isPaused: true
      });
    }
  };

  const nextLevel = () => {
    if (!tournament) return;
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: nextLevelData.isBreak
      });
    }
  };

  const resetLevel = () => {
    if (!tournament) return;
    const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
    updateTournament({
      timeRemaining: currentLevel.duration * 60
    });
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">Configurando torneo...</div>
          {error && (
            <div className="text-yellow-400 flex items-center justify-center gap-2">
              <WifiOff className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  const nextLevelData = tournament.structure.levels[tournament.currentLevelIndex + 1];
  
  const progress = currentLevel ? 
    ((currentLevel.duration * 60 - tournament.timeRemaining) / (currentLevel.duration * 60)) * 100 : 0;

  // Calculate next break time (simplified for demo)
  const nextBreakTime = "35:09";

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">{tournament.structure.name}</h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left Side Info - Players */}
          <div className="col-span-3">
            <PlayerInfo 
              players={tournament.players}
              entries={tournament.entries}
              reentries={tournament.reentries}
              currentPrizePool={tournament.currentPrizePool}
            />
          </div>

          {/* Center - Clock */}
          <div className="col-span-6 flex flex-col items-center">
            <CircularTimer
              timeRemaining={tournament.timeRemaining}
              currentLevel={currentLevel}
              progress={progress}
              lastMinuteAlert={lastMinuteAlert}
              nextBreakTime={nextBreakTime}
              currentLevelIndex={tournament.currentLevelIndex}
            />
            <ClockControls
              isRunning={tournament.isRunning}
              isPaused={tournament.isPaused}
              onToggleTimer={toggleTimer}
              onNextLevel={nextLevel}
              onResetLevel={resetLevel}
            />
          </div>

          {/* Right Side Info - Level, Prizes, Next Level */}
          <div className="col-span-3 space-y-6">
            {/* Current Level */}
            <LevelInfo
              currentLevel={currentLevel}
              nextLevelData={null}
              currentLevelIndex={tournament.currentLevelIndex}
              showNextLevel={false}
            />
            
            {/* Enhanced Golden separator line */}
            <div className="relative flex items-center justify-center py-3">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
              <div className="relative bg-black px-4">
                <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
              </div>
            </div>
            
            {/* Prizes */}
            <PrizeInfo />
            
            {/* Enhanced Golden separator line */}
            <div className="relative flex items-center justify-center py-3">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
              <div className="relative bg-black px-4">
                <div className="h-1 w-16 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-lg shadow-yellow-400/30"></div>
              </div>
            </div>
            
            {/* Next Level */}
            {nextLevelData && (
              <div>
                <div className="text-yellow-400 text-lg font-semibold mb-2">Next Level</div>
                <div className="text-2xl font-bold">
                  {nextLevelData.isBreak ? 
                    `Descanso ${nextLevelData.duration}min` :
                    `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                  }
                  {!nextLevelData.isBreak && nextLevelData.ante > 0 && (
                    <div className="text-xl text-gray-300">({nextLevelData.ante})</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="text-sm text-gray-400">
            Entry until the end of LVL 8 -- Day 1 will end at completion of LVL 8 (approx 21:50)
          </div>
        </div>

        {/* Connection status and settings */}
        <div className="fixed top-4 right-4 flex gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? 'Online' : 'Offline'}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Hotkeys info */}
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 space-x-4">
          <span>ESPACIO: Play/Pause</span>
          <span>N: Siguiente</span>
          <span>R: Reset</span>
          <span>S: Configuración</span>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <TournamentSettings 
            tournament={tournament}
            onClose={() => setShowSettings(false)}
            onUpdate={updateTournament}
          />
        )}
      </AnimatePresence>

      {/* Last Minute Alert */}
      <AnimatePresence>
        {lastMinuteAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="font-bold">¡ÚLTIMO MINUTO!</div>
            <div className="text-sm">El nivel termina en menos de 1 minuto</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
