-- User-related cascading deletes (these are already in your code)
-- When a user is deleted, delete all related data
ALTER TABLE courses
DROP CONSTRAINT IF EXISTS courses_provider_id_fkey,
ADD CONSTRAINT courses_provider_id_fkey
    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS enrollments_user_id_fkey,
ADD CONSTRAINT enrollments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE opportunities
DROP CONSTRAINT IF EXISTS opportunities_provider_id_fkey,
ADD CONSTRAINT opportunities_provider_id_fkey
    FOREIGN KEY (provider_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_user_id_fkey,
ADD CONSTRAINT applications_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey,
ADD CONSTRAINT user_progress_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Course-related cascading deletes
-- When a course is deleted, delete all modules, lessons, enrollments
ALTER TABLE course_modules
DROP CONSTRAINT IF EXISTS course_modules_course_id_fkey,
ADD CONSTRAINT course_modules_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE;

ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey,
ADD CONSTRAINT enrollments_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE;

-- Module-related cascading deletes
-- When a module is deleted, delete all lessons
ALTER TABLE course_lessons
DROP CONSTRAINT IF EXISTS course_lessons_module_id_fkey,
ADD CONSTRAINT course_lessons_module_id_fkey
    FOREIGN KEY (module_id)
    REFERENCES course_modules(id)
    ON DELETE CASCADE;

-- Lesson-related cascading deletes
-- When a lesson is deleted, delete all progress records
ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey,
ADD CONSTRAINT user_progress_lesson_id_fkey
    FOREIGN KEY (lesson_id)
    REFERENCES course_lessons(id)
    ON DELETE CASCADE;

-- Opportunity-related cascading deletes
-- When an opportunity is deleted, delete all applications
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_opportunity_id_fkey,
ADD CONSTRAINT applications_opportunity_id_fkey
    FOREIGN KEY (opportunity_id)
    REFERENCES opportunities(id)
    ON DELETE CASCADE;