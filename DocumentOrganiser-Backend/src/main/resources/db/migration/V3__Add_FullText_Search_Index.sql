-- V3__Add_FullText_Search_Index.sql
-- Add PostgreSQL full-text search capabilities to the documents table

-- Add a tsvector column for full-text search
ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON documents USING GIN (search_vector);

-- Populate the search vector from existing data
UPDATE documents SET search_vector =
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'B');

-- Create a trigger function to keep the search vector updated
CREATE OR REPLACE FUNCTION documents_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on insert/update
CREATE TRIGGER trig_documents_search_vector_update
    BEFORE INSERT OR UPDATE OF name, category
    ON documents
    FOR EACH ROW
    EXECUTE FUNCTION documents_search_vector_update();

-- Add index for common query patterns
CREATE INDEX IF NOT EXISTS idx_documents_user_not_deleted ON documents (user_id)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents (folder_id)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_documents_favorites ON documents (user_id)
    WHERE is_favorite = true AND is_deleted = false;
