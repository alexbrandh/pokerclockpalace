-- Add DELETE policies for tournaments table
CREATE POLICY "Allow public delete access to tournaments" 
ON public.tournaments 
FOR DELETE 
USING (true);

-- Add DELETE policies for tournament_states table  
CREATE POLICY "Allow public delete access to tournament_states"
ON public.tournament_states
FOR DELETE
USING (true);

-- Add DELETE policies for tournament_logs table
CREATE POLICY "Allow public delete access to tournament_logs"
ON public.tournament_logs  
FOR DELETE
USING (true);