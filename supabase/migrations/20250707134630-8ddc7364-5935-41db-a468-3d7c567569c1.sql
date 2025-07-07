-- Enable real-time functionality for tournament_states table
ALTER TABLE public.tournament_states REPLICA IDENTITY FULL;

-- Add tournament_states to realtime publication for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_states;