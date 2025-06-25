
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink, Copy } from 'lucide-react';

export function SupabaseSetup() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Configurar Base de Datos</CardTitle>
          <p className="text-gray-600">
            Para usar todas las funciones del sistema, necesitas configurar Supabase
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Paso 1: Crear Proyecto en Supabase</h3>
            <p className="text-blue-800 text-sm mb-3">
              Ve a Supabase y crea un nuevo proyecto configurado para México
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir a Supabase
              </a>
            </Button>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Paso 2: Obtener Credenciales</h3>
            <p className="text-green-800 text-sm mb-3">
              En tu proyecto de Supabase, ve a Settings → API y copia:
            </p>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• URL del proyecto</li>
              <li>• Clave pública (anon key)</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">Paso 3: Configurar Variables</h3>
            <p className="text-orange-800 text-sm mb-3">
              En Lovable, ve a configuración del proyecto y añade:
            </p>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border font-mono text-sm flex items-center justify-between">
                <span>VITE_SUPABASE_URL=tu_url_aqui</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard('VITE_SUPABASE_URL=')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-white p-2 rounded border font-mono text-sm flex items-center justify-between">
                <span>VITE_SUPABASE_ANON_KEY=tu_clave_aqui</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Paso 4: Crear Tablas</h3>
            <p className="text-purple-800 text-sm mb-3">
              Una vez configurado, el sistema creará automáticamente las tablas necesarias
            </p>
          </div>

          <div className="text-center">
            <Button onClick={() => window.location.reload()}>
              Verificar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
