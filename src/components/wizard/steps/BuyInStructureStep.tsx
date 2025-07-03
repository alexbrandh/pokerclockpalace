import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, RefreshCw, Plus, Percent } from 'lucide-react';

interface BuyInStructureStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BuyInStructureStep({ data, onUpdate }: BuyInStructureStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Estructura de Buy-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyIn">Buy-in Principal</Label>
              <Input
                id="buyIn"
                type="number"
                value={data.buyIn || 0}
                onChange={(e) => handleChange('buyIn', +e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="registration_fee">Fee de Registro</Label>
              <Input
                id="registration_fee"
                type="number"
                value={data.registration_fee || 0}
                onChange={(e) => handleChange('registration_fee', +e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guaranteedPrizePool">Prize Pool Garantizado</Label>
              <Input
                id="guaranteedPrizePool"
                type="number"
                value={data.guaranteedPrizePool || 0}
                onChange={(e) => handleChange('guaranteedPrizePool', +e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="starting_chips">Stack Inicial</Label>
              <Input
                id="starting_chips"
                type="number"
                value={data.starting_chips || 10000}
                onChange={(e) => handleChange('starting_chips', +e.target.value)}
                min="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Re-entry y Recompra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reentryFee">Costo de Re-entry</Label>
              <Input
                id="reentryFee"
                type="number"
                value={data.reentryFee || 0}
                onChange={(e) => handleChange('reentryFee', +e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="late_registration_levels">Re-entry hasta Nivel</Label>
              <Input
                id="late_registration_levels"
                type="number"
                value={data.late_registration_levels || 4}
                onChange={(e) => handleChange('late_registration_levels', +e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rebuy_allowed">Permitir Recompra</Label>
              <Switch
                id="rebuy_allowed"
                checked={data.rebuy_allowed || false}
                onCheckedChange={(checked) => handleChange('rebuy_allowed', checked)}
              />
            </div>

            {data.rebuy_allowed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="rebuy_levels">Recompra hasta Nivel</Label>
                  <Input
                    id="rebuy_levels"
                    type="number"
                    value={data.rebuy_levels || 3}
                    onChange={(e) => handleChange('rebuy_levels', +e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="rebuy_stack">Stack de Recompra</Label>
                  <Input
                    id="rebuy_stack"
                    type="number"
                    value={data.rebuy_stack || 10000}
                    onChange={(e) => handleChange('rebuy_stack', +e.target.value)}
                    min="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="rebuy_cost">Costo de Recompra</Label>
                  <Input
                    id="rebuy_cost"
                    type="number"
                    value={data.rebuy_cost || data.buyIn}
                    onChange={(e) => handleChange('rebuy_cost', +e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add-on
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="addon_allowed">Permitir Add-on</Label>
            <Switch
              id="addon_allowed"
              checked={data.addon_allowed || false}
              onCheckedChange={(checked) => handleChange('addon_allowed', checked)}
            />
          </div>

          {data.addon_allowed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="addon_levels">Add-on hasta Nivel</Label>
                <Input
                  id="addon_levels"
                  type="number"
                  value={data.addon_levels || 3}
                  onChange={(e) => handleChange('addon_levels', +e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="addon_stack">Stack de Add-on</Label>
                <Input
                  id="addon_stack"
                  type="number"
                  value={data.addon_stack || 5000}
                  onChange={(e) => handleChange('addon_stack', +e.target.value)}
                  min="1000"
                />
              </div>
              <div>
                <Label htmlFor="addon_cost">Costo de Add-on</Label>
                <Input
                  id="addon_cost"
                  type="number"
                  value={data.addon_cost || data.buyIn / 2}
                  onChange={(e) => handleChange('addon_cost', +e.target.value)}
                  min="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Distribución y Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payout_percentage">% del Prize Pool a Repartir</Label>
              <Input
                id="payout_percentage"
                type="number"
                value={data.payout_percentage || 100}
                onChange={(e) => handleChange('payout_percentage', +e.target.value)}
                min="50"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="dealer_tip_percentage">% Propina Dealer</Label>
              <Input
                id="dealer_tip_percentage"
                type="number"
                value={data.dealer_tip_percentage || 0}
                onChange={(e) => handleChange('dealer_tip_percentage', +e.target.value)}
                min="0"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}