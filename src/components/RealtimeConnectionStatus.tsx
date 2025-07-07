import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react'

export function RealtimeConnectionStatus() {
  const { realtimeConnection } = useSupabaseTournament()

  const getStatusColor = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-blue-500 animate-pulse'
      case 'polling':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return <Zap className="w-3 h-3" />
      case 'connecting':
        return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'polling':
        return <Wifi className="w-3 h-3" />
      default:
        return <WifiOff className="w-3 h-3" />
    }
  }

  const getStatusText = () => {
    switch (realtimeConnection.status) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'polling':
        return 'Modo Respaldo'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Estado desconocido'
    }
  }

  const getTooltipContent = () => {
    const parts = [`Estado: ${getStatusText()}`]

    if (realtimeConnection.lastSync) {
      const timeAgo = Math.floor((Date.now() - realtimeConnection.lastSync) / 1000)
      parts.push(`Última sincronización: hace ${timeAgo}s`)
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