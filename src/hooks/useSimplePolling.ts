
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface SimplePollingState {
  isPolling: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

interface UseSimplePollingProps {
  tournamentId: string;
  onStateUpdate: (payload: any) => void;
  enabled?: boolean;
}

export function useSimplePolling({ 
  tournamentId, 
  onStateUpdate, 
  enabled = true 
}: UseSimplePollingProps) {
  const [pollingState, setPollingState] = useState<SimplePollingState>({
    isPolling: false,
    lastUpdate: null,
    error: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);
  const enabledRef = useRef(enabled);

  // Update enabled ref when prop changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const pollForUpdates = useCallback(async () => {
    if (!enabledRef.current || !tournamentId) {
      return;
    }

    try {
      console.log('📊 Polling for tournament updates...');
      
      const { data, error } = await supabase
        .from('tournament_states')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (error) {
        console.warn('⚠️ Polling error:', error.message);
        setPollingState(prev => ({
          ...prev,
          error: `Polling error: ${error.message}`
        }));
        return;
      }

      if (data) {
        // Only update if data has actually changed
        const dataString = JSON.stringify(data);
        const lastDataString = JSON.stringify(lastDataRef.current);
        
        if (dataString !== lastDataString) {
          console.log('📡 New data detected, updating state');
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
          error: null
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown polling error';
      console.error('❌ Polling failed:', error);
      setPollingState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, [tournamentId, onStateUpdate]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log('🔄 Starting polling every 5 seconds');
    setPollingState(prev => ({ ...prev, isPolling: true }));

    // Poll immediately on start
    pollForUpdates();

    // Then poll every 5 seconds
    intervalRef.current = setInterval(pollForUpdates, 5000);
  }, [pollForUpdates]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('⏹️ Stopped polling');
    setPollingState(prev => ({ ...prev, isPolling: false }));
  }, []);

  // Start/stop polling based on enabled and tournamentId
  useEffect(() => {
    if (enabled && tournamentId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, tournamentId, startPolling, stopPolling]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && tournamentId) {
        console.log('👁️ Page became visible, refreshing data');
        pollForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tournamentId, pollForUpdates]);

  return {
    ...pollingState,
    refresh: pollForUpdates
  };
}
