-- Fix Database Schema for VR What More Landing Page
-- Run this in Supabase SQL Editor to fix missing columns

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to recreate with correct schema)
DROP TABLE IF EXISTS professional_details CASCADE;
DROP TABLE IF EXISTS basic_info CASCADE;

-- Recreate basic_info table with all required columns
CREATE TABLE basic_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate professional_details table with correct schema
CREATE TABLE professional_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(254) NOT NULL,
    primary_area VARCHAR(100) NOT NULL,
    other_primary_area VARCHAR(100),
    experience VARCHAR(20) NOT NULL,
    organization VARCHAR(200),
    role VARCHAR(100),
    values TEXT,
    priorities TEXT,
    biggest_challenge TEXT,
    street_address TEXT NOT NULL,
    locality VARCHAR(100) NOT NULL,
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    birthday DATE,
    skip_birthday BOOLEAN DEFAULT FALSE,
    was_student VARCHAR(10) NOT NULL,
    batch_year VARCHAR(20),
    institute_name VARCHAR(200),
    captcha_token VARCHAR(100),
    captcha_verified BOOLEAN DEFAULT FALSE,
    honeypot_website VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create signup_stats table if not exists
CREATE TABLE IF NOT EXISTS signup_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count INTEGER NOT NULL DEFAULT 249,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_basic_info_email ON basic_info(email);
CREATE INDEX IF NOT EXISTS idx_professional_details_email ON professional_details(email);

-- Enable Row Level Security
ALTER TABLE basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable insert for all users" ON basic_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON basic_info FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON professional_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON professional_details FOR SELECT USING (true);

CREATE POLICY "Enable select for all users" ON signup_stats FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON signup_stats FOR UPDATE USING (true);

-- Insert initial signup count
INSERT INTO signup_stats (count) VALUES (249) ON CONFLICT DO NOTHING;

-- Create function to increment signup count
CREATE OR REPLACE FUNCTION increment_signup_count()
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE signup_stats 
    SET count = count + 1, updated_at = NOW()
    WHERE id = (SELECT id FROM signup_stats ORDER BY created_at DESC LIMIT 1)
    RETURNING count INTO new_count;
    
    IF new_count IS NULL THEN
        INSERT INTO signup_stats (count) VALUES (1) RETURNING count INTO new_count;
    END IF;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Verify tables were created
SELECT 'basic_info' as table_name, COUNT(*) as row_count FROM basic_info
UNION ALL
SELECT 'professional_details' as table_name, COUNT(*) as row_count FROM professional_details
UNION ALL
SELECT 'signup_stats' as table_name, COUNT(*) as row_count FROM signup_stats; 