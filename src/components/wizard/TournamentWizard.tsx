
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TournamentStructure } from '@/types/tournament';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { BuyInStructureStep } from './steps/BuyInStructureStep';
import { BlindStructureAdvancedStep } from './steps/BlindStructureAdvancedStep';
import { BreaksAndTimingStep } from './steps/BreaksAndTimingStep';
import { PayoutStructureStep } from './steps/PayoutStructureStep';

interface TournamentWizardProps {
  onTournamentCreated: (structure: TournamentStructure, city: string) => void;
}

export function TournamentWizard({ onTournamentCreated }: TournamentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<any>({
    // Basic Info
    name: 'Garage Poker League',
    city: '',
    tournament_date: '',
    currency: 'MXN',
    description: '',
    rules: '',
    min_players: 2,
    max_players: 100,
    
    // Buy-in Structure
    buyIn: 50,
    registration_fee: 0,
    reentryFee: 25,
    guaranteedPrizePool: 300,
    starting_chips: 10000,
    rebuy_allowed: false,
    rebuy_levels: 3,
    rebuy_stack: 10000,
    rebuy_cost: 50,
    addon_allowed: false,
    addon_levels: 3,
    addon_stack: 5000,
    addon_cost: 25,
    payout_percentage: 100,
    dealer_tip_percentage: 0,
    
    // Blind Structure
    blind_structure_type: 'standard',
    starting_blinds_sb: 25,
    starting_blinds_bb: 50,
    antes_start_level: 5,
    level_duration_type: 'fixed',
    default_level_duration: 20,
    levels: [
      { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: '3', smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
      { id: '4', smallBlind: 100, bigBlind: 200, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
    ],
    
    // Breaks and Timing
    break_frequency: 4,
    break_duration: 15,
    first_break_after: 4,
    late_registration_levels: 4,
    late_registration_minutes: 60,
    
    // Payout Structure
    tournament_type: 'regular',
    satellite_target: '',
    qualifier_seats: 1,
    payoutStructure: [50, 30, 20],
    
    // Legacy fields for compatibility
    breakAfterLevels: 4,
    initialStack: 10000
  });

  const WIZARD_STEPS = [
    'Información Básica',
    'Estructura de Buy-in',
    'Estructura de Ciegas',
    'Descansos y Tiempo',
    'Premios',
    'Confirmar'
  ];

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
      initialStack: wizardData.starting_chips || wizardData.initialStack,
      levels: wizardData.levels,
      breakAfterLevels: wizardData.break_frequency || wizardData.breakAfterLevels,
      payoutStructure: wizardData.payoutStructure
    };
    
    onTournamentCreated(tournamentStructure, wizardData.city);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return wizardData.name && wizardData.city;
      case 1:
        return wizardData.buyIn > 0;
      case 2:
        return wizardData.levels && wizardData.levels.length > 0;
      case 3:
        return true; // Breaks are optional
      case 4:
        return wizardData.payoutStructure && wizardData.payoutStructure.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep data={wizardData} onUpdate={updateWizardData} />;
      
      case 1:
        return <BuyInStructureStep data={wizardData} onUpdate={updateWizardData} />;
      
      case 2:
        return <BlindStructureAdvancedStep data={wizardData} onUpdate={updateWizardData} />;
        
      case 3:
        return <BreaksAndTimingStep data={wizardData} onUpdate={updateWizardData} />;
        
      case 4:
        return <PayoutStructureStep data={wizardData} onUpdate={updateWizardData} />;
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Confirmar Detalles del Torneo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Ciudad:</span> {wizardData.city}</p>
                  <p><span className="text-muted-foreground">Nombre:</span> {wizardData.name}</p>
                  <p><span className="text-muted-foreground">Fecha:</span> {wizardData.tournament_date || 'No especificada'}</p>
                  <p><span className="text-muted-foreground">Buy-in:</span> {wizardData.currency} {wizardData.buyIn}</p>
                  <p><span className="text-muted-foreground">Re-entry:</span> {wizardData.currency} {wizardData.reentryFee}</p>
                  <p><span className="text-muted-foreground">Prize Pool:</span> {wizardData.currency} {wizardData.guaranteedPrizePool}</p>
                  <p><span className="text-muted-foreground">Stack Inicial:</span> {wizardData.starting_chips?.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Estructura de Niveles</h4>
                <div className="space-y-1 text-sm">
                  {wizardData.levels.slice(0, 5).map((level: any, index: number) => (
                    <p key={level.id}>
                      <span className="text-muted-foreground">Nivel {index + 1}:</span> {
                        level.isBreak 
                          ? `Descanso ${level.duration}min`
                          : `${level.smallBlind}/${level.bigBlind} (${level.duration}min)`
                      }
                    </p>
                  ))}
                  {wizardData.levels.length > 5 && (
                    <p className="text-muted-foreground">...y {wizardData.levels.length - 5} niveles más</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Configuración de Recompras</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Recompra:</span> {wizardData.rebuy_allowed ? 'Permitida' : 'No permitida'}</p>
                  {wizardData.rebuy_allowed && (
                    <>
                      <p><span className="text-muted-foreground">Hasta nivel:</span> {wizardData.rebuy_levels}</p>
                      <p><span className="text-muted-foreground">Costo:</span> {wizardData.currency} {wizardData.rebuy_cost}</p>
                    </>
                  )}
                  <p><span className="text-muted-foreground">Add-on:</span> {wizardData.addon_allowed ? 'Permitido' : 'No permitido'}</p>
                  {wizardData.addon_allowed && (
                    <>
                      <p><span className="text-muted-foreground">Hasta nivel:</span> {wizardData.addon_levels}</p>
                      <p><span className="text-muted-foreground">Costo:</span> {wizardData.currency} {wizardData.addon_cost}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Premios</h4>
                <div className="space-y-1 text-sm">
                  {wizardData.payoutStructure.map((percentage: number, index: number) => (
                    <p key={index}>
                      <span className="text-muted-foreground">Lugar {index + 1}:</span> {percentage}%
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={finishWizard} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!canProceed()}
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
                disabled={!canProceed()}
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
