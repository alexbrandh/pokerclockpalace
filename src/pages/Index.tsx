
import React, { useState } from 'react';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { TournamentSetup } from '@/components/TournamentSetup';
import { TournamentClock } from '@/components/TournamentClock';

const Index = () => {
  const [tournamentStarted, setTournamentStarted] = useState(false);

  return (
    <TournamentProvider>
      <div className="min-h-screen">
        {!tournamentStarted ? (
          <TournamentSetup onTournamentCreated={() => setTournamentStarted(true)} />
        ) : (
          <TournamentClock />
        )}
      </div>
    </TournamentProvider>
  );
};

export default Index;
