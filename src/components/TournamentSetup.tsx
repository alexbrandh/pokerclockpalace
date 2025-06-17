
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Save, Upload } from 'lucide-react';
import { TournamentStructure, TournamentLevel } from '@/types/tournament';
import { useTournament } from '@/contexts/TournamentContext';

interface TournamentSetupProps {
  onTournamentCreated: () => void;
}

export function TournamentSetup({ onTournamentCreated }: TournamentSetupProps) {
  const { createTournament } = useTournament();
  const [structure, setStructure] = useState<TournamentStructure>({
    id: '',
    name: 'Garage Poker League',
    buyIn: 50,
    reentryFee: 25,
    guaranteedPrizePool: 300,
    levels: [
      { id: '1', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
      { id: '3', smallBlind: 100, bigBlind: 200, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
    ],
    breakAfterLevels: 3,
    payoutStructure: [50, 30, 20]
  });

  const addLevel = () => {
    const lastLevel = structure.levels[structure.levels.length - 1];
    const newLevel: TournamentLevel = {
      id: Date.now().toString(),
      smallBlind: lastLevel?.smallBlind || 50,
      bigBlind: lastLevel?.bigBlind || 100,
      ante: 0,
      duration: 20,
      isBreak: false
    };
    setStructure(prev => ({
      ...prev,
      levels: [...prev.levels, newLevel]
    }));
  };

  const removeLevel = (index: number) => {
    setStructure(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  const updateLevel = (index: number, updates: Partial<TournamentLevel>) => {
    setStructure(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => 
        i === index ? { ...level, ...updates } : level
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTournament(structure);
    onTournamentCreated();
  };

  const saveTemplate = () => {
    const dataStr = JSON.stringify(structure, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${structure.name.replace(/\s+/g, '_')}_template.json`;
    link.click();
  };

  const loadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const template = JSON.parse(event.target?.result as string);
        setStructure(template);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Configuración del Torneo
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveTemplate} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar Plantilla
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={loadTemplate}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Cargar Plantilla
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Torneo</Label>
                <Input
                  id="name"
                  value={structure.name}
                  onChange={(e) => setStructure(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="buyIn">Buy-in ($)</Label>
                <Input
                  id="buyIn"
                  type="number"
                  value={structure.buyIn}
                  onChange={(e) => setStructure(prev => ({ ...prev, buyIn: +e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reentry">Re-entry ($)</Label>
                <Input
                  id="reentry"
                  type="number"
                  value={structure.reentryFee}
                  onChange={(e) => setStructure(prev => ({ ...prev, reentryFee: +e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="guaranteed">Prize Pool Garantizado ($)</Label>
                <Input
                  id="guaranteed"
                  type="number"
                  value={structure.guaranteedPrizePool}
                  onChange={(e) => setStructure(prev => ({ ...prev, guaranteedPrizePool: +e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Estructura de Pagos (%)</Label>
              <div className="flex gap-2 mt-2">
                {structure.payoutStructure.map((payout, index) => (
                  <Input
                    key={index}
                    type="number"
                    value={payout}
                    onChange={(e) => {
                      const newPayouts = [...structure.payoutStructure];
                      newPayouts[index] = +e.target.value;
                      setStructure(prev => ({ ...prev, payoutStructure: newPayouts }));
                    }}
                    className="w-20"
                    placeholder={`${index + 1}°`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStructure(prev => ({
                    ...prev,
                    payoutStructure: [...prev.payoutStructure, 0]
                  }))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Niveles del Torneo</Label>
                <Button type="button" onClick={addLevel} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Nivel
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {structure.levels.map((level, index) => (
                  <div key={level.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="w-8 text-sm font-medium">{index + 1}</span>
                    
                    {level.isBreak ? (
                      <>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-blue-600">DESCANSO</span>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={level.duration}
                            onChange={(e) => updateLevel(index, { duration: +e.target.value })}
                            placeholder="Min"
                            className="text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={level.smallBlind}
                            onChange={(e) => updateLevel(index, { smallBlind: +e.target.value })}
                            placeholder="SB"
                            className="text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={level.bigBlind}
                            onChange={(e) => updateLevel(index, { bigBlind: +e.target.value })}
                            placeholder="BB"
                            className="text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={level.ante}
                            onChange={(e) => updateLevel(index, { ante: +e.target.value })}
                            placeholder="Ante"
                            className="text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={level.duration}
                            onChange={(e) => updateLevel(index, { duration: +e.target.value })}
                            placeholder="Min"
                            className="text-sm"
                          />
                        </div>
                      </>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLevel(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Crear Torneo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
