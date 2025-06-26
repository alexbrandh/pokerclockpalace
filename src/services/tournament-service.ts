
import { TournamentStructure, TournamentState } from '@/types/tournament'
import { Tournament } from '@/types/tournament-context'
import { RealtimeChannel } from '@supabase/supabase-js'
import { TournamentCreationService } from './tournament-creation.service'
import { TournamentLoadingService } from './tournament-loading.service'
import { TournamentJoiningService } from './tournament-joining.service'
import { TournamentStateUpdateService } from './tournament-state-update.service'
import { TournamentDeletionService } from './tournament-deletion.service'

export class TournamentService {
  static async createTournament(structure: TournamentStructure, city: string): Promise<string> {
    return TournamentCreationService.createTournament(structure, city);
  }

  static async loadTournaments(): Promise<Tournament[]> {
    return TournamentLoadingService.loadTournaments();
  }

  static async joinTournament(tournamentId: string): Promise<{ tournament: TournamentState, channel?: RealtimeChannel }> {
    return TournamentJoiningService.joinTournament(tournamentId);
  }

  static async updateTournamentState(tournamentId: string, updates: Partial<TournamentState>): Promise<void> {
    return TournamentStateUpdateService.updateTournamentState(tournamentId, updates);
  }

  static async deleteTournament(tournamentId: string): Promise<void> {
    return TournamentDeletionService.deleteTournament(tournamentId);
  }
}
