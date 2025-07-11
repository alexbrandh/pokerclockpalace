
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GripVertical, Coffee, Clock, Minus } from 'lucide-react';
import { TournamentLevel } from '@/types/tournament';

interface LevelItemProps {
  level: TournamentLevel;
  index: number;
  onUpdate: (updates: Partial<TournamentLevel>) => void;
  onRemove: () => void;
}

export function LevelItem({ level, index, onUpdate, onRemove }: LevelItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border rounded-lg bg-white ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <span className="w-8 text-sm font-medium text-gray-600">{index + 1}</span>
      
      {level.isBreak ? (
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">DESCANSO</span>
          </div>
          <div className="w-20">
            <Label className="text-xs text-gray-500">Min</Label>
            <Input
              type="number"
              value={level.duration}
              onChange={(e) => onUpdate({ duration: +e.target.value })}
              placeholder="Min"
              className="text-sm h-8"
              min="1"
            />
          </div>
          <div className="w-24">
            <Label className="text-xs text-gray-500">Color Up</Label>
            <Input
              type="number"
              value={level.colorUpAmount || 0}
              onChange={(e) => onUpdate({ colorUpAmount: +e.target.value })}
              placeholder="0"
              className="text-sm h-8"
              min="0"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs text-gray-500">De</Label>
            <Input
              type="text"
              value={level.colorUpFrom || ''}
              onChange={(e) => onUpdate({ colorUpFrom: e.target.value })}
              placeholder="25"
              className="text-sm h-8"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <div className="w-20">
            <Label className="text-xs text-gray-500">SB</Label>
            <Input
              type="number"
              value={level.smallBlind}
              onChange={(e) => onUpdate({ smallBlind: +e.target.value })}
              className="text-sm h-8"
              min="0"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs text-gray-500">BB</Label>
            <Input
              type="number"
              value={level.bigBlind}
              onChange={(e) => onUpdate({ bigBlind: +e.target.value })}
              className="text-sm h-8"
              min="0"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs text-gray-500">Ante</Label>
            <Input
              type="number"
              value={level.ante}
              onChange={(e) => onUpdate({ ante: +e.target.value })}
              className="text-sm h-8"
              min="0"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs text-gray-500">Min</Label>
            <Input
              type="number"
              value={level.duration}
              onChange={(e) => onUpdate({ duration: +e.target.value })}
              className="text-sm h-8"
              min="1"
            />
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{level.duration}m</span>
          </div>
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  );
}
