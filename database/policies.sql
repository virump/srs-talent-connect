-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Courses table policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published courses"
ON courses FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "Providers can CRUD own courses"
ON courses FOR ALL
TO authenticated
USING (provider_id = auth.uid());

-- Enrollments table policies
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Opportunities table policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active opportunities"
ON opportunities FOR SELECT
TO authenticated
USING (status = 'active');

CREATE POLICY "Providers can CRUD own opportunities"
ON opportunities FOR ALL
TO authenticated
USING (provider_id = auth.uid());

-- Applications table policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
ON applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can create applications"
ON applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
