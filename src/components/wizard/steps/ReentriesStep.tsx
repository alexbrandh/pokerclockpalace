
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus } from 'lucide-react';

interface ReentriesStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ReentriesStep({ data, onUpdate }: ReentriesStepProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Re-entries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowReentries">Permitir Re-entries</Label>
              <p className="text-sm text-gray-500">
                Los jugadores pueden volver a entrar después de ser eliminados
              </p>
            </div>
            <Switch
              id="allowReentries"
              checked={data.allowReentries || false}
              onCheckedChange={(checked) => handleChange('allowReentries', checked)}
            />
          </div>

          {data.allowReentries && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxReentriesPerPlayer">Máximo Re-entries por Jugador</Label>
                  <Input
                    id="maxReentriesPerPlayer"
                    type="number"
                    value={data.maxReentriesPerPlayer || 1}
                    onChange={(e) => handleChange('maxReentriesPerPlayer', +e.target.value)}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="reentryFee">Precio de Re-entry</Label>
                  <Input
                    id="reentryFee"
                    type="number"
                    value={data.reentryFee || 0}
                    onChange={(e) => handleChange('reentryFee', +e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add-ons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowAddons">Permitir Add-ons</Label>
              <p className="text-sm text-gray-500">
                Los jugadores pueden comprar fichas adicionales
              </p>
            </div>
            <Switch
              id="allowAddons"
              checked={data.allowAddons || false}
              onCheckedChange={(checked) => handleChange('allowAddons', checked)}
            />
          </div>

          {data.allowAddons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addonPrice">Precio del Add-on</Label>
                <Input
                  id="addonPrice"
                  type="number"
                  value={data.addonPrice || 0}
                  onChange={(e) => handleChange('addonPrice', +e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="addonChips">Fichas del Add-on</Label>
                <Input
                  id="addonChips"
                  type="number"
                  value={data.addonChips || 0}
                  onChange={(e) => handleChange('addonChips', +e.target.value)}
                  min="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
