
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoundSettingsProps {
  soundSettings: any;
  onUpdateSettings: (updates: any) => void;
  onPlaySound: (soundType: string) => void;
}

export function SoundSettings({ soundSettings, onUpdateSettings, onPlaySound }: SoundSettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Configuración de Sonidos
        </h3>
      </div>

      {/* Master Volume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Volumen Principal</label>
          <span className="text-xs text-gray-400">{Math.round(soundSettings.masterVolume * 100)}%</span>
        </div>
        <Slider
          value={[soundSettings.masterVolume]}
          onValueChange={([value]) => onUpdateSettings({ masterVolume: value })}
          max={1}
          min={0}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Sound Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={soundSettings.levelChangeSound}
              onCheckedChange={(checked) => onUpdateSettings({ levelChangeSound: checked })}
            />
            <label className="text-sm text-gray-300">Cambio de Nivel</label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPlaySound('levelChange')}
            className="h-8 w-8 p-0"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={soundSettings.breakSound}
              onCheckedChange={(checked) => onUpdateSettings({ breakSound: checked })}
            />
            <label className="text-sm text-gray-300">Inicio de Descanso</label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPlaySound('breakStart')}
            className="h-8 w-8 p-0"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={soundSettings.lastMinuteSound}
              onCheckedChange={(checked) => onUpdateSettings({ lastMinuteSound: checked })}
            />
            <label className="text-sm text-gray-300">Último Minuto</label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPlaySound('lastMinute')}
            className="h-8 w-8 p-0"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={soundSettings.buttonClickSound}
              onCheckedChange={(checked) => onUpdateSettings({ buttonClickSound: checked })}
            />
            <label className="text-sm text-gray-300">Clic de Botones</label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPlaySound('buttonClick')}
            className="h-8 w-8 p-0"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Mute All */}
      <div className="pt-4 border-t border-gray-700">
        <Button
          variant="outline"
          onClick={() => onUpdateSettings({ 
            levelChangeSound: false, 
            breakSound: false, 
            lastMinuteSound: false, 
            buttonClickSound: false 
          })}
          className="w-full flex items-center gap-2"
        >
          <VolumeX className="w-4 h-4" />
          Silenciar Todo
        </Button>
      </div>
    </motion.div>
  );
}
