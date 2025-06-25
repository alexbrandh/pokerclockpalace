
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeConnectionProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
}

export function useRealtimeConnection({ tournamentId, onStateUpdate }: UseRealtimeConnectionProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'retrying'>('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout>();
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up real-time connection resources');
    
    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      } catch (error) {
        console.warn('Warning during channel cleanup:', error);
      }
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
      reconnectIntervalRef.current = undefined;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    if (!tournamentId) {
      console.warn('⚠️ No tournament ID provided for connection');
      setConnectionStatus('error');
      setErrorMessage('ID de torneo no válido');
      return;
    }

    cleanup();
    
    console.log(`🔌 Connecting to real-time channel for tournament: ${tournamentId} (attempt ${reconnectAttempts + 1})`);
    setConnectionStatus(reconnectAttempts > 0 ? 'retrying' : 'connecting');
    setErrorMessage(null);

    try {
      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        console.warn('⏰ Connection timeout reached');
        setConnectionStatus('error');
        setErrorMessage('Tiempo de conexión agotado. Verificando conexión...');
        
        // Try fallback after timeout
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      }, 10000); // 10 second timeout

      const channel = supabase
        .channel(`tournament_${tournamentId}`, {
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
            console.log('📡 Real-time update received:', {
              event: payload.eventType,
              table: payload.table,
              new: payload.new ? 'present' : 'null',
              old: payload.old ? 'present' : 'null'
            });
            onStateUpdate(payload);
          }
        )
        .subscribe((status, err) => {
          console.log(`📡 Channel subscription status: ${status}`, err || '');
          
          // Clear connection timeout on any status update
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = undefined;
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully connected to real-time updates');
            setConnectionStatus('connected');
            setReconnectAttempts(0);
            setErrorMessage(null);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time channel error:', err);
            setConnectionStatus('error');
            const errorMsg = err?.message || 'Error de canal desconocido';
            setErrorMessage(`Error de conexión: ${errorMsg}`);
            
            // Auto-reconnect with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
              const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 10000);
              console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setReconnectAttempts(prev => prev + 1);
                connect();
              }, delay);
            } else {
              console.error('💀 Max reconnection attempts reached');
              setConnectionStatus('disconnected');
              setErrorMessage('No se pudo conectar después de varios intentos');
              
              // Set up periodic retry every 30 seconds
              reconnectIntervalRef.current = setInterval(() => {
                console.log('🔄 Periodic reconnection attempt...');
                setReconnectAttempts(0);
                connect();
              }, 30000);
            }
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Real-time subscription timed out:', err);
            setConnectionStatus('error');
            setErrorMessage('Conexión expiró. Reintentando...');
            
            // Immediate retry for timeout
            if (reconnectAttempts < maxReconnectAttempts) {
              setTimeout(() => {
                setReconnectAttempts(prev => prev + 1);
                connect();
              }, 1000);
            }
          } else if (status === 'CLOSED') {
            console.log('🔌 Real-time channel closed');
            setConnectionStatus('disconnected');
            setErrorMessage('Conexión cerrada');
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('❌ Failed to create real-time channel:', error);
      setConnectionStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(`Error al crear canal: ${errorMsg}`);
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
      if (!document.hidden && connectionStatus !== 'connected' && connectionStatus !== 'connecting') {
        console.log('🔄 Tab became active, checking connection...');
        reconnect();
      }
    };

    const handleOnline = () => {
      console.log('🌐 Network connection restored, reconnecting...');
      reconnect();
    };

    const handleOffline = () => {
      console.log('📵 Network connection lost');
      setConnectionStatus('disconnected');
      setErrorMessage('Sin conexión a internet');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionStatus, reconnect]);

  return {
    connectionStatus,
    reconnectAttempts,
    errorMessage,
    reconnect,
    isConnected: connectionStatus === 'connected'
  };
}
