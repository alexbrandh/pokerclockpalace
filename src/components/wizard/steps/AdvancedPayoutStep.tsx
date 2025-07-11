import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calculator, Target, Plus, Minus, DollarSign } from 'lucide-react';

interface AdvancedPayoutStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function AdvancedPayoutStep({ data, onUpdate }: AdvancedPayoutStepProps) {
  const [distributionType, setDistributionType] = useState(data.payout_distribution_type || 'fixed');
  const [customPayouts, setCustomPayouts] = useState(data.payoutStructure || [50, 30, 20]);
  const [itmPercentage, setItmPercentage] = useState(data.itm_percentage || 15);

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

  const generateDynamicPayout = () => {
    const estimatedPlayers = data.max_players || 100;
    const itm = Math.ceil((estimatedPlayers * itmPercentage) / 100);
    
    const dynamicStructure = [];
    let remaining = 100;
    
    for (let i = 0; i < itm; i++) {
      let percentage;
      if (i === 0) {
        percentage = Math.round(remaining * 0.35); // Winner gets ~35%
      } else if (i === 1) {
        percentage = Math.round(remaining * 0.25); // 2nd gets ~25%
      } else if (i === 2) {
        percentage = Math.round(remaining * 0.15); // 3rd gets ~15%
      } else {
        // Distribute remaining evenly among other positions
        const remainingPositions = itm - 3;
        percentage = Math.max(1, Math.floor((remaining * 0.25) / remainingPositions));
      }
      
      dynamicStructure.push(percentage);
      remaining -= percentage;
      
      if (remaining <= 0) break;
    }
    
    // Adjust last position to make total 100%
    if (remaining > 0 && dynamicStructure.length > 0) {
      dynamicStructure[dynamicStructure.length - 1] += remaining;
    }
    
    updatePayoutStructure(dynamicStructure);
  };

  const presetPayouts = {
    'single': { name: 'Winner Take All', structure: [100] },
    'top2': { name: 'Top 2 (70/30)', structure: [70, 30] },
    'top3': { name: 'Top 3 (50/30/20)', structure: [50, 30, 20] },
    'top4': { name: 'Top 4', structure: [40, 25, 20, 15] },
    'top5': { name: 'Top 5', structure: [35, 25, 20, 12, 8] },
    'top6': { name: 'Top 6', structure: [30, 22, 18, 15, 10, 5] },
    'top9': { name: 'Top 9', structure: [25, 18, 15, 12, 10, 8, 6, 4, 2] },
    'top10': { name: 'Top 10', structure: [22, 16, 13, 11, 9, 7, 6, 5, 3, 3] },
  };

  const totalPercentage = customPayouts.reduce((sum, pct) => sum + pct, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Distribución Avanzada de Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={distributionType} onValueChange={(value) => {
            setDistributionType(value);
            handleChange('payout_distribution_type', value);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixed">Distribución Fija</TabsTrigger>
              <TabsTrigger value="dynamic">Distribución Dinámica</TabsTrigger>
            </TabsList>

            <TabsContent value="fixed" className="space-y-4">
              <div>
                <Label className="text-base font-medium">Estructuras Predefinidas</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {Object.entries(presetPayouts).map(([key, preset]) => (
                    <Button 
                      key={key}
                      variant="outline" 
                      size="sm" 
                      onClick={() => updatePayoutStructure(preset.structure)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
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
            </TabsContent>

            <TabsContent value="dynamic" className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Generador Dinámico de Pagos
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                  Genera automáticamente una estructura de pagos basada en el porcentaje de jugadores que cobran (ITM%).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itm_percentage">Porcentaje ITM (%)</Label>
                    <Input
                      id="itm_percentage"
                      type="number"
                      value={itmPercentage}
                      onChange={(e) => {
                        setItmPercentage(+e.target.value);
                        handleChange('itm_percentage', +e.target.value);
                      }}
                      min="5"
                      max="50"
                      step="5"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Porcentaje de jugadores que cobran premio
                    </p>
                  </div>

                  <div>
                    <Label>Jugadores Estimados ITM</Label>
                    <div className="h-10 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center">
                      <span className="text-sm">
                        {Math.ceil(((data.max_players || 100) * itmPercentage) / 100)} jugadores
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basado en {data.max_players || 100} jugadores máximo
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={generateDynamicPayout}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Generar Estructura Dinámica
                </Button>
              </div>

              {customPayouts.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <h5 className="font-semibold mb-2">Estructura Generada</h5>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                    {customPayouts.map((percentage, index) => (
                      <div key={index} className="flex justify-between p-1 bg-white dark:bg-gray-800 rounded">
                        <span>{index + 1}°:</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Vista Previa de Premios
            </h4>
            <div className="text-sm space-y-1">
              {customPayouts.map((percentage, index) => {
                const estimatedPool = (data.max_players || 100) * (data.buyIn || 0);
                const prize = Math.round((estimatedPool * percentage) / 100);
                return (
                  <div key={index} className="flex justify-between">
                    <span>Lugar {index + 1}:</span>
                    <span className="font-medium">{percentage}% - {data.currency} {prize.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Basado en estimación de {data.max_players || 100} jugadores y buy-in de {data.currency} {data.buyIn || 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}