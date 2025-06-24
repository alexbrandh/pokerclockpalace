
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Calculator, DollarSign } from 'lucide-react';

interface PrizeDistributionStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PrizeDistributionStep({ data, onUpdate }: PrizeDistributionStepProps) {
  const distributionTypes = ['Fixed', 'ICM', 'Custom'];
  const defaultPayouts = [50, 30, 20];

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const calculatePayout = () => {
    const prizePool = data.guaranteedPrizePool || 0;
    const payouts = data.payoutStructure || defaultPayouts;
    
    console.log('Calculating payouts for prize pool:', prizePool);
    console.log('Payout percentages:', payouts);
  };

  const updatePayoutPercentage = (index: number, percentage: number) => {
    const newPayouts = [...(data.payoutStructure || defaultPayouts)];
    newPayouts[index] = percentage;
    handleChange('payoutStructure', newPayouts);
  };

  const addPayoutPosition = () => {
    const newPayouts = [...(data.payoutStructure || defaultPayouts), 10];
    handleChange('payoutStructure', newPayouts);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Distribución de Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Distribución</Label>
            <div className="flex gap-2 mt-2">
              {distributionTypes.map((type) => (
                <Button
                  key={type}
                  variant={data.distributionType === type ? 'default' : 'outline'}
                  onClick={() => handleChange('distributionType', type)}
                  size="sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guaranteedOverlay">Guaranteed Overlay</Label>
              <Input
                id="guaranteedOverlay"
                type="number"
                value={data.guaranteedOverlay || 0}
                onChange={(e) => handleChange('guaranteedOverlay', +e.target.value)}
                min="0"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculatePayout} className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Payout
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Estructura de Premios (%)</Label>
              <Button onClick={addPayoutPosition} size="sm" variant="outline">
                Agregar Posición
              </Button>
            </div>
            
            {(data.payoutStructure || defaultPayouts).map((percentage: number, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-12 text-sm font-medium">{index + 1}°</span>
                <Input
                  type="number"
                  value={percentage}
                  onChange={(e) => updatePayoutPercentage(index, +e.target.value)}
                  min="0"
                  max="100"
                  className="w-20"
                />
                <span className="text-sm text-gray-500">%</span>
                {data.guaranteedPrizePool && (
                  <span className="text-sm font-medium">
                    ${((data.guaranteedPrizePool * percentage) / 100).toFixed(0)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
