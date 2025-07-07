
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeConnectionState {
  isConnected: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'retrying' | 'polling' | 'syncing';
  error: string | null;
  reconnectAttempts: number;
  lastError: string | null;
  lastPing: number | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  connectedUsers: number;
  lastSync: number | null;
}

interface UseSupabaseRealtimeProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true 
}: UseSupabaseRealtimeProps) {
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>({
    isConnected: false,
    status: 'disconnected',
    error: null,
    reconnectAttempts: 0,
    lastError: null,
    lastPing: null,
    connectionQuality: 'offline',
    connectedUsers: 0,
    lastSync: null
  });

  // Use refs to avoid circular dependencies
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 3;
  const baseDelay = 1000;

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up realtime connection');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
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
  }, []);

  // Polling fallback function
  const startPollingMode = useCallback(() => {
    console.log('📊 Starting polling mode as fallback');
    
    setConnectionState(prev => ({
      ...prev,
      status: 'polling',
      isConnected: false,
      error: 'Using polling mode due to connection issues'
    }));

    // Poll for updates every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('tournament_states')
          .select('*')
          .eq('tournament_id', tournamentId)
          .single();

        if (!error && data) {
          console.log('📡 Polling update received');
          onStateUpdate({
            eventType: 'UPDATE',
            new: data,
            old: null
          });
        }
      } catch (error) {
        console.warn('Polling error:', error);
      }
    }, 5000);
  }, [tournamentId, onStateUpdate]);

  // Connection function without circular dependencies
  const connect = useCallback(() => {
    if (!enabled || !tournamentId || isConnectingRef.current) {
      return;
    }

    // If we've exceeded max attempts, switch to polling
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('🔄 Max reconnect attempts reached, switching to polling mode');
      startPollingMode();
      return;
    }

    isConnectingRef.current = true;
    cleanup();

    console.log(`🔄 Connecting to tournament: ${tournamentId} (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
    
    setConnectionState(prev => ({
      ...prev,
      status: reconnectAttemptsRef.current > 0 ? 'retrying' : 'connecting',
      error: null,
      reconnectAttempts: reconnectAttemptsRef.current
    }));

    try {
      const channel = supabase
        .channel(`tournament_${tournamentId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: tournamentId }
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
            console.log('📡 Real-time update received:', payload.eventType);
            onStateUpdate(payload);
          }
        )
        .subscribe((status, error) => {
          console.log(`📡 Subscription status: ${status}`);
          isConnectingRef.current = false;
          
          if (status === 'SUBSCRIBED') {
            reconnectAttemptsRef.current = 0;
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              status: 'connected',
              error: null,
              reconnectAttempts: 0
            }));
            console.log('✅ Successfully connected to realtime');
            
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            const errorMessage = error?.message || `Connection ${status.toLowerCase()}`;
            console.error(`❌ Connection error: ${errorMessage}`);
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'error',
              error: errorMessage,
              lastError: errorMessage,
              reconnectAttempts: reconnectAttemptsRef.current
            }));
            
            // Schedule reconnection
            reconnectAttemptsRef.current++;
            const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
            
            if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
              console.log(`🔄 Reconnecting in ${delay}ms`);
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            } else {
              console.log('🔄 Max attempts reached, switching to polling');
              startPollingMode();
            }
            
          } else if (status === 'CLOSED') {
            console.log('📪 Connection closed');
            setConnectionState(prev => ({
              ...prev,
              isConnected: false,
              status: 'disconnected'
            }));
          }
        });

      channelRef.current = channel;
      
    } catch (error) {
      console.error('❌ Failed to establish connection:', error);
      isConnectingRef.current = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: errorMessage,
        lastError: errorMessage,
        reconnectAttempts: reconnectAttemptsRef.current
      }));
      
      // Schedule reconnection
      reconnectAttemptsRef.current++;
      if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
        const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        startPollingMode();
      }
    }
  }, [enabled, tournamentId, onStateUpdate, cleanup, startPollingMode]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    reconnectAttemptsRef.current = 0;
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      error: null,
      status: 'disconnected'
    }));
    
    // Stop polling if active
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    connect();
  }, [connect]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && tournamentId) {
      connect();
    }
    
    return cleanup;
  }, [enabled, tournamentId]); // Removed connect and cleanup from dependencies to avoid loops

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        console.log('👁️ Page became visible, checking connection');
        if (!connectionState.isConnected && connectionState.status !== 'polling') {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tournamentId, connectionState.isConnected, connectionState.status, reconnect]);

  return {
    ...connectionState,
    reconnect
  };
}
