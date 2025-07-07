import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface PollingState {
  isActive: boolean;
  lastUpdate: Date | null;
  error: string | null;
  status: 'active' | 'paused' | 'error';
}

interface UsePollingOnlyProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
  enabled?: boolean;
  interval?: number;
}

export function usePollingOnly({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true,
  interval = 1000 
}: UsePollingOnlyProps) {
  const [pollingState, setPollingState] = useState<PollingState>({
    isActive: false,
    lastUpdate: null,
    error: null,
    status: 'paused'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const pollData = useCallback(async () => {
    if (!enabledRef.current || !tournamentId) return;

    try {
      const { data, error } = await supabase
        .from('tournament_states')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (error) {
        setPollingState(prev => ({
          ...prev,
          error: `Error polling: ${error.message}`,
          status: 'error'
        }));
        return;
      }

      if (data) {
        // Compare with last data to avoid unnecessary updates
        const dataString = JSON.stringify(data);
        const lastDataString = JSON.stringify(lastDataRef.current);
        
        if (dataString !== lastDataString) {
          lastDataRef.current = data;
          onStateUpdate({
            eventType: 'UPDATE',
            new: data,
            old: null
          });
        }

        setPollingState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          error: null,
          status: 'active'
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown polling error';
      setPollingState(prev => ({
        ...prev,
        error: errorMessage,
        status: 'error'
      }));
    }
  }, [tournamentId, onStateUpdate]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setPollingState(prev => ({ ...prev, isActive: true, status: 'active' }));
    
    // Poll immediately
    pollData();
    
    // Then poll at interval
    intervalRef.current = setInterval(pollData, interval);
  }, [pollData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPollingState(prev => ({ ...prev, isActive: false, status: 'paused' }));
  }, []);

  const reconnect = useCallback(() => {
    stopPolling();
    setTimeout(startPolling, 100);
  }, [startPolling, stopPolling]);

  // Start/stop based on enabled and tournamentId
  useEffect(() => {
    if (enabled && tournamentId) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, tournamentId, startPolling, stopPolling]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        pollData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tournamentId, pollData]);

  return {
    isConnected: pollingState.status === 'active',
    status: pollingState.status,
    error: pollingState.error,
    lastSync: pollingState.lastUpdate?.getTime() || null,
    reconnect
  };
}