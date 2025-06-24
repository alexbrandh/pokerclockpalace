
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Volume2, Upload, Play, Trash2, Mic } from 'lucide-react';

interface SoundsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function SoundsStep({ data, onUpdate }: SoundsStepProps) {
  const soundEvents = [
    { id: 'start', name: 'Inicio de Torneo', description: 'Cuando inicia el torneo' },
    { id: 'break', name: 'Inicio de Break', description: 'Cuando comienza un descanso' },
    { id: 'breakEnd', name: 'Fin de Break', description: 'Cuando termina un descanso' },
    { id: 'lastMinute', name: 'Último Minuto', description: 'Cuando queda 1 minuto' },
    { id: 'levelUp', name: 'Subida de Nivel', description: 'Cuando cambia el nivel de blinds' },
    { id: 'warning', name: 'Advertencia', description: 'Alertas generales' }
  ];

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const uploadSound = (eventId: string) => {
    console.log('Upload sound for event:', eventId);
    // Implementar upload de sonido
  };

  const playSound = (eventId: string) => {
    console.log('Play sound for event:', eventId);
    // Implementar reproducción de sonido
  };

  const removeSound = (eventId: string) => {
    const sounds = { ...data.sounds };
    delete sounds[eventId];
    handleChange('sounds', sounds);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Configuración de Sonidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableSounds">Habilitar Sonidos</Label>
              <p className="text-sm text-gray-500">
                Reproducir sonidos durante eventos del torneo
              </p>
            </div>
            <Switch
              id="enableSounds"
              checked={data.enableSounds || false}
              onCheckedChange={(checked) => handleChange('enableSounds', checked)}
            />
          </div>

          {data.enableSounds && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voiceAnnouncements">Anuncios de Voz</Label>
                  <p className="text-sm text-gray-500">
                    Anuncios automáticos de niveles y breaks
                  </p>
                </div>
                <Switch
                  id="voiceAnnouncements"
                  checked={data.voiceAnnouncements || false}
                  onCheckedChange={(checked) => handleChange('voiceAnnouncements', checked)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Sonidos por Evento</Label>
                
                {soundEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-gray-500">{event.description}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => uploadSound(event.id)}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      
                      {data.sounds?.[event.id] && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playSound(event.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSound(event.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.voiceAnnouncements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Configuración de Voz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idioma</Label>
                <select
                  value={data.voiceLanguage || 'es-ES'}
                  onChange={(e) => handleChange('voiceLanguage', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="es-ES">Español</option>
                  <option value="en-US">English</option>
                  <option value="fr-FR">Français</option>
                </select>
              </div>
              <div>
                <Label>Velocidad</Label>
                <select
                  value={data.voiceRate || 'normal'}
                  onChange={(e) => handleChange('voiceRate', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="slow">Lenta</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Rápida</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
