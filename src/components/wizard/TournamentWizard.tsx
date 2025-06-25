
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TournamentStructure } from '@/types/tournament';

interface TournamentWizardProps {
  onTournamentCreated: (structure: TournamentStructure, city: string) => void;
}

export function TournamentWizard({ onTournamentCreated }: TournamentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [city, setCity] = useState('');
  const [wizardData, setWizardData] = useState<Partial<TournamentStructure> & any>({
    name: 'Garage Poker League',
    buyIn: 50,
    reentryFee: 25,
    guaranteedPrizePool: 300,
    initialStack: 10000,
    levels: [
      { id: '1', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
      { id: '3', smallBlind: 100, bigBlind: 200, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
    ],
    breakAfterLevels: 3,
    payoutStructure: [50, 30, 20]
  });

  // Simplified wizard with just basic info and city selection
  const WIZARD_STEPS = ['Información Básica', 'Confirmar'];

  const updateWizardData = (stepData: any) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  };

  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishWizard = () => {
    const tournamentStructure: TournamentStructure = {
      id: '',
      name: wizardData.name,
      buyIn: wizardData.buyIn,
      reentryFee: wizardData.reentryFee,
      guaranteedPrizePool: wizardData.guaranteedPrizePool,
      initialStack: wizardData.initialStack,
      levels: wizardData.levels,
      breakAfterLevels: wizardData.breakAfterLevels,
      payoutStructure: wizardData.payoutStructure
    };
    
    onTournamentCreated(tournamentStructure, city);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="city">Ciudad/Sala</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ej. Ciudad de México, Guadalajara, Sala Central..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="name">Nombre del Torneo</Label>
              <Input
                id="name"
                value={wizardData.name}
                onChange={(e) => updateWizardData({ name: e.target.value })}
                placeholder="ej. Torneo Nocturno, MTT Domingo..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyIn">Buy-in ($)</Label>
                <Input
                  id="buyIn"
                  type="number"
                  value={wizardData.buyIn}
                  onChange={(e) => updateWizardData({ buyIn: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="reentryFee">Re-entry ($)</Label>
                <Input
                  id="reentryFee"
                  type="number"
                  value={wizardData.reentryFee}
                  onChange={(e) => updateWizardData({ reentryFee: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guaranteedPrizePool">Prize Pool Garantizado ($)</Label>
                <Input
                  id="guaranteedPrizePool"
                  type="number"
                  value={wizardData.guaranteedPrizePool}
                  onChange={(e) => updateWizardData({ guaranteedPrizePool: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="initialStack">Stack Inicial</Label>
                <Input
                  id="initialStack"
                  type="number"
                  value={wizardData.initialStack}
                  onChange={(e) => updateWizardData({ initialStack: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Confirmar Detalles del Torneo</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Ciudad:</span> {city}</p>
                  <p><span className="text-gray-600">Nombre:</span> {wizardData.name}</p>
                  <p><span className="text-gray-600">Buy-in:</span> ${wizardData.buyIn}</p>
                  <p><span className="text-gray-600">Re-entry:</span> ${wizardData.reentryFee}</p>
                  <p><span className="text-gray-600">Prize Pool:</span> ${wizardData.guaranteedPrizePool}</p>
                  <p><span className="text-gray-600">Stack Inicial:</span> {wizardData.initialStack.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Estructura de Niveles</h4>
                <div className="space-y-1 text-sm">
                  {wizardData.levels.slice(0, 5).map((level: any, index: number) => (
                    <p key={level.id}>
                      <span className="text-gray-600">Nivel {index + 1}:</span> {
                        level.isBreak 
                          ? `Descanso ${level.duration}min`
                          : `${level.smallBlind}/${level.bigBlind} (${level.duration}min)`
                      }
                    </p>
                  ))}
                  {wizardData.levels.length > 5 && (
                    <p className="text-gray-500">...y {wizardData.levels.length - 5} niveles más</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={finishWizard} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!city.trim()}
              >
                Crear Torneo
              </Button>
            </div>
          </div>
        );
      
      default:
        return <div>Step not implemented</div>;
    }
  };

  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuración de Torneo - {WIZARD_STEPS[currentStep]}</span>
            <span className="text-sm font-normal text-gray-500">
              Paso {currentStep + 1} de {WIZARD_STEPS.length}
            </span>
          </CardTitle>
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <div className="ml-auto">
                {/* Create button is in the step content */}
              </div>
            ) : (
              <Button 
                onClick={goToNextStep}
                disabled={currentStep === 0 && !city.trim()}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
