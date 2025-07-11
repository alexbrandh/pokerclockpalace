import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Users2, Calculator } from 'lucide-react';

interface DoubleStackStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function DoubleStackStep({ data, onUpdate }: DoubleStackStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const calculateFee = (amount: number) => {
    if (!amount || amount === 0 || data.is_freeroll) return 0;
    
    if (data.fee_type === 'percentage') {
      return Math.round((amount * (data.fee_percentage || 0)) / 100);
    } else {
      return data.fee_exact_amount || 0;
    }
  };

  const calculatePrizePool = (amount: number) => {
    return amount - calculateFee(amount);
  };

  const doubleStackCost = (data.buyIn || 0) * 2;
  const doubleStackWithStaff = doubleStackCost; // No staff fee for double entries

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Entrada con Doble Stack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="double_stack_allowed">Permitir Entrada con Doble Stack</Label>
              <p className="text-sm text-muted-foreground">
                Los jugadores pueden pagar el doble para obtener el doble de fichas iniciales
              </p>
            </div>
            <Switch
              id="double_stack_allowed"
              checked={data.double_stack_allowed || false}
              onCheckedChange={(checked) => handleChange('double_stack_allowed', checked)}
              disabled={data.is_freeroll}
            />
          </div>

          {data.double_stack_allowed && !data.is_freeroll && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="double_stack_multiplier">Multiplicador de Stack</Label>
                <Input
                  id="double_stack_multiplier"
                  type="number"
                  value={data.double_stack_multiplier || 2}
                  onChange={(e) => handleChange('double_stack_multiplier', +e.target.value)}
                  min="1.5"
                  max="5"
                  step="0.5"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Factor por el cual se multiplican las fichas iniciales
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Comparación de Entradas
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Regular Entry */}
                  <div className="p-3 border rounded-lg bg-card">
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Entrada Normal</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Buy-in:</span>
                        <span>{data.currency} {data.buyIn || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staff fee:</span>
                        <span>{data.currency} {data.staff_fee || 0}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>{data.currency} {(data.buyIn || 0) + (data.staff_fee || 0)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Stack:</span>
                        <span>{(data.starting_chips || 10000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Double Entry */}
                  <div className="p-3 border rounded-lg bg-card border-blue-500">
                    <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Entrada Doble</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Buy-in doble:</span>
                        <span>{data.currency} {doubleStackCost}</span>
                      </div>
                       <div className="flex justify-between">
                         <span>Staff fee:</span>
                         <span>{data.currency} 0</span>
                       </div>
                       <div className="text-xs text-blue-600 mt-1">
                         * No se cobra staff fee en entradas dobles (ya pagado en primera entrada)
                       </div>
                       <div className="flex justify-between font-medium border-t pt-1">
                         <span>Total:</span>
                         <span>{data.currency} {doubleStackCost}</span>
                       </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Stack:</span>
                        <span>{((data.starting_chips || 10000) * (data.double_stack_multiplier || 2)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Al Prize Pool</h6>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex justify-between">
                      <span>Entrada normal:</span>
                      <span>{data.currency} {calculatePrizePool(data.buyIn || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrada doble:</span>
                      <span>{data.currency} {calculatePrizePool(doubleStackCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.is_freeroll && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Las entradas dobles no están disponibles en torneos freeroll
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}