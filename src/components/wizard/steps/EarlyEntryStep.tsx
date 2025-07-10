import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trophy, Timer, Percent } from 'lucide-react';

interface EarlyEntryStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function EarlyEntryStep({ data, onUpdate }: EarlyEntryStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const calculateBonus = () => {
    const guaranteedPool = data.guaranteedPrizePool || 0;
    const percentage = data.early_entry_percentage || 5;
    return Math.round((guaranteedPool * percentage) / 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Bono por Entrada Temprana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="early_entry_bonus">Activar Bono por Entrada Temprana</Label>
              <p className="text-sm text-muted-foreground">
                Incentivo adicional para jugadores que se registren en los primeros niveles
              </p>
            </div>
            <Switch
              id="early_entry_bonus"
              checked={data.early_entry_bonus || false}
              onCheckedChange={(checked) => handleChange('early_entry_bonus', checked)}
            />
          </div>

          {data.early_entry_bonus && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="early_entry_levels" className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Niveles Válidos para Bono
                  </Label>
                  <Input
                    id="early_entry_levels"
                    type="number"
                    value={data.early_entry_levels || 3}
                    onChange={(e) => handleChange('early_entry_levels', +e.target.value)}
                    min="1"
                    max="10"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Jugadores que entren hasta este nivel califican para el bono
                  </p>
                </div>

                <div>
                  <Label htmlFor="early_entry_percentage" className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Porcentaje del Garantizado (%)
                  </Label>
                  <Input
                    id="early_entry_percentage"
                    type="number"
                    value={data.early_entry_percentage || 5}
                    onChange={(e) => handleChange('early_entry_percentage', +e.target.value)}
                    min="1"
                    max="20"
                    step="0.5"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Porcentaje del prize pool garantizado que se otorga como bono
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Resumen del Bono
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-800 dark:text-yellow-200">
                      Jugadores que entren hasta el nivel {data.early_entry_levels || 3}:
                    </span>
                    <span className="font-medium text-yellow-900 dark:text-yellow-100">
                      Califican para bono
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-800 dark:text-yellow-200">
                      Bono total disponible:
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-100">
                      {data.currency} {calculateBonus().toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                    <strong>Nota:</strong> El bono se distribuye entre todos los jugadores que califiquen 
                    al final del registro tardío. Si solo 1 jugador califica, se lleva todo el bono.
                  </div>
                </div>
              </div>

              {!data.guaranteedPrizePool && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    ⚠️ Necesitas configurar un Prize Pool Garantizado para activar el bono por entrada temprana
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}