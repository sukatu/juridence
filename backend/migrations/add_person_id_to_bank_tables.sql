-- Migration: Add person_id foreign key columns to bank-related tables
-- This links bank directors, secretaries, auditors, shareholders, and beneficial owners to the People table

-- Add person_id to bank_directors
ALTER TABLE bank_directors 
ADD COLUMN IF NOT EXISTS person_id INTEGER REFERENCES people(id);

CREATE INDEX IF NOT EXISTS idx_bank_directors_person_id ON bank_directors(person_id);

-- Add person_id to bank_secretaries
ALTER TABLE bank_secretaries 
ADD COLUMN IF NOT EXISTS person_id INTEGER REFERENCES people(id);

CREATE INDEX IF NOT EXISTS idx_bank_secretaries_person_id ON bank_secretaries(person_id);

-- Add person_id to bank_auditors
ALTER TABLE bank_auditors 
ADD COLUMN IF NOT EXISTS person_id INTEGER REFERENCES people(id);

CREATE INDEX IF NOT EXISTS idx_bank_auditors_person_id ON bank_auditors(person_id);

-- Add person_id to bank_shareholders
ALTER TABLE bank_shareholders 
ADD COLUMN IF NOT EXISTS person_id INTEGER REFERENCES people(id);

CREATE INDEX IF NOT EXISTS idx_bank_shareholders_person_id ON bank_shareholders(person_id);

-- Add person_id to bank_beneficial_owners
ALTER TABLE bank_beneficial_owners 
ADD COLUMN IF NOT EXISTS person_id INTEGER REFERENCES people(id);

CREATE INDEX IF NOT EXISTS idx_bank_beneficial_owners_person_id ON bank_beneficial_owners(person_id);
