import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface EnhancedRealtimeConnectionState {
  isConnected: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'retrying' | 'syncing';
  error: string | null;
  reconnectAttempts: number;
  lastError: string | null;
  lastPing: number | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  connectedUsers: number;
  lastSync: number | null;
  offlineChanges: any[];
  syncVersion: number;
}

interface UseEnhancedSupabaseRealtimeProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
  enabled?: boolean;
}

export function useEnhancedSupabaseRealtime({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true 
}: UseEnhancedSupabaseRealtimeProps) {
  const [connectionState, setConnectionState] = useState<EnhancedRealtimeConnectionState>({
    isConnected: false,
    status: 'disconnected',
    error: null,
    reconnectAttempts: 0,
    lastError: null,
    lastPing: null,
    connectionQuality: 'offline',
    connectedUsers: 0,
    lastSync: null,
    offlineChanges: [],
    syncVersion: 0
  });

  // Refs for managing connection lifecycle
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const lastPingTimeRef = useRef<number | null>(null);
  const pingResponseTimesRef = useRef<number[]>([]);
  
  // Enhanced configuration
  const maxReconnectAttempts = 10; // Increased from 3
  const baseDelay = 500; // Reduced for faster recovery
  const heartbeatInterval = 10000; // 10 seconds
  const pingTimeout = 5000; // 5 second timeout for pings

  // Store offline changes for later sync
  const addOfflineChange = useCallback((change: any) => {
    setConnectionState(prev => ({
      ...prev,
      offlineChanges: [...prev.offlineChanges, {
        ...change,
        timestamp: Date.now(),
        version: prev.syncVersion + 1
      }]
    }));
  }, []);

  // Calculate connection quality based on ping times
  const calculateConnectionQuality = useCallback((pingTimes: number[]) => {
    if (pingTimes.length === 0) return 'offline';
    
    const avgPing = pingTimes.reduce((sum, time) => sum + time, 0) / pingTimes.length;
    
    if (avgPing < 100) return 'excellent';
    if (avgPing < 300) return 'good';
    return 'poor';
  }, []);

  // Enhanced heartbeat with ping measurement
  const startHeartbeat = useCallback(() => {
    console.log('💓 Starting enhanced heartbeat system');
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!channelRef.current || !connectionState.isConnected) return;

      const pingStart = Date.now();
      lastPingTimeRef.current = pingStart;
      
      try {
        // Send a presence update as ping
        await channelRef.current.track({ 
          ping: pingStart,
          user_id: 'timer_client',
          last_seen: new Date().toISOString()
        });

        const pingTime = Date.now() - pingStart;
        pingResponseTimesRef.current = [...pingResponseTimesRef.current.slice(-9), pingTime]; // Keep last 10
        
        const quality = calculateConnectionQuality(pingResponseTimesRef.current);
        
        setConnectionState(prev => ({
          ...prev,
          lastPing: Date.now(),
          connectionQuality: quality
        }));
        
        console.log(`💓 Heartbeat: ${pingTime}ms (${quality})`);
        
      } catch (error) {
        console.warn('💔 Heartbeat failed:', error);
        
        // If heartbeat fails, consider connection unstable
        setConnectionState(prev => ({
          ...prev,
          connectionQuality: 'poor',
          error: 'Connection unstable'
        }));
        
        // Trigger reconnection if multiple heartbeats fail
        const now = Date.now();
        if (lastPingTimeRef.current && (now - lastPingTimeRef.current) > pingTimeout * 2) {
          console.log('💔 Multiple heartbeat failures, triggering reconnection');
          reconnect();
        }
      }
    }, heartbeatInterval);
  }, [connectionState.isConnected, calculateConnectionQuality]);

  // Sync offline changes when reconnected
  const syncOfflineChanges = useCallback(async () => {
    if (connectionState.offlineChanges.length === 0) return;
    
    console.log(`🔄 Syncing ${connectionState.offlineChanges.length} offline changes`);
    
    setConnectionState(prev => ({ ...prev, status: 'syncing' }));
    
    try {
      // Sort changes by timestamp and apply them
      const sortedChanges = [...connectionState.offlineChanges].sort((a, b) => a.timestamp - b.timestamp);
      
      for (const change of sortedChanges) {
        // Apply change to database
        const { data, error } = await supabase
          .from('tournament_states')
          .update(change.data)
          .eq('tournament_id', tournamentId)
          .select()
          .single();
          
        if (error) {
          console.error('❌ Failed to sync change:', error);
          throw error;
        }
        
        console.log('✅ Synced offline change:', change);
      }
      
      // Clear offline changes after successful sync
      setConnectionState(prev => ({
        ...prev,
        offlineChanges: [],
        status: 'connected',
        lastSync: Date.now(),
        syncVersion: prev.syncVersion + sortedChanges.length
      }));
      
    } catch (error) {
      console.error('❌ Failed to sync offline changes:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        status: 'connected',
        error: 'Failed to sync some offline changes'
      }));
    }
  }, [connectionState.offlineChanges, tournamentId]);

  // Enhanced cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Enhanced cleanup of realtime connection');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
      } catch (error) {
        console.warn('Warning during channel cleanup:', error);
      }
      channelRef.current = null;
    }

    isConnectingRef.current = false;
    pingResponseTimesRef.current = [];
    lastPingTimeRef.current = null;
  }, []);

  // Enhanced connection function
  const connect = useCallback(() => {
    if (!enabled || !tournamentId || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;
    cleanup();

    console.log(`🚀 Enhanced connection attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts} for tournament: ${tournamentId}`);
    
    setConnectionState(prev => ({
      ...prev,
      status: reconnectAttemptsRef.current > 0 ? 'retrying' : 'connecting',
      error: null,
      reconnectAttempts: reconnectAttemptsRef.current
    }));

    try {
      const channel = supabase
        .channel(`enhanced_tournament_${tournamentId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: tournamentId },
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
            console.log('📡 Enhanced real-time update received:', payload.eventType);
            setConnectionState(prev => ({
              ...prev,
              lastSync: Date.now(),
              syncVersion: prev.syncVersion + 1
            }));
            onStateUpdate(payload);
          }
        )
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const userCount = Object.keys(presenceState).length;
          
          setConnectionState(prev => ({
            ...prev,
            connectedUsers: userCount
          }));
          
          console.log(`👥 ${userCount} users connected to tournament`);
        })
        .subscribe(async (status, error) => {
          console.log(`📡 Enhanced subscription status: ${status}`);
          isConnectingRef.current = false;
          
          if (status === 'SUBSCRIBED') {
            reconnectAttemptsRef.current = 0;
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              status: 'connected',
              error: null,
              reconnectAttempts: 0,
              connectionQuality: 'excellent',
              lastPing: Date.now()
            }));
            
            console.log('✅ Enhanced real-time connection established');
            
            // Start heartbeat system
            startHeartbeat();
            
            // Sync any offline changes
            await syncOfflineChanges();
            
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            const errorMessage = error?.message || `Enhanced connection ${status.toLowerCase()}`;
            console.error(`❌ Enhanced connection error: ${errorMessage}`);
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'error',
              error: errorMessage,
              lastError: errorMessage,
              connectionQuality: 'offline',
              reconnectAttempts: reconnectAttemptsRef.current
            }));
            
            // Enhanced exponential backoff with jitter
            reconnectAttemptsRef.current++;
            if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
              const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
              const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1) + jitter, 30000);
              
              console.log(`🔄 Enhanced reconnection in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current})`);
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            } else {
              console.log('❌ Max enhanced reconnection attempts reached');
              setConnectionState(prev => ({
                ...prev,
                status: 'error',
                error: 'Connection failed after maximum attempts'
              }));
            }
            
          } else if (status === 'CLOSED') {
            console.log('📪 Enhanced connection closed');
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'disconnected',
              connectionQuality: 'offline'
            }));
          }
        });

      channelRef.current = channel;
      
    } catch (error) {
      console.error('❌ Enhanced connection establishment failed:', error);
      isConnectingRef.current = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown enhanced connection error';
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: errorMessage,
        lastError: errorMessage,
        connectionQuality: 'offline',
        reconnectAttempts: reconnectAttemptsRef.current
      }));
      
      // Schedule enhanced reconnection
      reconnectAttemptsRef.current++;
      if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
        const jitter = Math.random() * 1000;
        const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1) + jitter, 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [enabled, tournamentId, onStateUpdate, cleanup, startHeartbeat, syncOfflineChanges]);

  // Enhanced manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Enhanced manual reconnection requested');
    reconnectAttemptsRef.current = 0;
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
      status: 'disconnected'
    }));
    
    connect();
  }, [connect]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && tournamentId) {
      connect();
    }
    
    return cleanup;
  }, [enabled, tournamentId]); // Intentionally minimal dependencies

  // Enhanced page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        console.log('👁️ Page visible - checking enhanced connection');
        if (!connectionState.isConnected || connectionState.connectionQuality === 'offline') {
          reconnect();
        }
      } else if (document.visibilityState === 'hidden') {
        console.log('👁️ Page hidden - maintaining connection');
        // Keep connection alive but reduce heartbeat frequency could be added here
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tournamentId, connectionState.isConnected, connectionState.connectionQuality, reconnect]);

  // Enhanced network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online - triggering enhanced reconnection');
      reconnect();
    };

    const handleOffline = () => {
      console.log('🌐 Network offline - switching to enhanced offline mode');
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'disconnected',
        connectionQuality: 'offline',
        error: 'Network unavailable'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reconnect]);

  return {
    ...connectionState,
    reconnect,
    addOfflineChange
  };
}
