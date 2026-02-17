-- V4__Add_Password_Column.sql
-- Add password column to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create index for faster lookups (though email is already indexed/unique)
-- Not strictly necessary for password itself, but good practice if we ever query by it? 
-- Actually no, we query by email and then check password.
