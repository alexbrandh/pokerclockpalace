
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import { TournamentClock } from '@/components/TournamentClock'

export default function TournamentView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { joinTournament, currentTournament, isLoading, error } = useSupabaseTournament()
  const [showBackButton, setShowBackButton] = useState(true)

  useEffect(() => {
    if (id) {
      joinTournament(id).catch(console.error)
    }
  }, [id])

  useEffect(() => {
    // Hide back button when tournament is running (fullscreen mode)
    if (currentTournament?.isRunning && !currentTournament?.isPaused) {
      setShowBackButton(false)
    } else {
      setShowBackButton(true)
    }
  }, [currentTournament?.isRunning, currentTournament?.isPaused])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Cargando torneo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!currentTournament) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Torneo no encontrado</h2>
          <p className="text-gray-600 mb-6">El torneo que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Floating Back Button */}
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur hover:bg-white shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      )}

      {/* Tournament Clock */}
      <TournamentClock />
    </div>
  )
}
