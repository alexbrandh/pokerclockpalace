import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Clock } from 'lucide-react';

interface PrizeVisibilityStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PrizeVisibilityStep({ data, onUpdate }: PrizeVisibilityStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Visibilidad de Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="prize_pool_visible">Mostrar Prize Pool Desde el Inicio</Label>
              <p className="text-sm text-muted-foreground">
                Si está desactivado, los premios solo se muestran después del cierre de registro
              </p>
            </div>
            <Switch
              id="prize_pool_visible"
              checked={data.prize_pool_visible !== false} // Default to true
              onCheckedChange={(checked) => handleChange('prize_pool_visible', checked)}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {data.prize_pool_visible !== false ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-orange-600" />
              )}
              Configuración Actual
            </h4>
            <div className="text-sm text-muted-foreground">
              {data.prize_pool_visible !== false ? (
                <div className="space-y-1">
                  <p>✓ Los premios se mostrarán desde el inicio del torneo</p>
                  <p>✓ Los jugadores podrán ver la estructura de premios completa</p>
                  <p>✓ Útil para torneos con prize pool garantizado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Los premios se calcularán y mostrarán al cerrar el registro
                  </p>
                  <p>• Permite ajustar premios según número final de jugadores</p>
                  <p>• Ideal para torneos sin garantizado</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Recomendación:</strong> Si tienes un prize pool garantizado, 
              mantén los premios visibles. Si dependes del número de jugadores, 
              desactiva la visibilidad hasta cerrar el registro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}