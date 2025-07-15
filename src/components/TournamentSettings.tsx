import React, { useState, useEffect } from 'react';
import { X, Settings, Volume2, Trophy, Users, Clock, DollarSign, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundSettings } from '@/components/SoundSettings';
import { EnhancedLevelEditor } from '@/components/level-editor/EnhancedLevelEditor';
import { AdvancedPrizeDistributionStep } from '@/components/wizard/steps/AdvancedPrizeDistributionStep';
import { TournamentLevel } from '@/types/tournament';
import { useSoundSystem } from '@/hooks/useSoundSystem';

interface TournamentSettingsProps {
  tournament: any;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}

export function TournamentSettings({ tournament, onClose, onUpdate }: TournamentSettingsProps) {
  const { soundSettings, updateSoundSettings, playSound } = useSoundSystem();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('TournamentSettings - Received tournament:', tournament);
  
  const [localData, setLocalData] = useState(() => {
    const data = {
      name: '',
      city: '',
      buy_in: 0,
      staff_fee: 0,
      guaranteed_prize_pool: 0,
      double_stack_allowed: false,
      early_entry_bonus: false,
      prize_pool_visible: true,
      levels: [],
      payout_structure: [50, 30, 20],
      players: 0,
      entries: 0,
      reentries: 0,
      double_entries: 0,
      late_registration_levels: 4,
    };
    console.log('TournamentSettings - Initial empty localData:', data);
    return data;
  });

  // Update localData when tournament data becomes available
  useEffect(() => {
    if (tournament && Object.keys(tournament).length > 0) {
      console.log('TournamentSettings - Updating with tournament data:', tournament);
      const data = {
        name: tournament?.name || '',
        city: tournament?.city || '',
        buy_in: tournament?.buy_in || 0,
        staff_fee: tournament?.staff_fee || 0,
        guaranteed_prize_pool: tournament?.guaranteed_prize_pool || 0,
        double_stack_allowed: tournament?.double_stack_allowed || false,
        early_entry_bonus: tournament?.early_entry_bonus || false,
        prize_pool_visible: tournament?.prize_pool_visible !== false,
        levels: tournament?.levels || [],
        payout_structure: tournament?.payout_structure || [50, 30, 20],
        players: tournament?.players || 0,
        entries: tournament?.entries || 0,
        reentries: tournament?.reentries || 0,
        double_entries: tournament?.double_entries || 0,
        late_registration_levels: tournament?.late_registration_levels || 4,
        max_players: tournament?.max_players || 100,
        ...tournament
      };
      setLocalData(data);
      setIsLoading(false);
      console.log('TournamentSettings - Updated localData:', data);
    }
  }, [tournament]);

  const handleSave = async () => {
    try {
      console.log('TournamentSettings - Saving data:', localData);
      await onUpdate(localData);
      console.log('TournamentSettings - Save successful');
      onClose();
    } catch (error) {
      console.error('Error saving tournament settings:', error);
    }
  };

  const updateData = (field: string, value: any) => {
    console.log(`TournamentSettings - Updating ${field} to:`, value);
    setLocalData((prev: any) => {
      const newData = { ...prev, [field]: value };
      console.log('TournamentSettings - New localData:', newData);
      return newData;
    });
  };

  const handleLevelsChange = (levels: TournamentLevel[]) => {
    updateData('levels', levels);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Torneo
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Cargando datos del torneo...</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-1" />
                General
              </TabsTrigger>
              <TabsTrigger value="levels">
                <Clock className="w-4 h-4 mr-1" />
                Niveles
              </TabsTrigger>
              <TabsTrigger value="prizes">
                <Trophy className="w-4 h-4 mr-1" />
                Premios
              </TabsTrigger>
              <TabsTrigger value="players">
                <Users className="w-4 h-4 mr-1" />
                Jugadores
              </TabsTrigger>
              <TabsTrigger value="sounds">
                <Volume2 className="w-4 h-4 mr-1" />
                Sonidos
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Torneo</Label>
                    <Input
                      id="name"
                      value={localData.name || ''}
                      onChange={(e) => updateData('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={localData.city || ''}
                      onChange={(e) => updateData('city', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="buy_in">Buy-in</Label>
                    <Input
                      id="buy_in"
                      type="number"
                      value={localData.buy_in || 0}
                      onChange={(e) => updateData('buy_in', +e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff_fee">Staff Fee</Label>
                    <Input
                      id="staff_fee"
                      type="number"
                      value={localData.staff_fee || 0}
                      onChange={(e) => updateData('staff_fee', +e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guaranteed_prize_pool">Prize Pool Garantizado</Label>
                    <Input
                      id="guaranteed_prize_pool"
                      type="number"
                      value={localData.guaranteed_prize_pool || 0}
                      onChange={(e) => updateData('guaranteed_prize_pool', +e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label>Double Stack Permitido</Label>
                      <p className="text-sm text-muted-foreground">Permite entrada con doble stack</p>
                    </div>
                    <Switch
                      checked={localData.double_stack_allowed || false}
                      onCheckedChange={(checked) => updateData('double_stack_allowed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label>Bono por Entrada Temprana</Label>
                      <p className="text-sm text-muted-foreground">Incentivo para primeros jugadores</p>
                    </div>
                    <Switch
                      checked={localData.early_entry_bonus || false}
                      onCheckedChange={(checked) => updateData('early_entry_bonus', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="levels" className="space-y-6">
                <div className="bg-muted border border-border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Estructura de Niveles</h3>
                  <EnhancedLevelEditor 
                    levels={localData.levels || []} 
                    onLevelsChange={handleLevelsChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="prizes" className="space-y-6">
                <AdvancedPrizeDistributionStep 
                  data={localData}
                  onUpdate={(updates) => {
                    Object.keys(updates).forEach(key => {
                      updateData(key, updates[key]);
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="players" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Jugadores Actuales</Label>
                    <Input
                      type="number"
                      value={localData.players || 0}
                      onChange={(e) => updateData('players', +e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Entradas</Label>
                    <Input
                      type="number"
                      value={localData.entries || 0}
                      onChange={(e) => updateData('entries', +e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Re-entradas</Label>
                    <Input
                      type="number"
                      value={localData.reentries || 0}
                      onChange={(e) => updateData('reentries', +e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Entradas Dobles</Label>
                    <Input
                      type="number"
                      value={localData.double_entries || 0}
                      onChange={(e) => updateData('double_entries', +e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="late_registration_levels">Registro Tardío hasta Nivel</Label>
                  <Input
                    id="late_registration_levels"
                    type="number"
                    value={localData.late_registration_levels || 4}
                    onChange={(e) => updateData('late_registration_levels', +e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="sounds">
                <SoundSettings
                  soundSettings={soundSettings}
                  onUpdateSettings={updateSoundSettings}
                  onPlaySound={playSound}
                />
              </TabsContent>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
