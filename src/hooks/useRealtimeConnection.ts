// This file has been replaced by useSupabaseRealtime.ts
// Keeping as placeholder to prevent import errors during transition
export function useRealtimeConnection() {
  console.warn('useRealtimeConnection is deprecated, use useSupabaseRealtime instead');
  return {
    connectionStatus: 'disconnected',
    reconnect: () => {},
    isConnected: false,
    errorMessage: null,
    reconnectAttempts: 0
  };
}
