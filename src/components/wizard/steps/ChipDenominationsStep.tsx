
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Upload, Trash2, Eye } from 'lucide-react';

interface ChipDenominationsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface ChipDenomination {
  id: string;
  value: number;
  color: string;
  image?: string;
}

export function ChipDenominationsStep({ data, onUpdate }: ChipDenominationsStepProps) {
  const [newChipValue, setNewChipValue] = useState('');
  const [newChipColor, setNewChipColor] = useState('#3B82F6');

  const chipDenominations: ChipDenomination[] = data.chipDenominations || [
    { id: '1', value: 25, color: '#10B981' },
    { id: '2', value: 100, color: '#000000' },
    { id: '3', value: 500, color: '#EF4444' },
    { id: '4', value: 1000, color: '#8B5CF6' },
    { id: '5', value: 5000, color: '#F59E0B' }
  ];

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addChipDenomination = () => {
    const value = parseInt(newChipValue);
    if (value <= 0) return;

    const newChip: ChipDenomination = {
      id: Date.now().toString(),
      value,
      color: newChipColor
    };

    const updatedChips = [...chipDenominations, newChip].sort((a, b) => a.value - b.value);
    handleChange('chipDenominations', updatedChips);
    setNewChipValue('');
  };

  const removeChipDenomination = (id: string) => {
    const updatedChips = chipDenominations.filter(chip => chip.id !== id);
    handleChange('chipDenominations', updatedChips);
  };

  const uploadChipImage = (id: string) => {
    console.log('Upload image for chip:', id);
    // Implementar upload de imagen
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Denominaciones de Fichas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="newChipValue">Valor de Ficha</Label>
              <Input
                id="newChipValue"
                type="number"
                value={newChipValue}
                onChange={(e) => setNewChipValue(e.target.value)}
                placeholder="Ej: 25"
                min="1"
              />
            </div>
            <div className="w-20">
              <Label htmlFor="newChipColor">Color</Label>
              <input
                id="newChipColor"
                type="color"
                value={newChipColor}
                onChange={(e) => setNewChipColor(e.target.value)}
                className="w-full h-10 rounded border"
              />
            </div>
            <Button onClick={addChipDenomination} disabled={!newChipValue || parseInt(newChipValue) <= 0}>
              Agregar
            </Button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chipDenominations.map((chip) => (
              <div key={chip.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: chip.color }}
                />
                <span className="font-medium">{chip.value}</span>
                <div className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => uploadChipImage(chip.id)}>
                  <Upload className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeChipDenomination(chip.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
