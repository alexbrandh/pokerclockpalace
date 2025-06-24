
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Coffee, Clock, Wand2 } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';

interface BlindStructureStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BlindStructureStep({ data, onUpdate }: BlindStructureStepProps) {
  const levels = data.levels || [];

  const addLevel = () => {
    const lastLevel = levels[levels.length - 1];
    const newLevel: TournamentLevel = {
      id: Date.now().toString(),
      smallBlind: lastLevel?.smallBlind * 1.5 || 50,
      bigBlind: lastLevel?.bigBlind * 1.5 || 100,
      ante: 0,
      duration: 20,
      isBreak: false
    };
    
    onUpdate({ levels: [...levels, newLevel] });
  };

  const addBreak = () => {
    const newBreak: TournamentLevel = {
      id: Date.now().toString(),
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15,
      isBreak: true,
      breakDuration: 15
    };
    
    onUpdate({ levels: [...levels, newBreak] });
  };

  const removeLevel = (index: number) => {
    const updatedLevels = levels.filter((_: any, i: number) => i !== index);
    onUpdate({ levels: updatedLevels });
  };

  const updateLevel = (index: number, updates: Partial<TournamentLevel>) => {
    const updatedLevels = levels.map((level: TournamentLevel, i: number) => 
      i === index ? { ...level, ...updates } : level
    );
    onUpdate({ levels: updatedLevels });
  };

  const generateAutoStructure = () => {
    const autoLevels: TournamentLevel[] = [];
    let sb = 25;
    let bb = 50;
    
    for (let i = 1; i <= 12; i++) {
      autoLevels.push({
        id: i.toString(),
        smallBlind: sb,
        bigBlind: bb,
        ante: i > 6 ? Math.floor(bb * 0.1) : 0,
        duration: 20,
        isBreak: false
      });
      
      // Add break every 3 levels
      if (i % 3 === 0 && i < 12) {
        autoLevels.push({
          id: `break${i/3}`,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true,
          breakDuration: 15
        });
      }
      
      // Progressive increase
      const multiplier = i <= 6 ? 1.5 : 2;
      sb = Math.floor(sb * multiplier);
      bb = Math.floor(bb * multiplier);
    }
    
    onUpdate({ levels: autoLevels });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Estructura de Blinds
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateAutoStructure} size="sm">
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-generar
              </Button>
              <Button variant="outline" onClick={addLevel} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nivel
              </Button>
              <Button variant="outline" onClick={addBreak} size="sm">
                <Coffee className="w-4 h-4 mr-2" />
                Break
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {levels.map((level: TournamentLevel, index: number) => (
              <div key={level.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                <span className="w-8 text-sm font-medium">{index + 1}</span>
                
                {level.isBreak ? (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">DESCANSO</span>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        value={level.duration}
                        onChange={(e) => updateLevel(index, { duration: +e.target.value })}
                        placeholder="Min"
                        className="text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20">
                      <Label className="text-xs text-gray-500">SB</Label>
                      <Input
                        type="number"
                        value={level.smallBlind}
                        onChange={(e) => updateLevel(index, { smallBlind: +e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-xs text-gray-500">BB</Label>
                      <Input
                        type="number"
                        value={level.bigBlind}
                        onChange={(e) => updateLevel(index, { bigBlind: +e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-xs text-gray-500">Ante</Label>
                      <Input
                        type="number"
                        value={level.ante}
                        onChange={(e) => updateLevel(index, { ante: +e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-xs text-gray-500">Min</Label>
                      <Input
                        type="number"
                        value={level.duration}
                        onChange={(e) => updateLevel(index, { duration: +e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLevel(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {levels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay niveles configurados</p>
              <p className="text-sm">Usa los botones de arriba para agregar niveles o generar automáticamente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
