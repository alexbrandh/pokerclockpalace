
import { Tournament } from '@/types/tournament-context'

export const mockTournaments: Tournament[] = [
  {
    id: 'demo-1',
    name: 'Torneo Demo - Sit & Go',
    buy_in: 100,
    reentry_fee: 100,
    guaranteed_prize_pool: 1000,
    initial_stack: 10000,
    levels: [
      { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 20, isBreak: false },
      { id: '2', smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
      { id: 'break1', smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true, breakDuration: 15 },
      { id: '3', smallBlind: 75, bigBlind: 150, ante: 25, duration: 20, isBreak: false },
    ],
    break_after_levels: 2,
    payout_structure: [50, 30, 20],
    status: 'created',
    created_by: 'demo-user',
    created_at: new Date().toISOString(),
    city: 'Ciudad de México',
    access_code: 'DEMO01'
  }
];
