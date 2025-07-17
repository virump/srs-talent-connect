-- Insert admin user
INSERT INTO users (id, email, full_name, role) VALUES
('d111a111-1111-1111-1111-111111111111', 'admin@learnhub.com', 'Admin User', 'admin');

-- Insert course providers
INSERT INTO users (id, email, full_name, role, bio, phone, linkedin_url) VALUES
('d222b222-2222-2222-2222-222222222222', 'provider1@test.com', 'John Doe', 'provider', 'Senior Developer with 10 years experience', '+1234567890', 'linkedin.com/johndoe'),
('d333c333-3333-3333-3333-333333333333', 'provider2@test.com', 'Jane Smith', 'provider', 'Tech Lead at Google', '+1234567891', 'linkedin.com/janesmith');

-- Insert students
INSERT INTO users (id, email, full_name, role, skills, github_url) VALUES
('d444d444-4444-4444-4444-444444444444', 'student1@test.com', 'Alex Johnson', 'student', ARRAY['JavaScript', 'React', 'Node.js'], 'github.com/alexj'),
('d555e555-5555-5555-5555-555555555555', 'student2@test.com', 'Sarah Wilson', 'student', ARRAY['Python', 'Django', 'PostgreSQL'], 'github.com/sarahw');

-- Insert courses
INSERT INTO courses (id, title, description, provider_id, price, status) VALUES
('c111f111-1111-1111-1111-111111111111', 'Complete Web Development Bootcamp', 'Learn full-stack web development from scratch', 'd222b222-2222-2222-2222-222222222222', 99.99, 'published'),
('c222g222-2222-2222-2222-222222222222', 'Advanced React Patterns', 'Master React with advanced design patterns', 'd222b222-2222-2222-2222-222222222222', 79.99, 'published'),
('c333h333-3333-3333-3333-333333333333', 'Python for Data Science', 'Comprehensive Python course for data analysis', 'd333c333-3333-3333-3333-333333333333', 149.99, 'published');

-- Insert course modules
INSERT INTO course_modules (id, course_id, title, order_index) VALUES
('m111i111-1111-1111-1111-111111111111', 'c111f111-1111-1111-1111-111111111111', 'HTML & CSS Basics', 1),
('m222j222-2222-2222-2222-222222222222', 'c111f111-1111-1111-1111-111111111111', 'JavaScript Fundamentals', 2),
('m333k333-3333-3333-3333-333333333333', 'c222g222-2222-2222-2222-222222222222', 'React Hooks Deep Dive', 1);

-- Insert course lessons
INSERT INTO course_lessons (id, module_id, title, content, duration, order_index) VALUES
('l111m111-1111-1111-1111-111111111111', 'm111i111-1111-1111-1111-111111111111', 'Introduction to HTML', 'Learn the basics of HTML markup', 30, 1),
('l222n222-2222-2222-2222-222222222222', 'm111i111-1111-1111-1111-111111111111', 'CSS Styling', 'Style your web pages with CSS', 45, 2),
('l333o333-3333-3333-3333-333333333333', 'm222j222-2222-2222-2222-222222222222', 'JavaScript Basics', 'Introduction to JavaScript programming', 60, 1);

-- Insert enrollments
INSERT INTO enrollments (user_id, course_id, status) VALUES
('d444d444-4444-4444-4444-444444444444', 'c111f111-1111-1111-1111-111111111111', 'in_progress'),
('d555e555-5555-5555-5555-555555555555', 'c222g222-2222-2222-2222-222222222222', 'in_progress');

-- Insert opportunities (jobs/internships)
INSERT INTO opportunities (id, title, company_name, description, type, location, salary_range, requirements, provider_id, status) VALUES
('o111p111-1111-1111-1111-111111111111', 'Frontend Developer', 'Tech Corp', 'Looking for a skilled frontend developer', 'job', 'New York, NY', '$80,000 - $100,000', ARRAY['React', 'TypeScript', '3+ years experience'], 'd222b222-2222-2222-2222-222222222222', 'active'),
('o222q222-2222-2222-2222-222222222222', 'Summer Internship - Web Development', 'StartUp Inc', 'Great opportunity for students', 'internship', 'Remote', '$25/hour', ARRAY['HTML', 'CSS', 'JavaScript'], 'd333c333-3333-3333-3333-333333333333', 'active');

-- Insert applications
INSERT INTO applications (opportunity_id, user_id, status) VALUES
('o111p111-1111-1111-1111-111111111111', 'd444d444-4444-4444-4444-444444444444', 'pending'),
('o222q222-2222-2222-2222-222222222222', 'd555e555-5555-5555-5555-555555555555', 'pending');

-- Insert user progress
INSERT INTO user_progress (user_id, lesson_id, completed, completed_at) VALUES
('d444d444-4444-4444-4444-444444444444', 'l111m111-1111-1111-1111-111111111111', true, CURRENT_TIMESTAMP),
('d444d444-4444-4444-4444-444444444444', 'l222n222-2222-2222-2222-222222222222', true, CURRENT_TIMESTAMP),
('d555e555-5555-5555-5555-555555555555', 'l333o333-3333-3333-3333-333333333333', true, CURRENT_TIMESTAMP);

-- Update providers with company names
UPDATE users 
SET company_name = 'Tech Academy'
WHERE id = 'd222b222-2222-2222-2222-222222222222';

UPDATE users 
SET company_name = 'Google'
WHERE id = 'd333c333-3333-3333-3333-333333333333';

-- Update existing opportunities
UPDATE opportunities
SET company_name = (
  SELECT company_name 
  FROM users 
  WHERE users.id = opportunities.provider_id
)
WHERE provider_id IS NOT NULL;
