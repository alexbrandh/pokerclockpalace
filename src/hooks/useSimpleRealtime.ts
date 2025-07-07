import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface SimpleRealtimeState {
  isConnected: boolean
  status: 'connecting' | 'connected' | 'disconnected' | 'polling'
  error: string | null
  lastSync: number | null
}

interface UseSimpleRealtimeProps {
  tournamentId: string
  onStateUpdate: (payload: any) => void
  enabled?: boolean
}

export function useSimpleRealtime({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true 
}: UseSimpleRealtimeProps) {
  const [state, setState] = useState<SimpleRealtimeState>({
    isConnected: false,
    status: 'disconnected',
    error: null,
    lastSync: null
  })

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const failureCountRef = useRef(0)
  const usePollingRef = useRef(false)

  // Simple polling fallback
  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    
    console.log('📊 Starting polling fallback')
    setState(prev => ({ ...prev, status: 'polling' }))
    
    pollingRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_states')
          .select('*')
          .eq('tournament_id', tournamentId)
          .single()

        if (!error && data) {
          onStateUpdate({
            eventType: 'UPDATE',
            new: data,
            old: null
          })
          
          setState(prev => ({
            ...prev,
            lastSync: Date.now(),
            error: null
          }))
        }
      } catch (error) {
        console.warn('📊 Polling error:', error)
      }
    }, usePollingRef.current ? 1000 : 2000) // Faster when in problem mode
  }, [tournamentId, onStateUpdate])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Simple real-time connection
  const connect = useCallback(() => {
    if (!enabled || !tournamentId || usePollingRef.current) return

    console.log(`🔌 Connecting to tournament: ${tournamentId}`)
    setState(prev => ({ ...prev, status: 'connecting', error: null }))

    const channel = supabase
      .channel(`tournament_${tournamentId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: 'client' }
        }
      })
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tournament_states',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log('📡 Real-time update:', payload.eventType)
          onStateUpdate(payload)
          setState(prev => ({
            ...prev,
            lastSync: Date.now(),
            error: null
          }))
        }
      )
      .subscribe((status, error) => {
        console.log(`📡 Status: ${status}`)
        
        if (status === 'SUBSCRIBED') {
          failureCountRef.current = 0
          setState(prev => ({
            ...prev,
            isConnected: true,
            status: 'connected',
            error: null
          }))
          
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          failureCountRef.current++
          const errorMessage = error?.message || 'Connection failed'
          
          setState(prev => ({
            ...prev,
            isConnected: false,
            status: 'disconnected',
            error: errorMessage
          }))

          // Switch to polling after 3 failures
          if (failureCountRef.current >= 3) {
            console.log('⚠️ Switching to polling mode after failures')
            usePollingRef.current = true
            startPolling()
          }
        }
      })

    channelRef.current = channel
  }, [enabled, tournamentId, onStateUpdate, startPolling])

  // Manual reconnection
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection')
    
    // Reset failure state
    failureCountRef.current = 0
    usePollingRef.current = false
    
    // Cleanup
    stopPolling()
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
    
    // Reconnect
    connect()
  }, [connect, stopPolling])

  // Initialize connection
  useEffect(() => {
    if (enabled && tournamentId) {
      connect()
    }
    
    return () => {
      stopPolling()
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [enabled, tournamentId])

  return {
    ...state,
    reconnect
  }
}