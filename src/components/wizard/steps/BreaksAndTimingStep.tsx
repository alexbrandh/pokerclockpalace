import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Clock, Timer } from 'lucide-react';

interface BreaksAndTimingStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BreaksAndTimingStep({ data, onUpdate }: BreaksAndTimingStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Configuración de Descansos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="break_frequency">Descanso cada X niveles</Label>
              <Input
                id="break_frequency"
                type="number"
                value={data.break_frequency || 4}
                onChange={(e) => handleChange('break_frequency', +e.target.value)}
                min="2"
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="break_duration">Duración del Descanso (min)</Label>
              <Input
                id="break_duration"
                type="number"
                value={data.break_duration || 15}
                onChange={(e) => handleChange('break_duration', +e.target.value)}
                min="5"
                max="60"
              />
            </div>
            <div>
              <Label htmlFor="first_break_after">Primer Descanso después del Nivel</Label>
              <Input
                id="first_break_after"
                type="number"
                value={data.first_break_after || 4}
                onChange={(e) => handleChange('first_break_after', +e.target.value)}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Vista Previa de Descansos</h4>
            <div className="text-sm text-muted-foreground">
              <p>• Primer descanso: Después del nivel {data.first_break_after || 4}</p>
              <p>• Siguientes descansos: Cada {data.break_frequency || 4} niveles</p>
              <p>• Duración: {data.break_duration || 15} minutos cada uno</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Registro Tardío
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="late_registration_levels">Permitir hasta el Nivel</Label>
              <Input
                id="late_registration_levels"
                type="number"
                value={data.late_registration_levels || 4}
                onChange={(e) => handleChange('late_registration_levels', +e.target.value)}
                min="1"
                max="20"
              />
            </div>
            <div>
              <Label htmlFor="late_registration_minutes">O hasta X minutos después del inicio</Label>
              <Input
                id="late_registration_minutes"
                type="number"
                value={data.late_registration_minutes || 60}
                onChange={(e) => handleChange('late_registration_minutes', +e.target.value)}
                min="15"
                max="300"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Política de Registro Tardío Unificada
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p>Se aplica a todos los conceptos:</p>
              <p>• Buy-in inicial hasta nivel {data.late_registration_levels || 4}</p>
              <p>• Re-entry/Re-buy hasta nivel {data.late_registration_levels || 4}</p>
              <p>• Add-on hasta nivel {data.late_registration_levels || 4}</p>
              <p className="mt-2 font-medium">O {data.late_registration_minutes || 60} minutos después del inicio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configuración de Tiempo Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="color_up_time">Tiempo para Color Up (min)</Label>
            <Input
              id="color_up_time"
              type="number"
              value={data.color_up_time || 5}
              onChange={(e) => handleChange('color_up_time', +e.target.value)}
              min="2"
              max="15"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Tiempo adicional para cambiar fichas de menor denominación
            </p>
          </div>

          <div>
            <Label htmlFor="end_of_level_warning">Aviso de fin de nivel (min antes)</Label>
            <Input
              id="end_of_level_warning"
              type="number"
              value={data.end_of_level_warning || 2}
              onChange={(e) => handleChange('end_of_level_warning', +e.target.value)}
              min="1"
              max="10"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Tiempo de aviso antes de que termine el nivel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}