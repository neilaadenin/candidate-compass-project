-- Add match_percentage column to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS match_percentage INTEGER CHECK (match_percentage >= 0 AND match_percentage <= 100);