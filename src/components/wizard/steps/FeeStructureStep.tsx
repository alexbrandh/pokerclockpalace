import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, Calculator } from 'lucide-react';

interface FeeStructureStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function FeeStructureStep({ data, onUpdate }: FeeStructureStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const calculateFee = (amount: number) => {
    if (!amount || amount === 0) return 0;
    
    if (data.fee_type === 'percentage') {
      return Math.round((amount * (data.fee_percentage || 0)) / 100);
    } else {
      return data.fee_exact_amount || 0;
    }
  };

  const calculatePrizePool = (amount: number) => {
    // Fee is subtracted from the buy-in, not added to it
    return amount - calculateFee(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Estructura de Fee/Rake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.is_freeroll ? (
            <>
              <div>
                <Label htmlFor="fee_type">Tipo de Fee</Label>
                <select
                  id="fee_type"
                  value={data.fee_type || 'percentage'}
                  onChange={(e) => handleChange('fee_type', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="exact">Cantidad Exacta</option>
                </select>
              </div>

              {data.fee_type === 'percentage' ? (
                <div>
                  <Label htmlFor="fee_percentage">Porcentaje de Fee (%)</Label>
                  <Input
                    id="fee_percentage"
                    type="number"
                    value={data.fee_percentage || 0}
                    onChange={(e) => handleChange('fee_percentage', +e.target.value)}
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Se aplicará a todos los conceptos (buy-in, re-entry, rebuy, add-on)
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="fee_exact_amount">Cantidad Exacta de Fee</Label>
                  <Input
                    id="fee_exact_amount"
                    type="number"
                    value={data.fee_exact_amount || 0}
                    onChange={(e) => handleChange('fee_exact_amount', +e.target.value)}
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Se aplicará la misma cantidad a todos los conceptos
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="staff_fee">Aportación para Staff</Label>
                <Input
                  id="staff_fee"
                  type="number"
                  value={data.staff_fee || 0}
                  onChange={(e) => handleChange('staff_fee', +e.target.value)}
                  min="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Fee fijo adicional que va directamente al staff (no al prize pool)
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Desglose de Buy-in</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Buy-in base:</span>
                    <span className="ml-2 font-medium">{data.currency || '$'} {data.buyIn || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Staff fee:</span>
                    <span className="ml-2 font-medium text-blue-600">+{data.currency || '$'} {data.staff_fee || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rake ({data.fee_type === 'percentage' ? `${data.fee_percentage || 0}%` : 'exacto'}):</span>
                    <span className="ml-2 font-medium text-red-600">-{data.currency || '$'} {calculateFee(data.buyIn || 0)}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <span className="text-muted-foreground">Total que paga jugador:</span>
                    <span className="ml-2 font-bold text-blue-600">{data.currency || '$'} {(data.buyIn || 0) + (data.staff_fee || 0)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Al prize pool:</span>
                    <span className="ml-2 font-bold text-green-600">{data.currency || '$'} {calculatePrizePool(data.buyIn || 0)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  El staff fee se suma al total del jugador pero no va al prize pool.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Freeroll activo - No se aplicarán fees en este torneo
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}