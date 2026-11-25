-- Additive Companies Bulletin schema. This migration never removes existing data.
CREATE TABLE IF NOT EXISTS company_bulletin_sources (
    id SERIAL PRIMARY KEY,
    publication_title VARCHAR(255) NOT NULL DEFAULT 'Companies Bulletin',
    source_authority VARCHAR(255) NOT NULL DEFAULT 'Office of the Registrar of Companies, Ghana',
    volume_number VARCHAR(50),
    issue_date DATE,
    publication_date DATE,
    jurisdiction VARCHAR(100) NOT NULL DEFAULT 'Ghana',
    source_filename VARCHAR(500) NOT NULL,
    source_sha256 VARCHAR(64) NOT NULL UNIQUE,
    source_path TEXT,
    document_url TEXT,
    file_size_bytes INTEGER,
    page_count INTEGER,
    captured_at TIMESTAMPTZ,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    extraction_method VARCHAR(100) NOT NULL DEFAULT 'pdf-text-layer',
    extraction_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    import_status VARCHAR(30) NOT NULL DEFAULT 'IMPORTED',
    source_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_company_bulletin_sources_volume_number
    ON company_bulletin_sources (volume_number);
CREATE INDEX IF NOT EXISTS ix_company_bulletin_sources_publication_date
    ON company_bulletin_sources (publication_date);

CREATE TABLE IF NOT EXISTS company_lifecycle_notices (
    id SERIAL PRIMARY KEY,
    bulletin_id INTEGER NOT NULL REFERENCES company_bulletin_sources(id),
    company_id INTEGER REFERENCES companies(id),
    record_key VARCHAR(64) NOT NULL UNIQUE,
    notice_type VARCHAR(60) NOT NULL,
    company_name VARCHAR(500) NOT NULL,
    old_company_name VARCHAR(500),
    new_company_name VARCHAR(500),
    registration_number VARCHAR(100),
    notice_reference VARCHAR(150),
    source_item_number VARCHAR(50),
    source_page INTEGER,
    publication_date DATE,
    event_date DATE,
    effective_date DATE,
    incorporation_date DATE,
    dissolution_date DATE,
    strike_off_date DATE,
    objection_deadline DATE,
    winding_up_date DATE,
    liquidation_date DATE,
    cessation_date DATE,
    statutory_section VARCHAR(100),
    act_reference VARCHAR(255),
    registrar_name VARCHAR(255),
    liquidator_name VARCHAR(255),
    liquidator_contact VARCHAR(255),
    registered_address TEXT,
    raw_text TEXT,
    notice_metadata JSONB,
    extraction_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    review_status VARCHAR(30) NOT NULL DEFAULT 'NEEDS_REVIEW',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_company_lifecycle_name_type
    ON company_lifecycle_notices (company_name, notice_type);
CREATE INDEX IF NOT EXISTS ix_company_lifecycle_registration_type
    ON company_lifecycle_notices (registration_number, notice_type);
CREATE INDEX IF NOT EXISTS ix_company_lifecycle_publication_date
    ON company_lifecycle_notices (publication_date);
CREATE INDEX IF NOT EXISTS ix_company_lifecycle_review_status
    ON company_lifecycle_notices (review_status);
