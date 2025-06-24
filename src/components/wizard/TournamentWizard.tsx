
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TournamentStructure } from '@/types/tournament';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentInfoStep } from './steps/TournamentInfoStep';
import { ReentriesStep } from './steps/ReentriesStep';
import { BlindStructureStep } from './steps/BlindStructureStep';

interface TournamentWizardProps {
  onTournamentCreated: () => void;
}

const WIZARD_STEPS = [
  'Tournament Info',
  'Re-entries & Add-ons',
  'Blind Structure',
  'Prize Distribution',
  'Chip Denominations',
  'Clock Design',
  'Players & Bounties',
  'Sounds',
  'Final'
];

export function TournamentWizard({ onTournamentCreated }: TournamentWizardProps) {
  const { createTournament } = useTournament();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<TournamentStructure> & any>({
    name: 'Garage Poker League',
    location: '',
    currency: 'USD',
    buyIn: 50,
    reentryFee: 25,
    guaranteedPrizePool: 300,
    initialStack: 10000,
    allowReentries: true,
    maxReentriesPerPlayer: 3,
    allowAddons: false,
    addonPrice: 0,
    addonChips: 0,
    levels: [
      { id: '1', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
      { id: '3', smallBlind: 100, bigBlind: 200, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 }
    ],
    breakAfterLevels: 3,
    payoutStructure: [50, 30, 20]
  });

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
    
    createTournament(tournamentStructure);
    onTournamentCreated();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TournamentInfoStep data={wizardData} onUpdate={updateWizardData} />;
      case 1:
        return <ReentriesStep data={wizardData} onUpdate={updateWizardData} />;
      case 2:
        return <BlindStructureStep data={wizardData} onUpdate={updateWizardData} />;
      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Paso {currentStep + 1} - {WIZARD_STEPS[currentStep]}</h3>
            <p className="text-gray-600">Este paso será implementado próximamente.</p>
          </div>
        );
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
              <Button onClick={finishWizard} className="ml-auto">
                Crear Torneo
              </Button>
            ) : (
              <Button onClick={goToNextStep}>
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
