-- Add new fields for enhanced tournament features
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS staff_fee integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS double_stack_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS double_stack_cost integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS early_entry_bonus boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS early_entry_percentage integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS early_entry_levels integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS prize_pool_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS double_stack_multiplier numeric DEFAULT 2.0;

-- Add comment for documentation
COMMENT ON COLUMN tournaments.staff_fee IS 'Fixed fee that goes to staff, separate from rake';
COMMENT ON COLUMN tournaments.double_stack_allowed IS 'Allow players to buy double stack for double price';
COMMENT ON COLUMN tournaments.double_stack_cost IS 'Cost for double stack entry';
COMMENT ON COLUMN tournaments.early_entry_bonus IS 'Enable bonus for early entry players';
COMMENT ON COLUMN tournaments.early_entry_percentage IS 'Percentage of guaranteed prize for early entry bonus';
COMMENT ON COLUMN tournaments.early_entry_levels IS 'Number of levels that qualify for early entry bonus';
COMMENT ON COLUMN tournaments.prize_pool_visible IS 'Whether prize pool is visible before registration closes';
COMMENT ON COLUMN tournaments.double_stack_multiplier IS 'Stack multiplier for double entries';

-- Add fields to tournament_states for tracking
ALTER TABLE tournament_states
ADD COLUMN IF NOT EXISTS double_entries integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS early_entry_players integer DEFAULT 0;