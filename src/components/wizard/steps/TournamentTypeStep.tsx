import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, AlertTriangle, DollarSign } from 'lucide-react';

interface TournamentTypeStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function TournamentTypeStep({ data, onUpdate }: TournamentTypeStepProps) {
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

  const calculateTotal = (amount: number) => {
    return amount + calculateFee(amount);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Torneo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tournament_elimination_type">Tipo de Eliminación</Label>
            <select
              id="tournament_elimination_type"
              value={data.tournament_elimination_type || 'reentry'}
              onChange={(e) => {
                handleChange('tournament_elimination_type', e.target.value);
                // If switching to re-entry, disable add-on
                if (e.target.value === 'reentry') {
                  handleChange('addon_allowed', false);
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="reentry">Re-Entry (Se levanta de la mesa)</option>
              <option value="rebuy">Re-Buy (Se queda en la mesa)</option>
            </select>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              {data.tournament_elimination_type === 'reentry' ? 'Torneo Re-Entry' : 'Torneo Re-Buy'}
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {data.tournament_elimination_type === 'reentry' ? (
                <>
                  <p>• El jugador eliminado debe levantarse de la mesa</p>
                  <p>• Debe volver a registrarse en el torneo</p>
                  <p>• La mesa se asigna aleatoriamente</p>
                  <p>• No hay add-on disponible</p>
                </>
              ) : (
                <>
                  <p>• El jugador eliminado se queda en la mesa</p>
                  <p>• Las fichas se entregan directamente en la mesa</p>
                  <p>• Conserva su posición en la mesa</p>
                  <p>• Add-on disponible (opcional)</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy-in Structure */}
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
                disabled={data.is_freeroll}
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

          <div>
            <Label htmlFor="guaranteedPrizePool">Prize Pool Garantizado</Label>
            <Input
              id="guaranteedPrizePool"
              type="number"
              value={data.guaranteedPrizePool || 0}
              onChange={(e) => handleChange('guaranteedPrizePool', +e.target.value)}
              min="0"
              disabled={data.is_freeroll}
            />
          </div>

          {!data.is_freeroll && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Buy-in base:</span>
                  <span>{data.currency} {data.buyIn || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>{data.currency} {calculateFee(data.buyIn || 0)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total buy-in:</span>
                  <span>{data.currency} {calculateTotal(data.buyIn || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Re-Entry/Re-Buy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {data.tournament_elimination_type === 'reentry' ? 'Re-Entry' : 'Re-Buy'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reentry_allowed">
                Permitir {data.tournament_elimination_type === 'reentry' ? 'Re-Entry' : 'Re-Buy'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {data.tournament_elimination_type === 'reentry' 
                  ? 'Los jugadores pueden volver a registrarse después de ser eliminados'
                  : 'Los jugadores pueden comprar más fichas después de ser eliminados'
                }
              </p>
            </div>
            <Switch
              id="reentry_allowed"
              checked={data.reentry_allowed || false}
              onCheckedChange={(checked) => handleChange('reentry_allowed', checked)}
            />
          </div>

          {data.reentry_allowed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="reentryFee">
                  Costo de {data.tournament_elimination_type === 'reentry' ? 'Re-Entry' : 'Re-Buy'}
                </Label>
                <Input
                  id="reentryFee"
                  type="number"
                  value={data.reentryFee || data.buyIn || 0}
                  onChange={(e) => handleChange('reentryFee', +e.target.value)}
                  min="0"
                  disabled={data.is_freeroll}
                />
                {!data.is_freeroll && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Total con fee: {data.currency} {calculateTotal(data.reentryFee || data.buyIn || 0)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reentry_stack">Stack de {data.tournament_elimination_type === 'reentry' ? 'Re-Entry' : 'Re-Buy'}</Label>
                <Input
                  id="reentry_stack"
                  type="number"
                  value={data.reentry_stack || data.starting_chips || 10000}
                  onChange={(e) => handleChange('reentry_stack', +e.target.value)}
                  min="1000"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add-on (only for Re-Buy tournaments) */}
      {data.tournament_elimination_type === 'rebuy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add-on
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="addon_allowed">Permitir Add-on</Label>
                <p className="text-sm text-muted-foreground">
                  Los jugadores pueden comprar fichas adicionales durante descansos
                </p>
              </div>
              <Switch
                id="addon_allowed"
                checked={data.addon_allowed || false}
                onCheckedChange={(checked) => handleChange('addon_allowed', checked)}
              />
            </div>

            {data.addon_allowed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="addon_cost">Costo del Add-on</Label>
                  <Input
                    id="addon_cost"
                    type="number"
                    value={data.addon_cost || Math.floor((data.buyIn || 50) / 2)}
                    onChange={(e) => handleChange('addon_cost', +e.target.value)}
                    min="0"
                    disabled={data.is_freeroll}
                  />
                  {!data.is_freeroll && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total con fee: {data.currency} {calculateTotal(data.addon_cost || Math.floor((data.buyIn || 50) / 2))}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addon_stack">Fichas del Add-on</Label>
                  <Input
                    id="addon_stack"
                    type="number"
                    value={data.addon_stack || Math.floor((data.starting_chips || 10000) / 2)}
                    onChange={(e) => handleChange('addon_stack', +e.target.value)}
                    min="1000"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Warning for Re-Entry + Add-on */}
      {data.tournament_elimination_type === 'reentry' && data.addon_allowed && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Configuración Incompatible
              </h4>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Los torneos Re-Entry normalmente no tienen Add-on. Considera cambiar a Re-Buy si quieres permitir Add-on.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}