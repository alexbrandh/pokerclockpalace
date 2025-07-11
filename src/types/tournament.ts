
export interface TournamentLevel {
  id: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in minutes
  isBreak: boolean;
  breakDuration?: number;
  colorUpAmount?: number;
  colorUpFrom?: string;
}

export interface TournamentStructure {
  id: string;
  name: string;
  buyIn: number;
  reentryFee: number;
  guaranteedPrizePool: number;
  initialStack: number; // New field for initial stack per player
  levels: TournamentLevel[];
  breakAfterLevels: number;
  payoutStructure: number[]; // percentages
}

export interface TournamentState {
  id: string;
  structure: TournamentStructure;
  currentLevelIndex: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  players: number;
  entries: number;
  reentries: number;
  currentPrizePool: number;
  startTime?: number;
}

export interface TournamentStats {
  totalChips: number;
  averageStack: number;
  averageStackInBBs: number;
  playersRemaining: number;
}
