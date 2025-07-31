-- Fix Critical RLS Security Issues
-- Remove permissive OR TRUE conditions that allow all users to access all data

-- 1. Fix tournaments table RLS policies
DROP POLICY IF EXISTS "Users can view tournaments they created or joined" ON public.tournaments;

CREATE POLICY "Users can only view their own tournaments" 
ON public.tournaments 
FOR SELECT 
USING (created_by = (auth.uid())::text);

-- 2. Fix tournament_states table RLS policies
DROP POLICY IF EXISTS "Users can view tournament states for accessible tournaments" ON public.tournament_states;
DROP POLICY IF EXISTS "Authenticated users can update tournament states they have acce" ON public.tournament_states;

CREATE POLICY "Users can view tournament states for their own tournaments" 
ON public.tournament_states 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tournaments t 
  WHERE t.id = tournament_states.tournament_id 
  AND t.created_by = (auth.uid())::text
));

CREATE POLICY "Users can update tournament states for their own tournaments" 
ON public.tournament_states 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM tournaments t 
  WHERE t.id = tournament_states.tournament_id 
  AND t.created_by = (auth.uid())::text
))
WITH CHECK (EXISTS (
  SELECT 1 FROM tournaments t 
  WHERE t.id = tournament_states.tournament_id 
  AND t.created_by = (auth.uid())::text
));

-- 3. Fix tournament_logs table RLS policies
DROP POLICY IF EXISTS "Users can view logs for accessible tournaments" ON public.tournament_logs;
DROP POLICY IF EXISTS "Authenticated users can create logs for accessible tournaments" ON public.tournament_logs;

CREATE POLICY "Users can view logs for their own tournaments" 
ON public.tournament_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tournaments t 
  WHERE t.id = tournament_logs.tournament_id 
  AND t.created_by = (auth.uid())::text
));

CREATE POLICY "Users can create logs for their own tournaments" 
ON public.tournament_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM tournaments t 
  WHERE t.id = tournament_logs.tournament_id 
  AND t.created_by = (auth.uid())::text
));

-- 4. Add input validation constraints
ALTER TABLE tournaments 
ADD CONSTRAINT check_tournament_name_length 
CHECK (char_length(name) BETWEEN 1 AND 100);

ALTER TABLE tournaments 
ADD CONSTRAINT check_description_length 
CHECK (description IS NULL OR char_length(description) <= 1000);

ALTER TABLE tournaments 
ADD CONSTRAINT check_buy_in_positive 
CHECK (buy_in >= 0);

ALTER TABLE tournaments 
ADD CONSTRAINT check_initial_stack_positive 
CHECK (initial_stack > 0);

-- 5. Improve access code security (ensure 6+ characters)
ALTER TABLE tournaments 
ADD CONSTRAINT check_access_code_length 
CHECK (char_length(access_code) >= 6);

-- 6. Add rate limiting function for tournament creation
CREATE OR REPLACE FUNCTION public.check_tournament_creation_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many tournaments user created in last hour
  SELECT COUNT(*) INTO recent_count
  FROM tournaments 
  WHERE created_by = NEW.created_by 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 5 tournaments per hour
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 tournaments per hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply rate limiting trigger
CREATE TRIGGER tournament_creation_rate_limit
  BEFORE INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION check_tournament_creation_rate_limit();