import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { EnhancedLevelEditor } from '@/components/level-editor/EnhancedLevelEditor';

interface BlindStructureAdvancedStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BlindStructureAdvancedStep({ data, onUpdate }: BlindStructureAdvancedStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleLevelsChange = (levels: any[]) => {
    onUpdate({ levels });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Configuración de Ciegas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="blind_structure_type">Tipo de Estructura</Label>
            <select
              id="blind_structure_type"
              value={data.blind_structure_type || 'standard'}
              onChange={(e) => handleChange('blind_structure_type', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="standard">Estándar (Duplica cada 10 niveles)</option>
              <option value="turbo">Turbo (Aumenta rápidamente)</option>
              <option value="deep">Deep Stack (Aumenta lentamente)</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starting_blinds_sb">Ciega Pequeña Inicial</Label>
              <Input
                id="starting_blinds_sb"
                type="number"
                value={data.starting_blinds_sb || 25}
                onChange={(e) => handleChange('starting_blinds_sb', +e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="starting_blinds_bb">Ciega Grande Inicial</Label>
              <Input
                id="starting_blinds_bb"
                type="number"
                value={data.starting_blinds_bb || 50}
                onChange={(e) => handleChange('starting_blinds_bb', +e.target.value)}
                min="2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="antes_start_level">Antes desde el Nivel</Label>
            <Input
              id="antes_start_level"
              type="number"
              value={data.antes_start_level || 5}
              onChange={(e) => handleChange('antes_start_level', +e.target.value)}
              min="1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Los antes comenzarán a partir de este nivel
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Duración de Niveles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="level_duration_type">Tipo de Duración</Label>
            <select
              id="level_duration_type"
              value={data.level_duration_type || 'fixed'}
              onChange={(e) => handleChange('level_duration_type', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="fixed">Duración Fija</option>
              <option value="variable">Duración Variable</option>
              <option value="custom">Personalizada por Nivel</option>
            </select>
          </div>

          {data.level_duration_type === 'fixed' && (
            <div>
              <Label htmlFor="default_level_duration">Duración por Nivel (minutos)</Label>
              <Input
                id="default_level_duration"
                type="number"
                value={data.default_level_duration || 20}
                onChange={(e) => handleChange('default_level_duration', +e.target.value)}
                min="5"
                max="120"
              />
            </div>
          )}

          {data.level_duration_type === 'variable' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="early_levels_duration">Primeros Niveles (min)</Label>
                <Input
                  id="early_levels_duration"
                  type="number"
                  value={data.early_levels_duration || 30}
                  onChange={(e) => handleChange('early_levels_duration', +e.target.value)}
                  min="5"
                />
              </div>
              <div>
                <Label htmlFor="late_levels_duration">Últimos Niveles (min)</Label>
                <Input
                  id="late_levels_duration"
                  type="number"
                  value={data.late_levels_duration || 15}
                  onChange={(e) => handleChange('late_levels_duration', +e.target.value)}
                  min="5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estructura de Niveles Detallada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLevelEditor 
            levels={data.levels || [
              { id: '1', smallBlind: data.starting_blinds_sb || 25, bigBlind: data.starting_blinds_bb || 50, ante: 0, duration: data.default_level_duration || 20, isBreak: false },
              { id: '2', smallBlind: 50, bigBlind: 100, ante: 0, duration: data.default_level_duration || 20, isBreak: false },
              { id: '3', smallBlind: 75, bigBlind: 150, ante: 0, duration: data.default_level_duration || 20, isBreak: false },
              { id: '4', smallBlind: 100, bigBlind: 200, ante: 0, duration: data.default_level_duration || 20, isBreak: false },
              { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
            ]} 
            onLevelsChange={handleLevelsChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}