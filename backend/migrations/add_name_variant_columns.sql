-- Migration: Add name variant management columns to gazette_entries
-- Run this migration to add the new columns for master/variant row linking

-- Add name_set_id column (links master and variant rows)
ALTER TABLE gazette_entries 
ADD COLUMN IF NOT EXISTS name_set_id VARCHAR(200);

-- Add index for name_set_id
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_set_id ON gazette_entries(name_set_id);

-- Add name_role column (master | old | alias | other)
ALTER TABLE gazette_entries 
ADD COLUMN IF NOT EXISTS name_role VARCHAR(20);

-- Add index for name_role
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_role ON gazette_entries(name_role);

-- Add name_value column (the specific name for this row)
ALTER TABLE gazette_entries 
ADD COLUMN IF NOT EXISTS name_value VARCHAR(500);

-- Add index for name_value
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_value ON gazette_entries(name_value);

-- Add other_names column (other names not in old_name or alias_names)
ALTER TABLE gazette_entries 
ADD COLUMN IF NOT EXISTS other_names TEXT;

-- Add gender column
ALTER TABLE gazette_entries 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add unique constraint for (name_set_id, name_role, name_value) if name_set_id is provided
-- Note: This will only work if name_set_id is NOT NULL for all rows
-- If name_set_id can be NULL, use a partial unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_gazette_entries_name_set_unique 
ON gazette_entries(name_set_id, name_role, name_value) 
WHERE name_set_id IS NOT NULL;

-- Add fallback unique constraint for rows without name_set_id
-- Uses: (source, item_number, document_filename, page_number, new_name, name_role, name_value)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gazette_entries_fallback_unique 
ON gazette_entries(source, item_number, document_filename, page_number, new_name, name_role, name_value) 
WHERE name_set_id IS NULL;

