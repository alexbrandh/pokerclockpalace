
-- Fix the calculate_time_remaining function to properly handle record assignment
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
    t.levels
  INTO tournament_record
  FROM tournament_states ts
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE ts.tournament_id = p_tournament_id;
  
  -- If tournament not found or not running, return stored state
  IF NOT FOUND OR NOT tournament_record.is_running OR tournament_record.is_paused OR tournament_record.start_time IS NULL THEN
    RETURN QUERY SELECT 
      COALESCE(tournament_record.time_remaining, 0), 
      COALESCE(tournament_record.is_on_break, FALSE), 
      COALESCE(tournament_record.time_remaining, 0);
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM tournament_record.start_time)::INTEGER;
  
  -- Loop through levels to calculate current time
  FOR i IN 0..jsonb_array_length(tournament_record.levels)-1 LOOP
    lvl := tournament_record.levels->i;
    lvl_dur := (lvl->>'duration')::INTEGER * 60;
    
    -- Check if this level is a break
    IF (lvl->>'isBreak')::BOOLEAN THEN
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
  
  -- Tournament finished
  RETURN QUERY SELECT 0, FALSE, 0;
END;
$$;

-- Fix the calculate_current_level_index function to properly handle record assignment
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
  
  -- If tournament not found or not running, return stored state
  IF NOT FOUND OR NOT tournament_record.is_running OR tournament_record.is_paused OR tournament_record.start_time IS NULL THEN
    RETURN QUERY SELECT 
      COALESCE(tournament_record.current_level_index, 0), 
      COALESCE(tournament_record.is_on_break, FALSE);
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM tournament_record.start_time)::INTEGER;
  
  -- Loop through levels to find current level
  FOR i IN 0..jsonb_array_length(tournament_record.levels)-1 LOOP
    lvl := tournament_record.levels->i;
    lvl_dur := (lvl->>'duration')::INTEGER * 60;
    
    -- Check if we're still in this level (break or regular)
    IF elapsed < acc + lvl_dur THEN
      RETURN QUERY SELECT i, (lvl->>'isBreak')::BOOLEAN;
      RETURN;
    END IF;
    acc := acc + lvl_dur;
  END LOOP;
  
  -- Return last level if tournament has finished
  RETURN QUERY SELECT jsonb_array_length(tournament_record.levels) - 1, FALSE;
END;
$$;
