
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Save, Download, Upload, ExternalLink, Play } from 'lucide-react';

interface FinalStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onFinish: () => void;
}

export function FinalStep({ data, onUpdate, onFinish }: FinalStepProps) {
  const [templateName, setTemplateName] = React.useState('');

  const saveAsTemplate = () => {
    console.log('Saving template:', templateName, data);
    // Implementar guardado de plantilla
  };

  const exportTemplate = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tournament-${data.name || 'template'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            onUpdate(importedData);
          } catch (error) {
            console.error('Error importing template:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const configSummary = [
    { label: 'Nombre del Torneo', value: data.name || 'Sin nombre' },
    { label: 'Buy-in', value: `$${data.buyIn || 0}` },
    { label: 'Stack Inicial', value: data.initialStack || 0 },
    { label: 'Niveles', value: data.levels?.length || 0 },
    { label: 'Prize Pool', value: `$${data.guaranteedPrizePool || 0}` },
    { label: 'Re-entries', value: data.allowReentries ? 'Sí' : 'No' },
    { label: 'Add-ons', value: data.allowAddons ? 'Sí' : 'No' },
    { label: 'Seguimiento', value: data.trackPlayers ? 'Sí' : 'No' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Configuración Completa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {configSummary.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{item.label}:</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nombre de la plantilla"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveAsTemplate} disabled={!templateName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={exportTemplate} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Exportar Configuración
            </Button>
            <Button variant="outline" onClick={importTemplate} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Importar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Al crear este torneo, aceptas los términos y condiciones de uso de la aplicación.
          </p>
          <Button variant="link" className="p-0 h-auto">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Términos y Condiciones
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onFinish} size="lg" className="px-8">
          <Play className="w-5 h-5 mr-2" />
          Iniciar Torneo
        </Button>
      </div>
    </div>
  );
}
