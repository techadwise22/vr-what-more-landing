-- Supabase Database Schema for VR What More Landing Page
-- This schema includes comprehensive tables for form data, signup tracking, and security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic Information Table (Step 1 of form)
CREATE TABLE IF NOT EXISTS basic_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    linkedin_url VARCHAR(500), -- Added LinkedIn URL field
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Details Table (Step 2 of form)
CREATE TABLE IF NOT EXISTS professional_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    basic_info_id UUID NOT NULL REFERENCES basic_info(id) ON DELETE CASCADE,
    primary_area VARCHAR(100) NOT NULL,
    other_area VARCHAR(100),
    experience_years VARCHAR(20) NOT NULL,
    organization VARCHAR(200),
    role VARCHAR(100),
    values TEXT[], -- Array of selected values
    other_values VARCHAR(200),
    priorities TEXT[], -- Array of selected priorities
    other_priorities VARCHAR(200),
    biggest_challenge TEXT[], -- Array of selected challenges
    other_challenge VARCHAR(200),
    street_address TEXT NOT NULL,
    locality VARCHAR(100) NOT NULL,
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    other_state VARCHAR(100),
    pin_code VARCHAR(10) NOT NULL,
    birthday DATE,
    skip_birthday BOOLEAN DEFAULT FALSE,
    was_student VARCHAR(10) NOT NULL, -- 'yes' or 'no'
    batch_year VARCHAR(20),
    institute_name VARCHAR(200),
    captcha_token VARCHAR(100),
    captcha_verified BOOLEAN DEFAULT FALSE,
    honeypot_website VARCHAR(500), -- For spam detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signup Statistics Table (for dynamic counter)
CREATE TABLE IF NOT EXISTS signup_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Logs Table (for monitoring)
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(200),
    request_method VARCHAR(10),
    status_code INTEGER,
    spam_score DECIMAL(3,2),
    blocked BOOLEAN DEFAULT FALSE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_basic_info_email ON basic_info(email);
CREATE INDEX IF NOT EXISTS idx_basic_info_created_at ON basic_info(created_at);
CREATE INDEX IF NOT EXISTS idx_professional_details_basic_info_id ON professional_details(basic_info_id);
CREATE INDEX IF NOT EXISTS idx_professional_details_created_at ON professional_details(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for basic_info
CREATE POLICY "Enable insert for authenticated users" ON basic_info
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON basic_info
    FOR SELECT USING (true);

-- Create RLS policies for professional_details
CREATE POLICY "Enable insert for authenticated users" ON professional_details
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON professional_details
    FOR SELECT USING (true);

-- Create RLS policies for signup_stats
CREATE POLICY "Enable select for all users" ON signup_stats
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON signup_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON signup_stats
    FOR UPDATE USING (true);

-- Create RLS policies for security_logs
CREATE POLICY "Enable insert for authenticated users" ON security_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" ON security_logs
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_basic_info_updated_at 
    BEFORE UPDATE ON basic_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_details_updated_at 
    BEFORE UPDATE ON professional_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signup_stats_updated_at 
    BEFORE UPDATE ON signup_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Create function to get current signup count
CREATE OR REPLACE FUNCTION get_signup_count()
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT count INTO current_count 
    FROM signup_stats 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF current_count IS NULL THEN
        INSERT INTO signup_stats (count) VALUES (249) RETURNING count INTO current_count;
    END IF;
    
    RETURN current_count;
END;
$$ LANGUAGE plpgsql; 