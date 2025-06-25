
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeConnectionProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
}

export function useRealtimeConnection({ tournamentId, onStateUpdate }: UseRealtimeConnectionProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout>();

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('🧹 Cleaning up real-time channel');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
      reconnectIntervalRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();

    console.log('🔌 Connecting to real-time channel for tournament:', tournamentId);
    setConnectionStatus('connecting');

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
            console.log('📡 Real-time update received:', payload);
            onStateUpdate(payload);
          }
        )
        .subscribe((status, err) => {
          console.log('📡 Real-time channel status:', status, err);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully connected to real-time updates');
            setConnectionStatus('connected');
            setReconnectAttempts(0);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('❌ Real-time connection error:', err);
            setConnectionStatus('error');
            
            // Auto-reconnect with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setReconnectAttempts(prev => prev + 1);
                connect();
              }, delay);
            } else {
              console.error('💀 Max reconnection attempts reached');
              setConnectionStatus('disconnected');
              
              // Set up periodic retry every 30 seconds
              reconnectIntervalRef.current = setInterval(() => {
                console.log('🔄 Periodic reconnection attempt...');
                setReconnectAttempts(0);
                connect();
              }, 30000);
            }
          } else if (status === 'CLOSED') {
            console.log('🔌 Real-time channel closed');
            setConnectionStatus('disconnected');
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('❌ Failed to create real-time channel:', error);
      setConnectionStatus('error');
    }
  }, [tournamentId, onStateUpdate, reconnectAttempts, cleanup]);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection triggered');
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  // Detect when tab becomes active and reconnect if needed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionStatus !== 'connected') {
        console.log('🔄 Tab became active, checking connection...');
        reconnect();
      }
    };

    const handleOnline = () => {
      console.log('🌐 Network connection restored, reconnecting...');
      reconnect();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [connectionStatus, reconnect]);

  return {
    connectionStatus,
    reconnectAttempts,
    reconnect,
    isConnected: connectionStatus === 'connected'
  };
}
