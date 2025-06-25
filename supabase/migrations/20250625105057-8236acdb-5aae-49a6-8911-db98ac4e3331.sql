
-- Crear tabla de torneos
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  buy_in INTEGER NOT NULL DEFAULT 0,
  reentry_fee INTEGER NOT NULL DEFAULT 0,
  guaranteed_prize_pool INTEGER NOT NULL DEFAULT 0,
  initial_stack INTEGER NOT NULL DEFAULT 10000,
  levels JSONB NOT NULL DEFAULT '[]'::jsonb,
  break_after_levels INTEGER NOT NULL DEFAULT 4,
  payout_structure JSONB NOT NULL DEFAULT '[50, 30, 20]'::jsonb,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'paused', 'finished')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  city TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE
);

-- Crear tabla de estados de torneo
CREATE TABLE public.tournament_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  current_level_index INTEGER NOT NULL DEFAULT 0,
  time_remaining INTEGER NOT NULL DEFAULT 1200,
  is_running BOOLEAN NOT NULL DEFAULT false,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  is_on_break BOOLEAN NOT NULL DEFAULT false,
  players INTEGER NOT NULL DEFAULT 0,
  entries INTEGER NOT NULL DEFAULT 0,
  reentries INTEGER NOT NULL DEFAULT 0,
  current_prize_pool INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL,
  UNIQUE(tournament_id)
);

-- Crear tabla de logs de torneo
CREATE TABLE public.tournament_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acceso público (usuarios anónimos pueden ver y crear)
CREATE POLICY "Allow public read access to tournaments" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to tournaments" ON public.tournaments
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to tournament_states" ON public.tournament_states
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tournament_states" ON public.tournament_states
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to tournament_states" ON public.tournament_states
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to tournament_logs" ON public.tournament_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to tournament_logs" ON public.tournament_logs
  FOR INSERT WITH CHECK (true);

-- Crear índices para optimización
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_created_at ON public.tournaments(created_at DESC);
CREATE INDEX idx_tournaments_access_code ON public.tournaments(access_code);
CREATE INDEX idx_tournament_states_tournament_id ON public.tournament_states(tournament_id);
CREATE INDEX idx_tournament_logs_tournament_id ON public.tournament_logs(tournament_id);
CREATE INDEX idx_tournament_logs_created_at ON public.tournament_logs(created_at DESC);

-- Configurar real-time
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
ALTER TABLE public.tournament_states REPLICA IDENTITY FULL;
ALTER TABLE public.tournament_logs REPLICA IDENTITY FULL;

-- Habilitar real-time para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_logs;

-- Trigger para actualizar updated_at en tournament_states
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tournament_states_updated_at 
    BEFORE UPDATE ON public.tournament_states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de prueba
INSERT INTO public.tournaments (
  name, buy_in, reentry_fee, guaranteed_prize_pool, initial_stack, city, access_code, created_by,
  levels
) VALUES 
(
  'Torneo Nocturno - Palace Poker Room',
  150,
  150,
  2000,
  15000,
  'Ciudad de México',
  'PALACE01',
  'admin-user',
  '[
    {"id": "1", "smallBlind": 25, "bigBlind": 50, "ante": 0, "duration": 20, "isBreak": false},
    {"id": "2", "smallBlind": 50, "bigBlind": 100, "ante": 0, "duration": 20, "isBreak": false},
    {"id": "break1", "smallBlind": 0, "bigBlind": 0, "ante": 0, "duration": 15, "isBreak": true, "breakDuration": 15},
    {"id": "3", "smallBlind": 75, "bigBlind": 150, "ante": 25, "duration": 20, "isBreak": false},
    {"id": "4", "smallBlind": 100, "bigBlind": 200, "ante": 25, "duration": 20, "isBreak": false},
    {"id": "break2", "smallBlind": 0, "bigBlind": 0, "ante": 0, "duration": 15, "isBreak": true, "breakDuration": 15},
    {"id": "5", "smallBlind": 150, "bigBlind": 300, "ante": 50, "duration": 20, "isBreak": false}
  ]'::jsonb
),
(
  'Sit & Go Express',
  100,
  100,
  1000,
  10000,
  'Guadalajara',
  'SITGO01',
  'admin-user',
  '[
    {"id": "1", "smallBlind": 10, "bigBlind": 20, "ante": 0, "duration": 15, "isBreak": false},
    {"id": "2", "smallBlind": 15, "bigBlind": 30, "ante": 0, "duration": 15, "isBreak": false},
    {"id": "3", "smallBlind": 25, "bigBlind": 50, "ante": 5, "duration": 15, "isBreak": false},
    {"id": "break1", "smallBlind": 0, "bigBlind": 0, "ante": 0, "duration": 10, "isBreak": true, "breakDuration": 10},
    {"id": "4", "smallBlind": 50, "bigBlind": 100, "ante": 10, "duration": 15, "isBreak": false}
  ]'::jsonb
);

-- Crear estados iniciales para los torneos de prueba
INSERT INTO public.tournament_states (
  tournament_id, current_level_index, time_remaining, current_prize_pool, updated_by
)
SELECT 
  id, 
  0, 
  1200, 
  guaranteed_prize_pool,
  'admin-user'
FROM public.tournaments
WHERE access_code IN ('PALACE01', 'SITGO01');
