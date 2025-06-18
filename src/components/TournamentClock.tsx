import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Settings, Users, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentStats } from '@/components/TournamentStats';
import { TournamentSettings } from '@/components/TournamentSettings';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
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
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentLevel ? 
    ((currentLevel.duration * 60 - tournament.timeRemaining) / (currentLevel.duration * 60)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{tournament.structure.name}</h1>
          <div className="flex gap-2">
            {/* Connection status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Online' : 'Offline'}
            </div>
            
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              {tournament.players} Jugadores
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Circular Timer */}
                  <div className="relative mx-auto w-80 h-80">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-slate-600"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={283}
                        strokeDashoffset={283 - (283 * progress) / 100}
                        className={`${lastMinuteAlert ? 'text-red-500' : 'text-blue-500'} transition-colors duration-500`}
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={tournament.timeRemaining}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-6xl font-mono font-bold ${lastMinuteAlert ? 'text-red-500' : ''}`}
                      >
                        {formatTime(tournament.timeRemaining)}
                      </motion.div>
                      
                      {tournament.isOnBreak && (
                        <div className="text-lg text-blue-400 font-semibold mt-2">
                          DESCANSO
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level Info */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-400 mb-1">
                        {currentLevel?.isBreak ? 'Descanso' : `Nivel ${tournament.currentLevelIndex + 1}`}
                      </div>
                      <div className="text-3xl font-bold">
                        {currentLevel?.isBreak ? 
                          `${currentLevel.duration} minutos` :
                          `${currentLevel?.smallBlind} / ${currentLevel?.bigBlind}`
                        }
                        {!currentLevel?.isBreak && currentLevel?.ante > 0 && (
                          <span className="text-lg text-slate-400 ml-2">
                            (Ante: {currentLevel.ante})
                          </span>
                        )}
                      </div>
                    </div>

                    {nextLevelData && (
                      <div className="text-center text-slate-400">
                        <div className="text-sm mb-1">Siguiente Nivel</div>
                        <div className="text-lg">
                          {nextLevelData.isBreak ? 
                            `Descanso ${nextLevelData.duration}min` :
                            `${nextLevelData.smallBlind} / ${nextLevelData.bigBlind}`
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={toggleTimer}
                      size="lg"
                      className={tournament.isRunning && !tournament.isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {tournament.isRunning && !tournament.isPaused ? (
                        <><Pause className="w-5 h-5 mr-2" />Pausar</>
                      ) : (
                        <><Play className="w-5 h-5 mr-2" />Iniciar</>
                      )}
                    </Button>
                    <Button onClick={nextLevel} variant="outline" size="lg">
                      <SkipForward className="w-5 h-5 mr-2" />
                      Siguiente
                    </Button>
                    <Button onClick={resetLevel} variant="outline" size="lg">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Hotkeys */}
                  <div className="text-xs text-slate-500 space-x-4">
                    <span>ESPACIO: Play/Pause</span>
                    <span>N: Siguiente</span>
                    <span>R: Reset</span>
                    <span>S: Configuración</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <TournamentStats tournament={tournament} />
          </div>
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
