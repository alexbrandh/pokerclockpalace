import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, Users, RefreshCw, Zap, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function RealtimeConnectionStatus() {
  const { realtimeConnection } = useSupabaseTournament()

  const getStatusColor = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return realtimeConnection.connectionQuality === 'excellent' ? 'bg-green-500' : 
               realtimeConnection.connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-orange-500'
      case 'connecting':
      case 'retrying':
      case 'syncing':
        return 'bg-blue-500 animate-pulse'
      case 'error':
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return realtimeConnection.connectionQuality === 'excellent' ? <Zap className="w-3 h-3" /> : <Wifi className="w-3 h-3" />
      case 'connecting':
      case 'retrying':
        return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'syncing':
        return <Clock className="w-3 h-3 animate-pulse" />
      default:
        return <WifiOff className="w-3 h-3" />
    }
  }

  const getStatusText = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return `Conectado (${realtimeConnection.connectionQuality})`
      case 'connecting':
        return 'Conectando...'
      case 'retrying':
        return `Reintentando (${realtimeConnection.reconnectAttempts})`
      case 'syncing':
        return 'Sincronizando...'
      case 'error':
        return 'Error de conexión'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Estado desconocido'
    }
  }

  const getTooltipContent = () => {
    const parts = [
      `Estado: ${getStatusText()}`,
      `Calidad: ${realtimeConnection.connectionQuality}`,
      `Usuarios conectados: ${realtimeConnection.connectedUsers}`,
      `Versión de sincronización: ${realtimeConnection.syncVersion}`
    ]

    if (realtimeConnection.lastPing) {
      parts.push(`Último ping: ${formatDistanceToNow(realtimeConnection.lastPing, { 
        addSuffix: true, 
        locale: es 
      })}`)
    }

    if (realtimeConnection.lastSync) {
      parts.push(`Última sincronización: ${formatDistanceToNow(realtimeConnection.lastSync, { 
        addSuffix: true, 
        locale: es 
      })}`)
    }

    if (realtimeConnection.reconnectAttempts > 0) {
      parts.push(`Intentos de reconexión: ${realtimeConnection.reconnectAttempts}`)
    }

    if (realtimeConnection.error) {
      parts.push(`Error: ${realtimeConnection.error}`)
    }

    return parts.join('\n')
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${getStatusColor()} text-white border-0 transition-all duration-300`}
            >
              {getStatusIcon()}
              <span className="ml-1 text-xs font-medium">
                {getStatusText()}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="whitespace-pre-line text-sm">
              {getTooltipContent()}
            </div>
          </TooltipContent>
        </Tooltip>

        {realtimeConnection.connectedUsers > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {realtimeConnection.connectedUsers}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{realtimeConnection.connectedUsers} usuario(s) conectado(s)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {realtimeConnection.reconnectAttempts > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="text-xs animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1" />
                {realtimeConnection.reconnectAttempts}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{realtimeConnection.reconnectAttempts} intento(s) de reconexión</p>
            </TooltipContent>
          </Tooltip>
        )}

        {(!realtimeConnection.isConnected || realtimeConnection.error) && (
          <Button
            size="sm"
            variant="outline"
            onClick={realtimeConnection.reconnect}
            className="text-xs px-2 py-1 h-6"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reconectar
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}