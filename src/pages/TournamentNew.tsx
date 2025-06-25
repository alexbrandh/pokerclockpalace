
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext'
import { TournamentWizard } from '@/components/wizard/TournamentWizard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TournamentNew() {
  const navigate = useNavigate()
  const { createTournament } = useSupabaseTournament()

  const handleTournamentCreated = async (structure: any, city: string) => {
    try {
      const tournamentId = await createTournament(structure, city)
      navigate(`/tournament/${tournamentId}`)
    } catch (error) {
      console.error('Error creating tournament:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Torneo
          </h1>
          <p className="text-gray-600">
            Configura la estructura y detalles de tu torneo
          </p>
        </div>

        {/* Tournament Wizard */}
        <div className="bg-white rounded-lg shadow-sm">
          <TournamentWizard onTournamentCreated={handleTournamentCreated} />
        </div>
      </div>
    </div>
  )
}
