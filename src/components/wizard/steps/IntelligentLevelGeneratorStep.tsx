import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Clock, Target, TrendingUp, Coffee, BarChart3 } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';
import { EnhancedLevelEditor } from '@/components/level-editor/EnhancedLevelEditor';

interface IntelligentLevelGeneratorStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function IntelligentLevelGeneratorStep({ data, onUpdate }: IntelligentLevelGeneratorStepProps) {
  const [generatorConfig, setGeneratorConfig] = useState({
    template: 'standard',
    duration_hours: 4,
    level_duration: 20,
    break_frequency: 4,
    break_duration: 15,
    starting_sb: data.starting_blinds_sb || 25,
    starting_bb: data.starting_blinds_bb || 50,
    antes_start: 6
  });

  const handleLevelsChange = (levels: TournamentLevel[]) => {
    onUpdate({ levels });
  };

  const generateLevels = () => {
    const levels: TournamentLevel[] = [];
    
    const totalMinutes = generatorConfig.duration_hours * 60;
    const totalGameTime = totalMinutes - (Math.floor(totalMinutes / (generatorConfig.level_duration * generatorConfig.break_frequency)) * generatorConfig.break_duration);
    const estimatedLevels = Math.floor(totalGameTime / generatorConfig.level_duration);

    // Generate realistic blind progression used in real tournaments
    const baseProgression = [
      { sb: 25, bb: 50 },
      { sb: 50, bb: 100 },
      { sb: 75, bb: 150 },
      { sb: 100, bb: 200 },
      { sb: 150, bb: 300 },
      { sb: 200, bb: 400 },
      { sb: 300, bb: 600 },
      { sb: 500, bb: 1000 },
      { sb: 750, bb: 1500 },
      { sb: 1000, bb: 2000 },
      { sb: 1500, bb: 3000 },
      { sb: 2000, bb: 4000 },
      { sb: 3000, bb: 6000 },
      { sb: 5000, bb: 10000 },
      { sb: 7500, bb: 15000 },
      { sb: 10000, bb: 20000 },
      { sb: 15000, bb: 30000 },
      { sb: 25000, bb: 50000 },
      { sb: 40000, bb: 80000 },
      { sb: 60000, bb: 120000 },
    ];

    // Start from configured starting blinds or find closest match
    let startIndex = baseProgression.findIndex(p => p.bb >= generatorConfig.starting_bb);
    if (startIndex === -1) startIndex = 0;
    
    const blindProgression = baseProgression.slice(startIndex);
    
    for (let i = 0; i < Math.min(estimatedLevels, blindProgression.length); i++) {
      const blinds = blindProgression[i];
      
      // Add regular level
      levels.push({
        id: (i + 1).toString(),
        smallBlind: blinds.sb,
        bigBlind: blinds.bb,
        ante: blinds.bb, // Ante always equals big blind from level 1
        duration: generatorConfig.level_duration,
        isBreak: false
      });

      // Add break every X levels
      if ((i + 1) % generatorConfig.break_frequency === 0 && i < blindProgression.length - 1) {
        levels.push({
          id: `break${Math.floor((i + 1) / generatorConfig.break_frequency)}`,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: generatorConfig.break_duration,
          isBreak: true,
          breakDuration: generatorConfig.break_duration
        });
      }
    }

    onUpdate({ levels });
  };

  const applyTemplate = (template: string) => {
    const templates = {
      turbo: {
        level_duration: 15,
        break_frequency: 3,
        break_duration: 10,
        duration_hours: 3
      },
      standard: {
        level_duration: 20,
        break_frequency: 4,
        break_duration: 15,
        duration_hours: 4
      },
      deep: {
        level_duration: 30,
        break_frequency: 5,
        break_duration: 20,
        duration_hours: 6
      }
    };

    const config = templates[template as keyof typeof templates];
    setGeneratorConfig(prev => ({
      ...prev,
      template,
      ...config
    }));
  };

  const totalTime = data.levels?.reduce((total: number, level: any) => total + level.duration, 0) || 0;
  const gameTime = data.levels?.filter((l: any) => !l.isBreak).reduce((total: number, level: any) => total + level.duration, 0) || 0;
  const breakTime = totalTime - gameTime;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generador Inteligente de Niveles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Templates */}
          <div>
            <Label className="text-base font-semibold">Plantillas Predefinidas</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {[
                { key: 'turbo', name: 'Turbo', desc: 'Rápido y agresivo', icon: '⚡' },
                { key: 'standard', name: 'Estándar', desc: 'Equilibrado', icon: '⚖️' },
                { key: 'deep', name: 'Deep Stack', desc: 'Lento y estratégico', icon: '🏗️' }
              ].map(template => (
                <Button
                  key={template.key}
                  variant={generatorConfig.template === template.key ? 'default' : 'outline'}
                  onClick={() => applyTemplate(template.key)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div className="text-center">
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-xs opacity-70">{template.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="duration_hours">Duración (horas)</Label>
              <Input
                id="duration_hours"
                type="number"
                value={generatorConfig.duration_hours}
                onChange={(e) => setGeneratorConfig(prev => ({ ...prev, duration_hours: +e.target.value }))}
                min="2"
                max="12"
                step="0.5"
              />
            </div>
            <div>
              <Label htmlFor="level_duration">Nivel (min)</Label>
              <Input
                id="level_duration"
                type="number"
                value={generatorConfig.level_duration}
                onChange={(e) => setGeneratorConfig(prev => ({ ...prev, level_duration: +e.target.value }))}
                min="10"
                max="60"
              />
            </div>
            <div>
              <Label htmlFor="break_frequency">Break cada X niveles</Label>
              <Input
                id="break_frequency"
                type="number"
                value={generatorConfig.break_frequency}
                onChange={(e) => setGeneratorConfig(prev => ({ ...prev, break_frequency: +e.target.value }))}
                min="3"
                max="8"
              />
            </div>
            <div>
              <Label htmlFor="break_duration">Duración Breaks (min)</Label>
              <Input
                id="break_duration"
                type="number"
                value={generatorConfig.break_duration}
                onChange={(e) => setGeneratorConfig(prev => ({ ...prev, break_duration: +e.target.value }))}
                min="5"
                max="30"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Configuración de Antes:</strong> Los antes siempre serán iguales al big blind 
              y estarán activos desde el nivel 1 en todos los torneos.
            </p>
          </div>

          <Button onClick={generateLevels} className="w-full" size="lg">
            <Wand2 className="w-4 h-4 mr-2" />
            Generar Estructura Automáticamente
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      {data.levels && data.levels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas de la Estructura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.levels.length}</div>
                <div className="text-muted-foreground">Niveles Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.floor(totalTime / 60)}h {totalTime % 60}m</div>
                <div className="text-muted-foreground">Duración Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.floor(gameTime / 60)}h {gameTime % 60}m</div>
                <div className="text-muted-foreground">Tiempo Juego</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{breakTime}m</div>
                <div className="text-muted-foreground">Descansos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.levels.filter((l: any) => !l.isBreak).length > 0 ? 
                    Math.round((data.starting_chips || 10000) / data.levels.filter((l: any) => !l.isBreak)[Math.floor(data.levels.filter((l: any) => !l.isBreak).length / 2)].bigBlind) : 
                    0
                  }
                </div>
                <div className="text-muted-foreground">BB Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Editor de Niveles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLevelEditor 
            levels={data.levels || []} 
            onLevelsChange={handleLevelsChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}