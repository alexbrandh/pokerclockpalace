import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RobustRealtimeState {
  isConnected: boolean
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'retrying' | 'syncing'
  error: string | null
  reconnectAttempts: number
  lastPing: number | null
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline'
  connectedUsers: number
  lastSync: number | null
  syncVersion: number
}

interface UseRobustRealtimeProps {
  tournamentId: string
  onStateUpdate: (payload: any) => void
  enabled?: boolean
}

export function useRobustRealtime({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true 
}: UseRobustRealtimeProps) {
  const [connectionState, setConnectionState] = useState<RobustRealtimeState>({
    isConnected: false,
    status: 'disconnected',
    error: null,
    reconnectAttempts: 0,
    lastPing: null,
    connectionQuality: 'offline',
    connectedUsers: 0,
    lastSync: null,
    syncVersion: 0
  })

  // Refs for persistent connection management
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingFallbackRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isConnectingRef = useRef(false)
  const pingTimesRef = useRef<number[]>([])
  const lastSuccessfulConnectionRef = useRef<number>(0)

  // Robust configuration - no limits, fast recovery
  const baseDelay = 300
  const maxDelay = 5000
  const heartbeatInterval = 5000 // 5 seconds
  const pollingInterval = 1000 // 1 second ultra-fast fallback
  const maxPingHistory = 10

  // Calculate connection quality from ping history
  const calculateQuality = useCallback((pings: number[]) => {
    if (pings.length === 0) return 'offline'
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length
    if (avg < 50) return 'excellent'
    if (avg < 150) return 'good'
    return 'poor'
  }, [])

  // Store ping measurement
  const recordPing = useCallback((time: number) => {
    pingTimesRef.current = [...pingTimesRef.current.slice(-maxPingHistory + 1), time]
    const quality = calculateQuality(pingTimesRef.current)
    
    setConnectionState(prev => ({
      ...prev,
      lastPing: Date.now(),
      connectionQuality: quality
    }))
  }, [calculateQuality])

  // Robust heartbeat system
  const startHeartbeat = useCallback(() => {
    console.log('💓 Starting robust heartbeat')
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!channelRef.current || !connectionState.isConnected) return

      const pingStart = Date.now()
      
      try {
        // Use presence as heartbeat
        await channelRef.current.track({
          user_id: `timer_${Date.now()}`,
          ping_time: pingStart,
          tournament_id: tournamentId,
          last_seen: new Date().toISOString()
        })

        const pingTime = Date.now() - pingStart
        recordPing(pingTime)
        console.log(`💓 Heartbeat: ${pingTime}ms`)

      } catch (error) {
        console.warn('💔 Heartbeat failed:', error)
        
        // If heartbeat fails 3 times, trigger reconnection
        setConnectionState(prev => ({
          ...prev,
          connectionQuality: 'poor',
          error: 'Heartbeat failed'
        }))
        
        // Trigger immediate reconnection on heartbeat failure
        setTimeout(() => {
          if (connectionState.isConnected) {
            console.log('💔 Heartbeat failure - triggering reconnection')
            reconnect()
          }
        }, 1000)
      }
    }, heartbeatInterval)
  }, [connectionState.isConnected, tournamentId, recordPing])

  // Ultra-fast polling fallback
  const startPollingFallback = useCallback(() => {
    console.log('📊 Starting ultra-fast polling fallback')
    
    pollingFallbackRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_states')
          .select('*')
          .eq('tournament_id', tournamentId)
          .single()

        if (!error && data) {
          console.log('📡 Polling update received')
          onStateUpdate({
            eventType: 'UPDATE',
            new: data,
            old: null
          })
          
          setConnectionState(prev => ({
            ...prev,
            lastSync: Date.now(),
            syncVersion: prev.syncVersion + 1
          }))
        }
      } catch (error) {
        console.warn('📊 Polling error:', error)
      }
    }, pollingInterval)
  }, [tournamentId, onStateUpdate])

  // Comprehensive cleanup
  const cleanup = useCallback(() => {
    console.log('🧹 Robust cleanup')
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    if (pollingFallbackRef.current) {
      clearInterval(pollingFallbackRef.current)
      pollingFallbackRef.current = null
    }

    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe()
      } catch (error) {
        console.warn('Cleanup warning:', error)
      }
      channelRef.current = null
    }

    isConnectingRef.current = false
    pingTimesRef.current = []
  }, [])

  // Robust connection with unlimited retries
  const connect = useCallback(() => {
    if (!enabled || !tournamentId || isConnectingRef.current) {
      return
    }

    isConnectingRef.current = true
    cleanup()

    console.log(`🚀 Robust connection attempt ${reconnectAttemptsRef.current + 1} for: ${tournamentId}`)
    
    setConnectionState(prev => ({
      ...prev,
      status: reconnectAttemptsRef.current > 0 ? 'retrying' : 'connecting',
      error: null,
      reconnectAttempts: reconnectAttemptsRef.current
    }))

    try {
      const channel = supabase
        .channel(`robust_tournament_${tournamentId}_${Date.now()}`, {
          config: {
            broadcast: { self: false },
            presence: { key: `timer_${tournamentId}` },
            private: false
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
            console.log('📡 Real-time update received:', payload.eventType)
            onStateUpdate(payload)
            
            setConnectionState(prev => ({
              ...prev,
              lastSync: Date.now(),
              syncVersion: prev.syncVersion + 1
            }))
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          const userCount = Object.keys(state).length
          
          setConnectionState(prev => ({
            ...prev,
            connectedUsers: userCount
          }))
          
          console.log(`👥 ${userCount} users connected`)
        })
        .subscribe(async (status, error) => {
          console.log(`📡 Subscription status: ${status}`)
          isConnectingRef.current = false
          
          if (status === 'SUBSCRIBED') {
            reconnectAttemptsRef.current = 0
            lastSuccessfulConnectionRef.current = Date.now()
            
            // Stop polling fallback when real-time is working
            if (pollingFallbackRef.current) {
              clearInterval(pollingFallbackRef.current)
              pollingFallbackRef.current = null
            }
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              status: 'connected',
              error: null,
              reconnectAttempts: 0,
              connectionQuality: 'excellent',
              lastPing: Date.now()
            }))
            
            console.log('✅ Robust real-time connection established')
            
            // Start heartbeat
            startHeartbeat()
            
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            const errorMessage = error?.message || `Connection ${status.toLowerCase()}`
            console.error(`❌ Connection error: ${errorMessage}`)
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'error',
              error: errorMessage,
              connectionQuality: 'offline',
              reconnectAttempts: reconnectAttemptsRef.current
            }))
            
            // Start polling immediately as fallback
            startPollingFallback()
            
            // Schedule reconnection with exponential backoff + jitter
            reconnectAttemptsRef.current++
            const jitter = Math.random() * 500
            const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1) + jitter, maxDelay)
            
            console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current})`)
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, delay)
            
          } else if (status === 'CLOSED') {
            console.log('📪 Connection closed')
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'disconnected',
              connectionQuality: 'offline'
            }))
            
            // Start polling immediately
            startPollingFallback()
            
            // Attempt immediate reconnection
            setTimeout(() => connect(), 1000)
          }
        })

      channelRef.current = channel
      
    } catch (error) {
      console.error('❌ Connection failed:', error)
      isConnectingRef.current = false
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: errorMessage,
        connectionQuality: 'offline',
        reconnectAttempts: reconnectAttemptsRef.current
      }))
      
      // Start polling as fallback
      startPollingFallback()
      
      // Schedule reconnection
      reconnectAttemptsRef.current++
      const jitter = Math.random() * 500
      const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1) + jitter, maxDelay)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [enabled, tournamentId, onStateUpdate, cleanup, startHeartbeat, startPollingFallback])

  // Manual reconnection
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested')
    reconnectAttemptsRef.current = 0
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
      status: 'disconnected'
    }))
    
    connect()
  }, [connect])

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && tournamentId) {
      connect()
    }
    
    return cleanup
  }, [enabled, tournamentId]) // Minimal dependencies to avoid loops

  // Enhanced visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        console.log('👁️ Page visible - checking connection')
        
        // If we haven't been connected for more than 10 seconds, force reconnect
        const timeSinceLastConnection = Date.now() - lastSuccessfulConnectionRef.current
        if (!connectionState.isConnected || timeSinceLastConnection > 10000) {
          reconnect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, tournamentId, connectionState.isConnected, reconnect])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online - reconnecting')
      reconnect()
    }

    const handleOffline = () => {
      console.log('🌐 Network offline - starting polling mode')
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'disconnected',
        connectionQuality: 'offline',
        error: 'Network offline'
      }))
      
      // Start aggressive polling during offline
      startPollingFallback()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [reconnect, startPollingFallback])

  // Connection health monitoring
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      if (connectionState.isConnected) {
        const timeSinceLastPing = connectionState.lastPing ? Date.now() - connectionState.lastPing : Infinity
        
        // If no ping for more than 15 seconds, consider connection dead
        if (timeSinceLastPing > 15000) {
          console.log('💀 Connection appears dead - triggering reconnection')
          reconnect()
        }
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(healthCheckInterval)
  }, [connectionState.isConnected, connectionState.lastPing, reconnect])

  return {
    ...connectionState,
    reconnect
  }
}