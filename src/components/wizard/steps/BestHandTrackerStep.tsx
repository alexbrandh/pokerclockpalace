import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, User, Award } from 'lucide-react';

interface BestHandTrackerStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BestHandTrackerStep({ data, onUpdate }: BestHandTrackerStepProps) {
  const [bestHandWinner, setBestHandWinner] = useState(data.best_hand_winner || '');
  const [bestHandType, setBestHandType] = useState(data.best_hand_type || '');

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handTypes = [
    'Royal Flush',
    'Straight Flush', 
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pair',
    'One Pair',
    'High Card'
  ];

  const updateBestHand = (winner: string, handType: string) => {
    setBestHandWinner(winner);
    setBestHandType(handType);
    handleChange('best_hand_winner', winner);
    handleChange('best_hand_type', handType);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Seguimiento de Mejor Mano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.early_entry_bonus ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Bono por Mejor Mano
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  Durante los primeros {data.early_entry_levels || 3} niveles, el jugador con la mejor mano ganará el bono de entrada temprana.
                </p>
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-800 dark:text-yellow-200">
                      Bono disponible:
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-100">
                      {data.currency} {Math.round(((data.guaranteedPrizePool || 0) * (data.early_entry_percentage || 5)) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="best_hand_winner" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Ganador de la Mejor Mano
                  </Label>
                  <Input
                    id="best_hand_winner"
                    value={bestHandWinner}
                    onChange={(e) => updateBestHand(e.target.value, bestHandType)}
                    placeholder="Nombre del jugador"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Jugador que logró la mejor mano durante los niveles de entrada temprana
                  </p>
                </div>

                <div>
                  <Label htmlFor="best_hand_type">Tipo de Mano</Label>
                  <select
                    id="best_hand_type"
                    value={bestHandType}
                    onChange={(e) => updateBestHand(bestHandWinner, e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar mano...</option>
                    {handTypes.map((hand) => (
                      <option key={hand} value={hand}>{hand}</option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tipo de mano ganadora
                  </p>
                </div>
              </div>

              {bestHandWinner && bestHandType && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    🏆 Ganador del Bono por Mejor Mano
                  </h5>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p><strong>Jugador:</strong> {bestHandWinner}</p>
                    <p><strong>Mano:</strong> {bestHandType}</p>
                    <p><strong>Premio:</strong> {data.currency} {Math.round(((data.guaranteedPrizePool || 0) * (data.early_entry_percentage || 5)) / 100).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
              <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                El bono por entrada temprana debe estar activado para usar el seguimiento de mejor mano.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}