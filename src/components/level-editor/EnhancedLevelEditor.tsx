
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Coffee, Clock, Wand2, BarChart3 } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';
import { LevelItem } from './LevelItem';

interface EnhancedLevelEditorProps {
  levels: TournamentLevel[];
  onLevelsChange: (levels: TournamentLevel[]) => void;
}

export function EnhancedLevelEditor({ levels, onLevelsChange }: EnhancedLevelEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = levels.findIndex((item) => item.id === active.id);
      const newIndex = levels.findIndex((item) => item.id === over?.id);

      onLevelsChange(arrayMove(levels, oldIndex, newIndex));
    }
  };

  const addLevel = () => {
    const lastLevel = levels[levels.length - 1];
    const newLevel: TournamentLevel = {
      id: Date.now().toString(),
      smallBlind: lastLevel && !lastLevel.isBreak ? Math.floor(lastLevel.smallBlind * 1.5) : 50,
      bigBlind: lastLevel && !lastLevel.isBreak ? Math.floor(lastLevel.bigBlind * 1.5) : 100,
      ante: 0,
      duration: 20,
      isBreak: false
    };
    
    onLevelsChange([...levels, newLevel]);
  };

  const addBreak = () => {
    const newBreak: TournamentLevel = {
      id: Date.now().toString(),
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15,
      isBreak: true,
      breakDuration: 15
    };
    
    onLevelsChange([...levels, newBreak]);
  };

  const removeLevel = (index: number) => {
    const updatedLevels = levels.filter((_, i) => i !== index);
    onLevelsChange(updatedLevels);
  };

  const updateLevel = (index: number, updates: Partial<TournamentLevel>) => {
    const updatedLevels = levels.map((level, i) => 
      i === index ? { ...level, ...updates } : level
    );
    onLevelsChange(updatedLevels);
  };

  const generateAutoStructure = () => {
    const autoLevels: TournamentLevel[] = [];
    let sb = 25;
    let bb = 50;
    
    for (let i = 1; i <= 12; i++) {
      autoLevels.push({
        id: i.toString(),
        smallBlind: sb,
        bigBlind: bb,
        ante: i > 6 ? Math.floor(bb * 0.1) : 0,
        duration: 20,
        isBreak: false
      });
      
      // Add break every 3 levels
      if (i % 3 === 0 && i < 12) {
        autoLevels.push({
          id: `break${i/3}`,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true,
          breakDuration: 15
        });
      }
      
      // Progressive increase
      const multiplier = i <= 6 ? 1.5 : 2;
      sb = Math.floor(sb * multiplier);
      bb = Math.floor(bb * multiplier);
    }
    
    onLevelsChange(autoLevels);
  };

  const totalTournamentTime = levels.reduce((total, level) => total + level.duration, 0);
  const gameTime = levels.filter(l => !l.isBreak).reduce((total, level) => total + level.duration, 0);
  const breakTime = levels.filter(l => l.isBreak).reduce((total, level) => total + level.duration, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Editor de Niveles Mejorado
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateAutoStructure} size="sm">
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-generar
              </Button>
              <Button variant="outline" onClick={addLevel} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nivel
              </Button>
              <Button variant="outline" onClick={addBreak} size="sm">
                <Coffee className="w-4 h-4 mr-2" />
                Break
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {levels.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={levels} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {levels.map((level, index) => (
                    <LevelItem
                      key={level.id}
                      level={level}
                      index={index}
                      onUpdate={(updates) => updateLevel(index, updates)}
                      onRemove={() => removeLevel(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay niveles configurados</p>
              <p className="text-sm">Usa los botones de arriba para agregar niveles o generar automáticamente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {levels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumen de Estructura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{levels.length}</div>
                <div className="text-gray-600">Total Niveles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.floor(totalTournamentTime / 60)}h {totalTournamentTime % 60}m</div>
                <div className="text-gray-600">Duración Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.floor(gameTime / 60)}h {gameTime % 60}m</div>
                <div className="text-gray-600">Tiempo de Juego</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{breakTime}m</div>
                <div className="text-gray-600">Tiempo Breaks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
