
-- Update the calculate_time_remaining function to use mathematical calculation based on tournament structure
CREATE OR REPLACE FUNCTION calculate_time_remaining(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_data RECORD;
    tournament_state RECORD;
    current_time_val TIMESTAMP WITH TIME ZONE;
    total_elapsed_seconds INTEGER;
    accumulated_time INTEGER := 0;
    level_data JSONB;
    level_duration INTEGER;
    remaining_time INTEGER;
    i INTEGER;
BEGIN
    -- Get tournament data and current state
    SELECT 
        t.levels,
        ts.start_time,
        ts.is_running,
        ts.is_paused,
        ts.time_remaining,
        ts.current_level_index,
        ts.updated_at
    INTO tournament_data
    FROM tournaments t
    JOIN tournament_states ts ON t.id = ts.tournament_id
    WHERE t.id = p_tournament_id;
    
    -- If tournament not found, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- If tournament hasn't started or is paused, return stored time
    IF NOT tournament_data.is_running OR tournament_data.is_paused OR tournament_data.start_time IS NULL THEN
        RETURN tournament_data.time_remaining;
    END IF;
    
    -- Calculate total elapsed time since tournament start
    current_time_val := NOW();
    total_elapsed_seconds := EXTRACT(EPOCH FROM (current_time_val - tournament_data.start_time))::INTEGER;
    
    -- Navigate through levels to find current position
    FOR i IN 0..(jsonb_array_length(tournament_data.levels) - 1) LOOP
        level_data := tournament_data.levels->i;
        level_duration := (level_data->>'duration')::INTEGER * 60; -- Convert minutes to seconds
        
        -- Check if we're still in this level
        IF total_elapsed_seconds <= accumulated_time + level_duration THEN
            -- We're in this level, calculate remaining time
            remaining_time := level_duration - (total_elapsed_seconds - accumulated_time);
            
            -- Ensure we don't return negative time
            IF remaining_time < 0 THEN
                remaining_time := 0;
            END IF;
            
            RETURN remaining_time;
        END IF;
        
        -- Add this level's duration to accumulated time
        accumulated_time := accumulated_time + level_duration;
    END LOOP;
    
    -- If we've gone through all levels, tournament should be finished
    RETURN 0;
END;
$$;

-- Create a function to calculate current level index based on elapsed time
CREATE OR REPLACE FUNCTION calculate_current_level_index(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_data RECORD;
    total_elapsed_seconds INTEGER;
    accumulated_time INTEGER := 0;
    level_data JSONB;
    level_duration INTEGER;
    i INTEGER;
BEGIN
    -- Get tournament data
    SELECT 
        t.levels,
        ts.start_time,
        ts.is_running,
        ts.is_paused,
        ts.current_level_index
    INTO tournament_data
    FROM tournaments t
    JOIN tournament_states ts ON t.id = ts.tournament_id
    WHERE t.id = p_tournament_id;
    
    -- If tournament not found or not running, return current stored index
    IF NOT FOUND OR NOT tournament_data.is_running OR tournament_data.is_paused OR tournament_data.start_time IS NULL THEN
        RETURN COALESCE(tournament_data.current_level_index, 0);
    END IF;
    
    -- Calculate total elapsed time since tournament start
    total_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - tournament_data.start_time))::INTEGER;
    
    -- Navigate through levels to find current level index
    FOR i IN 0..(jsonb_array_length(tournament_data.levels) - 1) LOOP
        level_data := tournament_data.levels->i;
        level_duration := (level_data->>'duration')::INTEGER * 60; -- Convert minutes to seconds
        
        -- Check if we're still in this level
        IF total_elapsed_seconds <= accumulated_time + level_duration THEN
            RETURN i;
        END IF;
        
        -- Add this level's duration to accumulated time
        accumulated_time := accumulated_time + level_duration;
    END LOOP;
    
    -- If we've gone through all levels, return the last level index
    RETURN jsonb_array_length(tournament_data.levels) - 1;
END;
$$;
