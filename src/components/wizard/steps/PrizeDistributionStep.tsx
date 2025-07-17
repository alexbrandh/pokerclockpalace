
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Trophy, Plus, Minus, Settings2, Trash2, Target } from 'lucide-react';

interface PrizeDistributionStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PrizeDistributionStep({ data, onUpdate }: PrizeDistributionStepProps) {
  const [showDynamicModal, setShowDynamicModal] = useState(false);
  const [expectedBuyins, setExpectedBuyins] = useState(data.expectedBuyins || 50);
  const [placesItm, setPlacesItm] = useState(data.placesItm || 10);
  const [payoutSteepness, setPayoutSteepness] = useState(data.payoutSteepness || 0);
  const [useNiceNumbers, setUseNiceNumbers] = useState(data.useNiceNumbers || true);
  const [displayPrizeMoney, setDisplayPrizeMoney] = useState(data.displayPrizeMoney || true);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const distributionType = data.prizeDistributionType || 'fixed';
  const displayPrizeDistribution = data.displayPrizeDistribution ?? true;
  const payoutStructure = data.payoutStructure || [50, 30, 20];
  const guaranteedPrizePool = data.guaranteedPrizePool || 0;
  const overlay = data.overlay || 0;
  const roundPrizeAmounts = data.roundPrizeAmounts ?? true;

  // Presets for fixed distribution
  const presets = {
    '3-way': [50, 30, 20],
    '4-way': [40, 30, 20, 10],
    '5-way': [35, 25, 20, 12, 8],
    '6-way': [30, 22, 18, 12, 10, 8],
    '7-way': [28, 20, 16, 12, 10, 8, 6],
    '8-way': [25, 18, 15, 12, 10, 8, 7, 5],
    '9-way': [23, 16, 14, 11, 9, 8, 7, 6, 6],
    '10-way': [21, 15, 13, 10, 9, 8, 7, 6, 6, 5]
  };

  const addPayoutPosition = () => {
    const newPayouts = [...payoutStructure, 5];
    handleChange('payoutStructure', newPayouts);
  };

  const removePayoutPosition = (index: number) => {
    if (payoutStructure.length > 1) {
      const newPayouts = payoutStructure.filter((_: any, i: number) => i !== index);
      handleChange('payoutStructure', newPayouts);
    }
  };

  const updatePayoutPercentage = (index: number, percentage: number) => {
    const newPayouts = [...payoutStructure];
    newPayouts[index] = Math.max(0, Math.min(100, percentage));
    handleChange('payoutStructure', newPayouts);
  };

  const applyPreset = (preset: number[]) => {
    handleChange('payoutStructure', [...preset]);
  };

  const totalPercentage = payoutStructure.reduce((sum: number, val: number) => sum + val, 0);

  const generateDynamicPayout = () => {
    const positions = placesItm;
    const newPayouts: number[] = [];
    
    // Calculate steepness factor
    const steepnessFactor = 1 + (payoutSteepness / 100);
    
    // Generate percentages with steepness
    let totalPercent = 0;
    const rawPercentages: number[] = [];
    
    for (let i = 0; i < positions; i++) {
      const factor = Math.pow((positions - i) / positions, steepnessFactor);
      rawPercentages.push(factor);
      totalPercent += factor;
    }
    
    // Normalize to 100%
    const normalizedPayouts = rawPercentages.map(p => (p / totalPercent) * 100);
    
    // Apply nice numbers if enabled
    if (useNiceNumbers) {
      for (let i = 0; i < normalizedPayouts.length; i++) {
        const val = normalizedPayouts[i];
        if (val >= 20) normalizedPayouts[i] = Math.round(val / 5) * 5;
        else if (val >= 10) normalizedPayouts[i] = Math.round(val / 2) * 2;
        else normalizedPayouts[i] = Math.round(val);
      }
      
      // Re-normalize after rounding
      const roundedTotal = normalizedPayouts.reduce((sum, val) => sum + val, 0);
      if (roundedTotal !== 100) {
        const diff = 100 - roundedTotal;
        normalizedPayouts[0] += diff;
      }
    }
    
    handleChange('payoutStructure', normalizedPayouts.map(p => Math.round(p * 100) / 100));
    handleChange('expectedBuyins', expectedBuyins);
    handleChange('placesItm', placesItm);
    handleChange('payoutSteepness', payoutSteepness);
    handleChange('useNiceNumbers', useNiceNumbers);
    handleChange('displayPrizeMoney', displayPrizeMoney);
    setShowDynamicModal(false);
  };

  const calculatePrizeAmount = (percentage: number) => {
    const totalPool = guaranteedPrizePool + overlay;
    const amount = (totalPool * percentage) / 100;
    return roundPrizeAmounts ? Math.round(amount / 5) * 5 : Math.round(amount);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Tournament Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tournament_type">Tournament Type</Label>
            <Select
              value={data.tournament_type || 'regular'}
              onValueChange={(value) => handleChange('tournament_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Tournament</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="qualifier">Qualifier</SelectItem>
                <SelectItem value="winner_take_all">Winner Take All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.tournament_type === 'satellite' && (
            <div className="space-y-2">
              <Label htmlFor="satellite_target">Satellite Target Tournament</Label>
              <Input
                id="satellite_target"
                value={data.satellite_target || ''}
                onChange={(e) => handleChange('satellite_target', e.target.value)}
                placeholder="e.g. Main Event WSOP"
              />
            </div>
          )}

          {data.tournament_type === 'qualifier' && (
            <div className="space-y-2">
              <Label htmlFor="qualifier_seats">Number of Seats to Award</Label>
              <Input
                id="qualifier_seats"
                type="number"
                value={data.qualifier_seats || 1}
                onChange={(e) => handleChange('qualifier_seats', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Prize Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Prize Distribution Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="display-prize-distribution" className="text-sm font-medium">
              Display prize distribution
            </Label>
            <Switch
              id="display-prize-distribution"
              checked={displayPrizeDistribution}
              onCheckedChange={(checked) => handleChange('displayPrizeDistribution', checked)}
            />
          </div>

          {displayPrizeDistribution && (
            <>
              {/* Distribution Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prize distribution type</Label>
                <Select
                  value={distributionType}
                  onValueChange={(value) => handleChange('prizeDistributionType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Prize Distribution</SelectItem>
                    <SelectItem value="dynamic">Dynamic Prize Distribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Guaranteed Prize Pool */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guaranteed-prize-pool" className="text-sm font-medium">
                    Guaranteed prize pool
                  </Label>
                  <Input
                    id="guaranteed-prize-pool"
                    type="number"
                    value={guaranteedPrizePool}
                    onChange={(e) => handleChange('guaranteedPrizePool', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlay" className="text-sm font-medium">
                    Overlay
                  </Label>
                  <Input
                    id="overlay"
                    type="number"
                    value={overlay}
                    onChange={(e) => handleChange('overlay', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              {/* Round Prize Amounts */}
              <div className="flex items-center justify-between">
                <Label htmlFor="round-prize-amounts" className="text-sm font-medium">
                  Round prize amounts
                </Label>
                <Switch
                  id="round-prize-amounts"
                  checked={roundPrizeAmounts}
                  onCheckedChange={(checked) => handleChange('roundPrizeAmounts', checked)}
                />
              </div>

              {distributionType === 'fixed' && (
                <div className="space-y-4">
                  {/* Presets and Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Load preset</Label>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {/* Create new payout structure logic */}}
                        className="text-xs"
                      >
                        Create New Payout Structure
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(presets).map(([name, preset]) => (
                        <Button
                          key={name}
                          variant="outline"
                          size="sm"
                          onClick={() => applyPreset(preset)}
                          className="text-xs"
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        Load
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Manual Payout Structure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Prize structure (%)</Label>
                      <div className="flex gap-2">
                        <Button onClick={addPayoutPosition} size="sm" variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {payoutStructure.map((percentage: number, index: number) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1 text-sm font-medium text-center">
                            {index + 1}
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              value={percentage}
                              onChange={(e) => updatePayoutPercentage(index, parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.1"
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-1 text-sm text-muted-foreground text-center">%</div>
                          <div className="col-span-6 text-sm font-medium">
                            ${displayPrizeMoney ? calculatePrizeAmount(percentage).toLocaleString() : '—'}
                          </div>
                          <div className="col-span-1">
                            {payoutStructure.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePayoutPosition(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total validation */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Total:</span>
                      <span className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {distributionType === 'dynamic' && (
                <div className="space-y-4">
                  <Dialog open={showDynamicModal} onOpenChange={setShowDynamicModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings2 className="w-4 h-4 mr-2" />
                        Configure Dynamic Payout Structure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Dynamic Payout Structure Generator</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {/* Expected Buy-ins */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Expected total Buy-ins</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpectedBuyins(Math.max(1, expectedBuyins - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              value={expectedBuyins}
                              onChange={(e) => setExpectedBuyins(parseInt(e.target.value) || 1)}
                              className="text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpectedBuyins(expectedBuyins + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Places ITM */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Places ITM</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPlacesItm(Math.max(1, placesItm - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              value={placesItm}
                              onChange={(e) => setPlacesItm(parseInt(e.target.value) || 1)}
                              className="text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPlacesItm(placesItm + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Payout Steepness */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Payout steepness: {payoutSteepness}
                          </Label>
                          <Slider
                            value={[payoutSteepness]}
                            onValueChange={(values) => setPayoutSteepness(values[0])}
                            min={-30}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="use-nice-numbers" className="text-sm font-medium">
                              Use Nice Numbers
                            </Label>
                            <Switch
                              id="use-nice-numbers"
                              checked={useNiceNumbers}
                              onCheckedChange={setUseNiceNumbers}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="display-prize-money" className="text-sm font-medium">
                              Display Prize Money
                            </Label>
                            <Switch
                              id="display-prize-money"
                              checked={displayPrizeMoney}
                              onCheckedChange={setDisplayPrizeMoney}
                            />
                          </div>
                        </div>

                        <Button onClick={generateDynamicPayout} className="w-full">
                          Generate Payout Structure
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Show current dynamic structure if exists */}
                  {payoutStructure.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current structure</Label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {payoutStructure.map((percentage: number, index: number) => {
                          const getPositionSuffix = (pos: number) => {
                            if (pos === 1) return 'st';
                            if (pos === 2) return 'nd';
                            if (pos === 3) return 'rd';
                            return 'th';
                          };
                          
                          return (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span className="text-sm">{index + 1}{getPositionSuffix(index + 1)} place</span>
                              <div className="flex gap-2">
                                <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                {displayPrizeMoney && (
                                  <span className="text-sm text-muted-foreground">
                                    ${calculatePrizeAmount(percentage).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Distribution Matrix */}
                  {payoutStructure.length > 0 && (guaranteedPrizePool > 0 || data.buyIn > 0) && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Prize Distribution Matrix</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-2">
                          <div className="grid grid-cols-6 gap-2 text-xs font-medium">
                            <div>Players</div>
                            <div>2-4</div>
                            <div>5-6</div>
                            <div>7-9</div>
                            <div>10-15</div>
                            <div>16+</div>
                          </div>
                        </div>
                        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                          {payoutStructure.map((percentage: number, index: number) => {
                            const buyIn = data.buyIn || 50;
                            const getPositionSuffix = (pos: number) => {
                              if (pos === 1) return 'st';
                              if (pos === 2) return 'nd';
                              if (pos === 3) return 'rd';
                              return 'th';
                            };
                            
                            return (
                              <div key={index} className="grid grid-cols-6 gap-2 text-xs">
                                <div className="font-medium">{index + 1}{getPositionSuffix(index + 1)}</div>
                                <div>${Math.round((buyIn * 3 * percentage) / 100)}</div>
                                <div>${Math.round((buyIn * 5 * percentage) / 100)}</div>
                                <div>${Math.round((buyIn * 8 * percentage) / 100)}</div>
                                <div>${Math.round((buyIn * 12 * percentage) / 100)}</div>
                                <div>${Math.round((buyIn * 20 * percentage) / 100)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        * Based on average buy-in pools for different player counts
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
