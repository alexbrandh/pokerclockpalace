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
    let sb = generatorConfig.starting_sb;
    let bb = generatorConfig.starting_bb;
    
    const totalMinutes = generatorConfig.duration_hours * 60;
    const totalGameTime = totalMinutes - (Math.floor(totalMinutes / (generatorConfig.level_duration * generatorConfig.break_frequency)) * generatorConfig.break_duration);
    const estimatedLevels = Math.floor(totalGameTime / generatorConfig.level_duration);

    const multipliers = {
      'turbo': [1.5, 2, 2, 2.5, 2.5, 3],
      'standard': [1.5, 1.5, 2, 2, 2.5, 2.5],
      'deep': [1.25, 1.5, 1.5, 2, 2, 2]
    };

    const selectedMultipliers = multipliers[generatorConfig.template as keyof typeof multipliers] || multipliers.standard;
    
    for (let i = 1; i <= estimatedLevels && i <= 20; i++) {
      // Add regular level
      levels.push({
        id: i.toString(),
        smallBlind: sb,
        bigBlind: bb,
        ante: i >= generatorConfig.antes_start ? Math.floor(bb * 0.1) : 0,
        duration: generatorConfig.level_duration,
        isBreak: false
      });

      // Add break every X levels
      if (i % generatorConfig.break_frequency === 0 && i < estimatedLevels) {
        levels.push({
          id: `break${Math.floor(i / generatorConfig.break_frequency)}`,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: generatorConfig.break_duration,
          isBreak: true,
          breakDuration: generatorConfig.break_duration
        });
      }

      // Calculate next blinds
      const multiplierIndex = Math.min(Math.floor(i / 3), selectedMultipliers.length - 1);
      const multiplier = selectedMultipliers[multiplierIndex];
      
      sb = Math.floor(sb * multiplier);
      bb = Math.floor(bb * multiplier);

      // Round to nice numbers
      if (bb >= 100) {
        bb = Math.round(bb / 25) * 25;
        sb = Math.round(bb / 2 / 25) * 25;
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
              <Label htmlFor="antes_start">Antes desde nivel</Label>
              <Input
                id="antes_start"
                type="number"
                value={generatorConfig.antes_start}
                onChange={(e) => setGeneratorConfig(prev => ({ ...prev, antes_start: +e.target.value }))}
                min="1"
                max="15"
              />
            </div>
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