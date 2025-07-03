import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Plus, Minus, Target } from 'lucide-react';

interface PayoutStructureStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PayoutStructureStep({ data, onUpdate }: PayoutStructureStepProps) {
  const [customPayouts, setCustomPayouts] = useState(data.payoutStructure || [50, 30, 20]);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const updatePayoutStructure = (newPayouts: number[]) => {
    setCustomPayouts(newPayouts);
    handleChange('payoutStructure', newPayouts);
  };

  const addPayoutPosition = () => {
    const newPayouts = [...customPayouts, 5];
    updatePayoutStructure(newPayouts);
  };

  const removePayoutPosition = (index: number) => {
    const newPayouts = customPayouts.filter((_, i) => i !== index);
    updatePayoutStructure(newPayouts);
  };

  const updatePayoutPercentage = (index: number, percentage: number) => {
    const newPayouts = [...customPayouts];
    newPayouts[index] = percentage;
    updatePayoutStructure(newPayouts);
  };

  const totalPercentage = customPayouts.reduce((sum, pct) => sum + pct, 0);

  const presetPayouts = {
    'single': [100],
    'top2': [70, 30],
    'top3': [50, 30, 20],
    'top4': [40, 25, 20, 15],
    'top5': [35, 25, 20, 12, 8],
    'top6': [30, 22, 18, 15, 10, 5],
    'top9': [25, 18, 15, 12, 10, 8, 6, 4, 2],
    'top10': [22, 16, 13, 11, 9, 7, 6, 5, 3, 3],
  };

  const applyPreset = (preset: number[]) => {
    updatePayoutStructure(preset);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Estructura de Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tournament_type">Tipo de Torneo</Label>
            <select
              id="tournament_type"
              value={data.tournament_type || 'regular'}
              onChange={(e) => handleChange('tournament_type', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="regular">Torneo Regular</option>
              <option value="satellite">Satélite</option>
              <option value="qualifier">Qualifier</option>
              <option value="winner_take_all">Winner Take All</option>
            </select>
          </div>

          {data.tournament_type === 'satellite' && (
            <div>
              <Label htmlFor="satellite_target">Torneo Objetivo del Satélite</Label>
              <Input
                id="satellite_target"
                value={data.satellite_target || ''}
                onChange={(e) => handleChange('satellite_target', e.target.value)}
                placeholder="Ej: Main Event WSOP"
              />
            </div>
          )}

          {data.tournament_type === 'qualifier' && (
            <div>
              <Label htmlFor="qualifier_seats">Número de Asientos a Otorgar</Label>
              <Input
                id="qualifier_seats"
                type="number"
                value={data.qualifier_seats || 1}
                onChange={(e) => handleChange('qualifier_seats', +e.target.value)}
                min="1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Distribución de Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Estructuras Predefinidas</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.single)}>
                Winner Take All
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top2)}>
                Top 2
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top3)}>
                Top 3
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top5)}>
                Top 5
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top6)}>
                Top 6
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top9)}>
                Top 9
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset(presetPayouts.top10)}>
                Top 10
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Distribución Personalizada</Label>
              <Button variant="outline" size="sm" onClick={addPayoutPosition}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Posición
              </Button>
            </div>

            {customPayouts.map((percentage, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="w-20">Lugar {index + 1}:</Label>
                <Input
                  type="number"
                  value={percentage}
                  onChange={(e) => updatePayoutPercentage(index, +e.target.value)}
                  min="0"
                  max="100"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
                {customPayouts.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePayoutPosition(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className={`p-3 rounded-lg ${totalPercentage === 100 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                Total: {totalPercentage}%
                {totalPercentage !== 100 && (
                  <span className="ml-2">
                    {totalPercentage > 100 ? '(Excede 100%)' : '(Falta distribuir)'}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Vista Previa de Premios</h4>
            <div className="text-sm space-y-1">
              {customPayouts.map((percentage, index) => (
                <div key={index} className="flex justify-between">
                  <span>Lugar {index + 1}:</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}