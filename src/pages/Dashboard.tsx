
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Play, Pause, Users, Trophy, Clock, QrCode } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
  const navigate = useNavigate()
  const { tournaments, isLoading, error, loadTournaments, joinTournament } = useSupabaseTournament()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'finished'>('all')

  useEffect(() => {
    loadTournaments()
  }, [])

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.access_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await joinTournament(tournamentId)
      navigate(`/tournament/${tournamentId}`)
    } catch (error) {
      console.error('Error joining tournament:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'created': 'outline',
      'active': 'default',
      'paused': 'secondary',
      'finished': 'destructive'
    }
    
    const labels: Record<string, string> = {
      'created': 'Creado',
      'active': 'Activo',
      'paused': 'Pausado',
      'finished': 'Terminado'
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'finished':
        return <Trophy className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading && tournaments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando torneos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Torneos
          </h1>
          <p className="text-gray-600">
            Gestiona y supervisa todos tus torneos de poker
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, ciudad o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'active', 'paused', 'finished'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as any)}
              >
                {status === 'all' ? 'Todos' : 
                 status === 'active' ? 'Activos' :
                 status === 'paused' ? 'Pausados' : 'Terminados'}
              </Button>
            ))}
          </div>

          <Button onClick={() => navigate('/tournament/new')} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Torneo
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tournaments Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No se encontraron torneos' : 'No hay torneos creados'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer torneo para comenzar'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => navigate('/tournament/new')} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Torneo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{tournament.name}</CardTitle>
                      <p className="text-sm text-gray-600">{tournament.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tournament.status)}
                      {getStatusBadge(tournament.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Tournament Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Buy-in</p>
                      <p className="font-semibold">${tournament.buy_in}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prize Pool</p>
                      <p className="font-semibold">${tournament.guaranteed_prize_pool}</p>
                    </div>
                  </div>

                  {/* Access Code */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-xs text-gray-500">Código de Acceso</p>
                      <p className="font-mono font-bold text-lg">{tournament.access_code}</p>
                    </div>
                    <QrCode className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Created Info */}
                  <div className="text-xs text-gray-500">
                    Creado {formatDistanceToNow(new Date(tournament.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleJoinTournament(tournament.id)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Supervisar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
