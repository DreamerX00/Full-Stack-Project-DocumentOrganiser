-- V2__Add_Onboarding_Fields.sql
-- Add onboarding-related fields to user_settings table

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;
