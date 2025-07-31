-- Fix remaining function security issues by setting proper search_path
-- This addresses the "Function Search Path Mutable" warnings

-- Fix check_tournament_creation_rate_limit function
CREATE OR REPLACE FUNCTION public.check_tournament_creation_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many tournaments user created in last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.tournaments 
  WHERE created_by = NEW.created_by 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 5 tournaments per hour
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 tournaments per hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';