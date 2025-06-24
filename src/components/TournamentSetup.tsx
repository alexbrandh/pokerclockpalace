
import React from 'react';
import { TournamentWizard } from './wizard/TournamentWizard';

interface TournamentSetupProps {
  onTournamentCreated: () => void;
}

export function TournamentSetup({ onTournamentCreated }: TournamentSetupProps) {
  return <TournamentWizard onTournamentCreated={onTournamentCreated} />;
}
