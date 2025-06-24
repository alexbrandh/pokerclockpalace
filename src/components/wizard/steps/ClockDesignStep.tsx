
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette, Monitor, Upload, Maximize } from 'lucide-react';

interface ClockDesignStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ClockDesignStep({ data, onUpdate }: ClockDesignStepProps) {
  const themes = [
    { id: 'classic', name: 'Clásico', bg: 'bg-slate-800', text: 'text-white' },
    { id: 'modern', name: 'Moderno', bg: 'bg-blue-600', text: 'text-white' },
    { id: 'elegant', name: 'Elegante', bg: 'bg-purple-700', text: 'text-white' },
    { id: 'minimal', name: 'Minimalista', bg: 'bg-gray-100', text: 'text-gray-900' }
  ];

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const uploadLogo = () => {
    console.log('Upload logo');
    // Implementar upload de logo
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Diseño del Reloj
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Tema del Reloj</Label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={data.clockTheme === theme.id ? 'default' : 'outline'}
                  onClick={() => handleChange('clockTheme', theme.id)}
                  className="h-16 flex-col gap-2"
                >
                  <div className={`w-8 h-8 rounded ${theme.bg}`} />
                  <span className="text-sm">{theme.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Logo y Banner</Label>
            <div className="flex gap-3">
              <Button variant="outline" onClick={uploadLogo}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Logo
              </Button>
              <Button variant="outline" onClick={uploadLogo}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Banner
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Configuración de Layout</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="fullScreenMode">Modo Pantalla Completa</Label>
                <p className="text-sm text-gray-500">
                  Ocultar barras de navegación del navegador
                </p>
              </div>
              <Switch
                id="fullScreenMode"
                checked={data.fullScreenMode || false}
                onCheckedChange={(checked) => handleChange('fullScreenMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="secondScreenLayout">Layout Segunda Pantalla</Label>
                <p className="text-sm text-gray-500">
                  Optimizado para proyector o segunda pantalla
                </p>
              </div>
              <Switch
                id="secondScreenLayout"
                checked={data.secondScreenLayout || false}
                onCheckedChange={(checked) => handleChange('secondScreenLayout', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-gray-50 text-center">
            <div className="text-gray-500 mb-4">
              <Maximize className="w-12 h-12 mx-auto mb-2" />
              Vista previa del reloj
            </div>
            <p className="text-sm text-gray-600">
              Tema seleccionado: {themes.find(t => t.id === data.clockTheme)?.name || 'Clásico'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
