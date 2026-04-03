-- V8__Add_Missing_Columns.sql
-- Add missing columns that entities expect but aren't in the schema

-- Add edited_at column to track when comments were last edited
ALTER TABLE document_comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;

-- Add last_accessed_at column to share_links for tracking access
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;
