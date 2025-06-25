
-- Drop existing functions first to allow changing return types
DROP FUNCTION IF EXISTS calculate_time_remaining(UUID);
DROP FUNCTION IF EXISTS calculate_current_level_index(UUID);

-- Create the updated calculate_time_remaining function with new return structure
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
  t RECORD;
  now_secs INTEGER;
  elapsed INTEGER;
  acc INTEGER := 0;
  lvl JSONB;
  lvl_dur INTEGER;
BEGIN
  SELECT 
    ts.start_time, ts.is_running, ts.is_paused, ts.time_remaining, ts.is_on_break,
    t.levels
  INTO t
  FROM tournament_states ts
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE ts.tournament_id = p_tournament_id;
  
  -- If tournament not found or not running, return stored state
  IF NOT FOUND OR NOT t.is_running OR t.is_paused OR t.start_time IS NULL THEN
    RETURN QUERY SELECT COALESCE(t.time_remaining, 0), COALESCE(t.is_on_break, FALSE), COALESCE(t.time_remaining, 0);
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM t.start_time)::INTEGER;
  
  FOR i IN 0..jsonb_array_length(t.levels)-1 LOOP
    lvl := t.levels->i;
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

-- Create the updated calculate_current_level_index function with new return structure
CREATE OR REPLACE FUNCTION calculate_current_level_index(p_tournament_id UUID)
RETURNS TABLE(
  current_level_index INTEGER,
  is_on_break BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  t RECORD;
  now_secs INTEGER;
  elapsed INTEGER;
  acc INTEGER := 0;
  lvl JSONB;
  lvl_dur INTEGER;
BEGIN
  SELECT 
    ts.start_time, ts.is_running, ts.is_paused, ts.current_level_index, ts.is_on_break,
    t.levels
  INTO t
  FROM tournament_states ts
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE ts.tournament_id = p_tournament_id;
  
  -- If tournament not found or not running, return stored state
  IF NOT FOUND OR NOT t.is_running OR t.is_paused OR t.start_time IS NULL THEN
    RETURN QUERY SELECT COALESCE(t.current_level_index, 0), COALESCE(t.is_on_break, FALSE);
    RETURN;
  END IF;
  
  now_secs := EXTRACT(EPOCH FROM NOW())::INTEGER;
  elapsed := now_secs - EXTRACT(EPOCH FROM t.start_time)::INTEGER;
  
  FOR i IN 0..jsonb_array_length(t.levels)-1 LOOP
    lvl := t.levels->i;
    lvl_dur := (lvl->>'duration')::INTEGER * 60;
    
    -- Check if we're still in this level (break or regular)
    IF elapsed < acc + lvl_dur THEN
      RETURN QUERY SELECT i, (lvl->>'isBreak')::BOOLEAN;
      RETURN;
    END IF;
    acc := acc + lvl_dur;
  END LOOP;
  
  -- Return last level if tournament has finished
  RETURN QUERY SELECT jsonb_array_length(t.levels) - 1, FALSE;
END;
$$;
