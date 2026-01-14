-- Create optimized gazette_entries table for Change of Name notices
-- This table supports master + variant rows for each name (Current, Old, each Alias)

-- Drop existing table if you want to recreate (CAUTION: This will delete all data)
-- DROP TABLE IF EXISTS gazette_entries CASCADE;

-- Create the gazette_entries table
CREATE TABLE IF NOT EXISTS gazette_entries (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Name Variant Management (for master/variant row linking)
    name_set_id VARCHAR(200),  -- Links master and variant rows: "2025-{filename}-{item_number}-{sequence}"
    name_role VARCHAR(20),  -- "master" | "old" | "alias" | "other"
    name_value VARCHAR(500),  -- The specific name for this row (searchable)
    
    -- Source Identification (Required)
    gazette_number VARCHAR(50) NOT NULL,  -- Gazette number (e.g., "94", "101")
    gazette_date DATE,  -- Gazette publication date
    gazette_page INTEGER,  -- Page number in gazette
    item_number VARCHAR(50) NOT NULL,  -- Sequential Item No. (e.g., "24024") - unique record ID
    source_item_number VARCHAR(50),  -- Item number as printed in source
    
    -- Document Information
    document_filename VARCHAR(255) NOT NULL,  -- Source PDF filename
    document_url VARCHAR(500),  -- URL to document if stored externally
    document_size INTEGER,  -- File size in bytes
    
    -- Name Information
    current_name VARCHAR(500),  -- Current/New name (same in all rows for reporting)
    old_name VARCHAR(500),  -- Former name (if name_role = 'old', this contains the variant)
    alias_names JSONB,  -- Array of aliases (stored as JSON for master row)
    other_names TEXT,  -- Other names not in old_name or alias_names
    
    -- Person Identification
    gender VARCHAR(10),  -- "Male" | "Female" | NULL
    profession VARCHAR(200),  -- Current profession/occupation
    
    -- Change Information
    effective_date_of_change DATE,  -- Date the change took effect
    effective_date DATE,  -- Alias for effective_date_of_change
    
    -- Additional Details
    remarks TEXT,  -- Correction notices, confirmation details, or other notes
    source VARCHAR(200),  -- Source authority (e.g., "High Court", "Registrar General", "Bank of Ghana")
    reference_number VARCHAR(100),  -- Reference number for linking across databases
    
    -- Gazette Type (for future expansion)
    gazette_type VARCHAR(50) DEFAULT 'CHANGE_OF_NAME',  -- "CHANGE_OF_NAME" | "CHANGE_OF_DATE_OF_BIRTH" | etc.
    
    -- Status and Classification
    status VARCHAR(20) DEFAULT 'PUBLISHED',  -- "DRAFT" | "PUBLISHED" | "ARCHIVED"
    priority VARCHAR(20) DEFAULT 'MEDIUM',  -- "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    
    -- Dates
    publication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When entry was published
    expiry_date DATE,  -- Optional expiry date
    
    -- Location Information
    jurisdiction VARCHAR(100) DEFAULT 'Ghana',  -- e.g., "Greater Accra", "Ashanti Region"
    court_location VARCHAR(200),  -- Court or location where change was registered
    
    -- Links to Other Databases
    person_id INTEGER,  -- Foreign key to people table
    company_id INTEGER,  -- Foreign key to companies table (for linking to Company Registry)
    court_case_id INTEGER,  -- Foreign key to court cases (for linking to Court Judgement Database)
    cause_list_id INTEGER,  -- Foreign key to cause list (for linking to Cause List Database)
    
    -- Search and Indexing
    search_text TSVECTOR,  -- Full-text search vector (auto-generated from names)
    keywords TEXT[],  -- Array of keywords for search
    tags TEXT[],  -- Array of tags for categorization
    
    -- Metadata
    metadata JSONB,  -- Additional structured data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,  -- User ID who created this record
    updated_by INTEGER,  -- User ID who last updated this record
    
    -- Visibility and Features
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,  -- Whether entry has been verified
    verification_date TIMESTAMP,  -- When entry was verified
    verification_notes TEXT,  -- Notes from verification
    
    -- Edit and Reporting
    edit_count INTEGER DEFAULT 0,  -- Number of times entry has been edited
    last_edited_at TIMESTAMP,  -- Last edit timestamp
    report_count INTEGER DEFAULT 0,  -- Number of times entry has been reported
    last_reported_at TIMESTAMP,  -- Last report timestamp
    
    -- Constraints
    CONSTRAINT chk_name_role CHECK (name_role IN ('master', 'old', 'alias', 'other') OR name_role IS NULL),
    CONSTRAINT chk_gender CHECK (gender IN ('Male', 'Female') OR gender IS NULL),
    CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEWED') OR status IS NULL)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_set_id ON gazette_entries(name_set_id);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_role ON gazette_entries(name_role);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_value ON gazette_entries(name_value);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_gazette_number ON gazette_entries(gazette_number);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_item_number ON gazette_entries(item_number);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_gazette_date ON gazette_entries(gazette_date);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_current_name ON gazette_entries(current_name);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_old_name ON gazette_entries(old_name);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_person_id ON gazette_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_company_id ON gazette_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_court_case_id ON gazette_entries(court_case_id);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_cause_list_id ON gazette_entries(cause_list_id);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_gender ON gazette_entries(gender);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_status ON gazette_entries(status);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_document_filename ON gazette_entries(document_filename);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_gazette_type ON gazette_entries(gazette_type);

-- GIN Index for JSONB alias_names (for efficient alias searching)
CREATE INDEX IF NOT EXISTS idx_gazette_entries_alias_names_gin ON gazette_entries USING GIN(alias_names);

-- GIN Index for Full-Text Search
CREATE INDEX IF NOT EXISTS idx_gazette_entries_search_text_gin ON gazette_entries USING GIN(search_text);

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_gazette_entries_gazette_item ON gazette_entries(gazette_number, item_number);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_person_gazette ON gazette_entries(person_id, gazette_number);
CREATE INDEX IF NOT EXISTS idx_gazette_entries_name_set_role ON gazette_entries(name_set_id, name_role);

-- Unique Constraints for Deduplication
-- Option 1: Using name_set_id (preferred when name_set_id is available)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gazette_entries_name_set_unique 
ON gazette_entries(name_set_id, name_role, name_value) 
WHERE name_set_id IS NOT NULL;

-- Option 2: Fallback unique constraint (when name_set_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gazette_entries_fallback_unique 
ON gazette_entries(gazette_number, item_number, document_filename, gazette_page, current_name, name_role, name_value) 
WHERE name_set_id IS NULL;

-- Unique constraint to prevent duplicate item numbers within same gazette
CREATE UNIQUE INDEX IF NOT EXISTS idx_gazette_entries_item_unique 
ON gazette_entries(gazette_number, item_number, gazette_type, name_role) 
WHERE name_role = 'master';

-- Full-Text Search Function (to populate search_text automatically)
CREATE OR REPLACE FUNCTION update_gazette_entries_search_text() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := 
        setweight(to_tsvector('english', COALESCE(NEW.current_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.old_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.name_value, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.other_names, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.profession, '')), 'C');
    
    -- Also index alias names if present
    IF NEW.alias_names IS NOT NULL THEN
        NEW.search_text := NEW.search_text || 
            setweight(to_tsvector('english', array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.alias_names)), ' ')), 'B');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search_text
DROP TRIGGER IF EXISTS trigger_update_gazette_entries_search_text ON gazette_entries;
CREATE TRIGGER trigger_update_gazette_entries_search_text
    BEFORE INSERT OR UPDATE ON gazette_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_gazette_entries_search_text();

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gazette_entries_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gazette_entries_updated_at ON gazette_entries;
CREATE TRIGGER trigger_update_gazette_entries_updated_at
    BEFORE UPDATE ON gazette_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_gazette_entries_updated_at();

-- Comments for Documentation
COMMENT ON TABLE gazette_entries IS 'Gazette entries table for Change of Name notices. Supports master + variant rows for each name (Current, Old, each Alias).';
COMMENT ON COLUMN gazette_entries.name_set_id IS 'Links master and variant rows together. Format: "2025-{filename}-{item_number}-{sequence}"';
COMMENT ON COLUMN gazette_entries.name_role IS 'Role of this row: "master" (main entry), "old" (old name variant), "alias" (alias variant), "other" (other name variant)';
COMMENT ON COLUMN gazette_entries.name_value IS 'The specific name value for this row. Used for searchability - every name variant is stored here.';
COMMENT ON COLUMN gazette_entries.current_name IS 'Current/New name. Same in all rows for easy reporting.';
COMMENT ON COLUMN gazette_entries.item_number IS 'Unique sequential Item No. from gazette (e.g., "24024"). Acts as unique record ID.';
COMMENT ON COLUMN gazette_entries.person_id IS 'Link to people table for cross-database searching';
COMMENT ON COLUMN gazette_entries.company_id IS 'Link to companies table (Company Registry Database)';
COMMENT ON COLUMN gazette_entries.court_case_id IS 'Link to court cases (Court Judgement and Ruling Database)';
COMMENT ON COLUMN gazette_entries.cause_list_id IS 'Link to cause list (Cause List Database)';
COMMENT ON COLUMN gazette_entries.search_text IS 'Full-text search vector auto-generated from all name fields';

