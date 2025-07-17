-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'provider', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    avatar_url TEXT,
    resume_url TEXT,
    bio TEXT,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    skills TEXT[],
    company_name TEXT
);

-- Ensure proper auth policies for users table
CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Add proper RLS policies for users table
CREATE POLICY "Enable read access for users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for registration" ON users
  FOR INSERT WITH CHECK (
    auth.uid() = id
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE USING (
    auth.uid() = id
    OR auth.role() = 'service_role'
  );

-- Update permissions
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT SELECT ON courses TO authenticated;
GRANT SELECT, INSERT ON enrollments TO authenticated;
GRANT SELECT ON course_modules TO authenticated;
GRANT SELECT ON course_lessons TO authenticated;
GRANT SELECT, INSERT ON user_progress TO authenticated;

-- Add RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    provider_id UUID REFERENCES users(id),
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'draft',
    thumbnail_url TEXT
);

-- Create enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    status TEXT DEFAULT 'in_progress',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Create course modules table
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id),
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course lessons table
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id),
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES course_lessons(id),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);

-- Create jobs/internships table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('job', 'internship')),
    location TEXT,
    salary_range TEXT,
    requirements TEXT[],
    provider_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active'
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id),
    user_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(opportunity_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_courses_provider_id ON courses(provider_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_opportunities_provider_id ON opportunities(provider_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);

-- Add cascading deletes
ALTER TABLE enrollments
DROP CONSTRAINT enrollments_course_id_fkey,
ADD CONSTRAINT enrollments_course_id_fkey
  FOREIGN KEY (course_id)
  REFERENCES courses(id)
  ON DELETE CASCADE;

ALTER TABLE applications
DROP CONSTRAINT applications_opportunity_id_fkey,
ADD CONSTRAINT applications_opportunity_id_fkey
  FOREIGN KEY (opportunity_id)
  REFERENCES opportunities(id)
  ON DELETE CASCADE;

-- Set up storage policies
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');
INSERT INTO storage.buckets (id, name) VALUES ('resumes', 'resumes');
INSERT INTO storage.buckets (id, name) VALUES ('course-thumbnails', 'course-thumbnails');

CREATE POLICY "Public avatars access" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Auth users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can upload resumes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' 
        AND auth.role() = 'authenticated'
    );
