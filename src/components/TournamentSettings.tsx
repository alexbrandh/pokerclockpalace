import React, { useState } from 'react';
import { X, Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundSettings } from '@/components/SoundSettings';
import { useSoundSystem } from '@/hooks/useSoundSystem';

interface TournamentSettingsProps {
  tournament: any;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}

export function TournamentSettings({ tournament, onClose, onUpdate }: TournamentSettingsProps) {
  const { soundSettings, updateSoundSettings, playSound } = useSoundSystem();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Torneo
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="sounds">
                <Volume2 className="w-4 h-4 mr-2" />
                Sonidos
              </TabsTrigger>
              <TabsTrigger value="display">Pantalla</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="general" className="space-y-6">
                <div className="text-center text-gray-400">
                  <p>Configuraciones generales del torneo</p>
                  <p className="text-sm mt-2">Próximamente: edición de estructura, jugadores, premios</p>
                </div>
              </TabsContent>

              <TabsContent value="sounds">
                <SoundSettings
                  soundSettings={soundSettings}
                  onUpdateSettings={updateSoundSettings}
                  onPlaySound={playSound}
                />
              </TabsContent>

              <TabsContent value="display" className="space-y-6">
                <div className="text-center text-gray-400">
                  <p>Configuraciones de visualización</p>
                  <p className="text-sm mt-2">Próximamente: temas, colores, layout personalizado</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}
