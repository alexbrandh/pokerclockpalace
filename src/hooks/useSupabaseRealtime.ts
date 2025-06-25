
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeConnectionState {
  isConnected: boolean;
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'retrying';
  error: string | null;
  reconnectAttempts: number;
  lastError: string | null;
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
    lastError: null
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000;

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up realtime connection');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
      } catch (error) {
        console.warn('Warning during channel cleanup:', error);
      }
      channelRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!enabled || !tournamentId) {
      console.log('⏸️ Realtime connection disabled or no tournament ID');
      return;
    }

    cleanup();

    console.log('🔄 Establishing realtime connection for tournament:', tournamentId);
    
    setConnectionState(prev => ({
      ...prev,
      status: prev.reconnectAttempts > 0 ? 'retrying' : 'connecting',
      error: null
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
          
          if (status === 'SUBSCRIBED') {
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
              lastError: errorMessage
            }));
            
            // Attempt reconnection with exponential backoff
            if (connectionState.reconnectAttempts < maxReconnectAttempts) {
              const delay = baseDelay * Math.pow(2, connectionState.reconnectAttempts);
              console.log(`🔄 Reconnecting in ${delay}ms (attempt ${connectionState.reconnectAttempts + 1}/${maxReconnectAttempts})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setConnectionState(prev => ({
                  ...prev,
                  reconnectAttempts: prev.reconnectAttempts + 1
                }));
                connect();
              }, delay);
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
      console.error('❌ Failed to establish realtime connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: errorMessage,
        lastError: errorMessage
      }));
    }
  }, [tournamentId, enabled, onStateUpdate, connectionState.reconnectAttempts, cleanup]);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      error: null
    }));
    connect();
  }, [connect]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && tournamentId) {
      connect();
    }
    
    return cleanup;
  }, [enabled, tournamentId, connect, cleanup]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        console.log('👁️ Page became visible, checking connection');
        if (!connectionState.isConnected) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tournamentId, connectionState.isConnected, connect]);

  return {
    ...connectionState,
    reconnect
  };
}
