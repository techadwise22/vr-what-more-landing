-- Supabase Database Schema for VR What More Landing Page

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS basic_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professional_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    basic_info_id UUID REFERENCES basic_info(id) ON DELETE CASCADE,
    primary_area VARCHAR(100) NOT NULL,
    other_area TEXT,
    experience_years VARCHAR(20) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    values TEXT[] NOT NULL,
    other_values TEXT,
    priorities TEXT[] NOT NULL,
    other_priorities TEXT,
    biggest_challenge VARCHAR(100) NOT NULL,
    other_challenge TEXT,
    street_address TEXT NOT NULL,
    locality VARCHAR(255) NOT NULL,
    landmark TEXT,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    other_state VARCHAR(255),
    pin_code VARCHAR(10) NOT NULL,
    birthday DATE,
    skip_birthday BOOLEAN DEFAULT FALSE,
    was_student VARCHAR(10) NOT NULL,
    batch_year VARCHAR(10),
    institute_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signup_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_basic_info_email ON basic_info(email);
CREATE INDEX IF NOT EXISTS idx_professional_details_basic_info_id ON professional_details(basic_info_id);
CREATE INDEX IF NOT EXISTS idx_professional_details_created_at ON professional_details(created_at);

-- Enable Row Level Security
ALTER TABLE basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for basic_info table
CREATE POLICY "Allow insert for authenticated users" ON basic_info
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON basic_info
    FOR SELECT USING (true);

-- Create policies for professional_details table
CREATE POLICY "Allow insert for authenticated users" ON professional_details
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON professional_details
    FOR SELECT USING (true);

-- Create policies for signup_stats table
CREATE POLICY "Allow insert for authenticated users" ON signup_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON signup_stats
    FOR SELECT USING (true);

CREATE POLICY "Allow update for authenticated users" ON signup_stats
    FOR UPDATE USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_basic_info_updated_at 
    BEFORE UPDATE ON basic_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_details_updated_at 
    BEFORE UPDATE ON professional_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signup_stats_updated_at 
    BEFORE UPDATE ON signup_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial signup stats record
INSERT INTO signup_stats (count) VALUES (0) ON CONFLICT DO NOTHING; 