import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Users, FileText, Gift } from 'lucide-react';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información General
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
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad/Ubicación *</Label>
              <Input
                id="city"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ej: Casino Real, Ciudad de México"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tournament_date">Fecha y Hora del Torneo</Label>
              <Input
                id="tournament_date"
                type="datetime-local"
                value={data.tournament_date || ''}
                onChange={(e) => handleChange('tournament_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                value={data.currency || 'MXN'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="MXN">MXN ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción del Torneo</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción opcional del torneo..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="rules">Reglas Especiales</Label>
            <Textarea
              id="rules"
              value={data.rules || ''}
              onChange={(e) => handleChange('rules', e.target.value)}
              placeholder="Reglas especiales o notas adicionales..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Tipo de Torneo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="is_freeroll">Freeroll</Label>
              <p className="text-sm text-muted-foreground">
                Torneo gratuito sin buy-in
              </p>
            </div>
            <Switch
              id="is_freeroll"
              checked={data.is_freeroll || false}
              onCheckedChange={(checked) => {
                handleChange('is_freeroll', checked);
                if (checked) {
                  handleChange('buyIn', 0);
                  handleChange('reentryFee', 0);
                  handleChange('guaranteedPrizePool', 0);
                }
              }}
            />
          </div>
          {data.is_freeroll && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Modo freeroll activado. Todos los costos se han puesto en $0.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Límites de Jugadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_players">Mínimo de Jugadores</Label>
              <Input
                id="min_players"
                type="number"
                value={data.min_players || 2}
                onChange={(e) => handleChange('min_players', +e.target.value)}
                min="2"
              />
            </div>
            <div>
              <Label htmlFor="max_players">Máximo de Jugadores</Label>
              <Input
                id="max_players"
                type="number"
                value={data.max_players || 100}
                onChange={(e) => handleChange('max_players', +e.target.value)}
                min="2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}