
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error en la Aplicación
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
