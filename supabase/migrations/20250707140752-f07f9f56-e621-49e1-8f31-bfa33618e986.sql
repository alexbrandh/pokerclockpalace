-- Enable real-time updates for tournament_states table
ALTER TABLE public.tournament_states REPLICA IDENTITY FULL;

-- Add the table to the realtime publication if not already added
DO $$ 
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'tournament_states'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_states;
    END IF;
END $$;