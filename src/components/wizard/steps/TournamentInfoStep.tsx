
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, Users } from 'lucide-react';

interface TournamentInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function TournamentInfoStep({ data, onUpdate }: TournamentInfoStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Torneo *</Label>
              <Input
                id="name"
                value={data.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Garage Poker League"
              />
            </div>
            <div>
              <Label htmlFor="location">Ubicación (Opcional)</Label>
              <Input
                id="location"
                value={data.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ej: Casino Real"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <select
              id="currency"
              value={data.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Estructura Económica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyIn">Buy-in</Label>
              <Input
                id="buyIn"
                type="number"
                value={data.buyIn || 0}
                onChange={(e) => handleChange('buyIn', +e.target.value)}
                min="0"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configuración de Fichas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="initialStack">Stack Inicial por Jugador</Label>
            <Input
              id="initialStack"
              type="number"
              value={data.initialStack || 0}
              onChange={(e) => handleChange('initialStack', +e.target.value)}
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Cantidad de fichas que cada jugador recibe al inicio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
