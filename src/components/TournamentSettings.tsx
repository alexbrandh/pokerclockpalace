
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TournamentState } from '@/types/tournament';

interface TournamentSettingsProps {
  tournament: TournamentState;
  onClose: () => void;
  onUpdate: (updates: Partial<TournamentState>) => void;
}

export function TournamentSettings({ tournament, onClose, onUpdate }: TournamentSettingsProps) {
  const [players, setPlayers] = useState(tournament.players);
  const [entries, setEntries] = useState(tournament.entries);
  const [reentries, setReentries] = useState(tournament.reentries);
  const [initialStack, setInitialStack] = useState(tournament.structure.initialStack);

  const handleSave = () => {
    onUpdate({
      players,
      entries,
      reentries,
      structure: {
        ...tournament.structure,
        initialStack
      },
      currentPrizePool: tournament.structure.guaranteedPrizePool + (reentries * tournament.structure.reentryFee)
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Configuración del Torneo</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="players" className="text-slate-300">Jugadores</Label>
              <Input
                id="players"
                type="number"
                value={players}
                onChange={(e) => setPlayers(+e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="entries" className="text-slate-300">Entradas</Label>
              <Input
                id="entries"
                type="number"
                value={entries}
                onChange={(e) => setEntries(+e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="reentries" className="text-slate-300">Re-entradas</Label>
              <Input
                id="reentries"
                type="number"
                value={reentries}
                onChange={(e) => setReentries(+e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="initialStack" className="text-slate-300">Stack Inicial</Label>
              <Input
                id="initialStack"
                type="number"
                value={initialStack}
                onChange={(e) => setInitialStack(+e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
