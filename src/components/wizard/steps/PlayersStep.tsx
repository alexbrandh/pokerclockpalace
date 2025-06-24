
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, Target, Plus, Minus } from 'lucide-react';

interface PlayersStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PlayersStep({ data, onUpdate }: PlayersStepProps) {
  const players = data.players || [];
  const bountyModes = ['Fixed', 'Progressive', 'Percentage'];

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addPlayer = () => {
    const newPlayer = {
      id: Date.now().toString(),
      name: `Jugador ${players.length + 1}`,
      buyin: data.buyIn || 0,
      bounty: data.bountyAmount || 0
    };
    handleChange('players', [...players, newPlayer]);
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_: any, i: number) => i !== index);
    handleChange('players', updatedPlayers);
  };

  const updatePlayer = (index: number, field: string, value: any) => {
    const updatedPlayers = players.map((player: any, i: number) =>
      i === index ? { ...player, [field]: value } : player
    );
    handleChange('players', updatedPlayers);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguimiento de Jugadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="trackPlayers">Seguimiento de Jugadores</Label>
              <p className="text-sm text-gray-500">
                Registrar nombres y estadísticas de jugadores
              </p>
            </div>
            <Switch
              id="trackPlayers"
              checked={data.trackPlayers || false}
              onCheckedChange={(checked) => handleChange('trackPlayers', checked)}
            />
          </div>

          {data.trackPlayers && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lista de Jugadores</Label>
                <Button onClick={addPlayer} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Jugador
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {players.map((player: any, index: number) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 border rounded">
                    <span className="w-8 text-sm">{index + 1}</span>
                    <Input
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      placeholder="Nombre del jugador"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removePlayer(index)}
                      className="text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Bounties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableBounties">Habilitar Bounties</Label>
              <p className="text-sm text-gray-500">
                Sistema de recompensas por eliminar jugadores
              </p>
            </div>
            <Switch
              id="enableBounties"
              checked={data.enableBounties || false}
              onCheckedChange={(checked) => handleChange('enableBounties', checked)}
            />
          </div>

          {data.enableBounties && (
            <div className="space-y-4">
              <div>
                <Label>Modo de Bounty</Label>
                <div className="flex gap-2 mt-2">
                  {bountyModes.map((mode) => (
                    <Button
                      key={mode}
                      variant={data.bountyMode === mode ? 'default' : 'outline'}
                      onClick={() => handleChange('bountyMode', mode)}
                      size="sm"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bountyAmount">Monto del Bounty</Label>
                  <Input
                    id="bountyAmount"
                    type="number"
                    value={data.bountyAmount || 0}
                    onChange={(e) => handleChange('bountyAmount', +e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="bountyPercentage">% del Buy-in</Label>
                  <Input
                    id="bountyPercentage"
                    type="number"
                    value={data.bountyPercentage || 20}
                    onChange={(e) => handleChange('bountyPercentage', +e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
