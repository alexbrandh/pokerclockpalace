
-- Create a function to calculate time remaining for a tournament
CREATE OR REPLACE FUNCTION calculate_time_remaining(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_state RECORD;
    current_time_val TIMESTAMP WITH TIME ZONE;
    elapsed_seconds INTEGER;
    remaining_time INTEGER;
BEGIN
    -- Get the current tournament state
    SELECT 
        time_remaining,
        is_running,
        is_paused,
        start_time,
        updated_at
    INTO tournament_state
    FROM tournament_states 
    WHERE tournament_id = p_tournament_id;
    
    -- If tournament not found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- If tournament is not running or is paused, return stored time
    IF NOT tournament_state.is_running OR tournament_state.is_paused THEN
        RETURN tournament_state.time_remaining;
    END IF;
    
    -- Calculate elapsed time since last update
    current_time_val := NOW();
    elapsed_seconds := EXTRACT(EPOCH FROM (current_time_val - tournament_state.updated_at))::INTEGER;
    
    -- Calculate remaining time
    remaining_time := tournament_state.time_remaining - elapsed_seconds;
    
    -- Ensure we don't return negative time
    IF remaining_time < 0 THEN
        remaining_time := 0;
    END IF;
    
    RETURN remaining_time;
END;
$$;
