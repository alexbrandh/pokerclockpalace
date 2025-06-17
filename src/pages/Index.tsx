
import React from 'react';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { TournamentClock } from '@/components/TournamentClock';

const Index = () => {
  return (
    <TournamentProvider>
      <div className="min-h-screen">
        <TournamentClock />
      </div>
    </TournamentProvider>
  );
};

export default Index;
