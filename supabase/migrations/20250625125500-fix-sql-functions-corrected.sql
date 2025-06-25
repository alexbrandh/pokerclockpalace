
-- Fix tournament state issues and improve SQL functions (CORRECTED)
-- This migration addresses the "record 't' is not assigned yet" error and improves data integrity

-- 1. First, fix any tournaments that are running but have NULL start_time
-- Use updated_at instead of created_at since created_at doesn't exist in tournament_states
UPDATE tournament_states 
SET start_time = updated_at 
WHERE is_running = true 
AND start_time IS NULL;

-- 2. Add a trigger to automatically set start_time when a tournament starts running
CREATE OR REPLACE FUNCTION auto_set_start_time()
RETURNS TRIGGER AS $$
BEGIN
  -- If tournament is being set to running and start_time is NULL, set it to now
  IF NEW.is_running = true AND OLD.is_running = false AND NEW.start_time IS NULL THEN
    NEW.start_time = NOW();
  END IF;
  
  -- If tournament is being paused, don't change start_time
  -- If tournament is being resumed from pause, don't change start_time
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on tournament_states table
DROP TRIGGER IF EXISTS trigger_auto_set_start_time ON tournament_states;
CREATE TRIGGER trigger_auto_set_start_time
  BEFORE UPDATE ON tournament_states
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_start_time();

-- 3. Improve the calculate_time_remaining function with better error handling
CREATE OR REPLACE FUNCTION calculate_time_remaining(p_tournament_id UUID)
RETURNS TABLE(
  time_remaining_seconds INTEGER,
  is_on_break BOOLEAN,
  break_time_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  now_secs INTEGER;
  elapsed INTEGER;
  acc INTEGER := 0;
  lvl JSONB;
  lvl_dur INTEGER;
BEGIN
  -- Select tournament data into properly named record
  SELECT 
    ts.start_time, 
    ts.is_running, 
    ts.is_paused, 
    ts.time_remaining, 
    ts.is_on_break,
    t.levels,
    ts.current_level_index
  INTO tournament_record
  FROM tournament_states ts
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE ts.tournament_id = p_tournament_id;
  
  -- If tournament not found, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, FALSE, 0;
    RETURN;
  END IF;
  
  -- If tournament not running, paused, or start_time is NULL, return stored state
  IF NOT tournament_record.is_running OR tournament_record.is_paused OR tournament_record.start_time IS NULL THEN
    RETURN QUERY SELECT 
      COALESCE(tournament_record.time_remaining, 0), 
      COALESCE(tournament_record.is_on_break, FALSE), 
      CASE 
        WHEN COALESCE(tournament_record.is_on_break, FALSE) THEN COALESCE(tournament_record.time_remaining, 0)
        ELSE 0 
      END;
    RETURN;
  END IF;
  
  -- Validate levels array exists and has content
  IF tournament_record.levels IS NULL OR jsonb_array_length(tournament_record.levels) = 0 THEN
    RETURN QUERY SELECT COALESCE(tournament_record.time_remaining, 0), FALSE, 0;
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM tournament_record.start_time)::INTEGER;
  
  -- Ensure elapsed time is not negative
  IF elapsed < 0 THEN
    elapsed := 0;
  END IF;
  
  -- Loop through levels to calculate current time
  FOR i IN 0..jsonb_array_length(tournament_record.levels)-1 LOOP
    lvl := tournament_record.levels->i;
    
    -- Validate level data
    IF lvl IS NULL OR (lvl->>'duration') IS NULL THEN
      CONTINUE;
    END IF;
    
    lvl_dur := COALESCE((lvl->>'duration')::INTEGER, 0) * 60;
    
    -- Skip if invalid duration
    IF lvl_dur <= 0 THEN
      CONTINUE;
    END IF;
    
    -- Check if this level is a break
    IF COALESCE((lvl->>'isBreak')::BOOLEAN, FALSE) THEN
      -- This IS a break level
      IF elapsed < acc + lvl_dur THEN
        RETURN QUERY SELECT lvl_dur - (elapsed - acc), TRUE, lvl_dur - (elapsed - acc);
        RETURN;
      END IF;
      acc := acc + lvl_dur;
    ELSE
      -- This is a regular level
      IF elapsed < acc + lvl_dur THEN
        RETURN QUERY SELECT lvl_dur - (elapsed - acc), FALSE, 0;
        RETURN;
      END IF;
      acc := acc + lvl_dur;
    END IF;
  END LOOP;
  
  -- Tournament finished - return zeros
  RETURN QUERY SELECT 0, FALSE, 0;
END;
$$;

-- 4. Improve the calculate_current_level_index function with better error handling
CREATE OR REPLACE FUNCTION calculate_current_level_index(p_tournament_id UUID)
RETURNS TABLE(
  current_level_index INTEGER,
  is_on_break BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  now_secs INTEGER;
  elapsed INTEGER;
  acc INTEGER := 0;
  lvl JSONB;
  lvl_dur INTEGER;
BEGIN
  -- Select tournament data into properly named record
  SELECT 
    ts.start_time, 
    ts.is_running, 
    ts.is_paused, 
    ts.current_level_index, 
    ts.is_on_break,
    t.levels
  INTO tournament_record
  FROM tournament_states ts
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE ts.tournament_id = p_tournament_id;
  
  -- If tournament not found, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, FALSE;
    RETURN;
  END IF;
  
  -- If tournament not running, paused, or start_time is NULL, return stored state
  IF NOT tournament_record.is_running OR tournament_record.is_paused OR tournament_record.start_time IS NULL THEN
    RETURN QUERY SELECT 
      COALESCE(tournament_record.current_level_index, 0), 
      COALESCE(tournament_record.is_on_break, FALSE);
    RETURN;
  END IF;
  
  -- Validate levels array exists and has content
  IF tournament_record.levels IS NULL OR jsonb_array_length(tournament_record.levels) = 0 THEN
    RETURN QUERY SELECT COALESCE(tournament_record.current_level_index, 0), FALSE;
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM tournament_record.start_time)::INTEGER;
  
  -- Ensure elapsed time is not negative
  IF elapsed < 0 THEN
    elapsed := 0;
  END IF;
  
  -- Loop through levels to find current level
  FOR i IN 0..jsonb_array_length(tournament_record.levels)-1 LOOP
    lvl := tournament_record.levels->i;
    
    -- Validate level data
    IF lvl IS NULL OR (lvl->>'duration') IS NULL THEN
      CONTINUE;
    END IF;
    
    lvl_dur := COALESCE((lvl->>'duration')::INTEGER, 0) * 60;
    
    -- Skip if invalid duration
    IF lvl_dur <= 0 THEN
      CONTINUE;
    END IF;
    
    -- Check if we're still in this level (break or regular)
    IF elapsed < acc + lvl_dur THEN
      RETURN QUERY SELECT i, COALESCE((lvl->>'isBreak')::BOOLEAN, FALSE);
      RETURN;
    END IF;
    acc := acc + lvl_dur;
  END LOOP;
  
  -- Return last valid level if tournament has finished
  RETURN QUERY SELECT 
    GREATEST(jsonb_array_length(tournament_record.levels) - 1, 0), 
    FALSE;
END;
$$;
