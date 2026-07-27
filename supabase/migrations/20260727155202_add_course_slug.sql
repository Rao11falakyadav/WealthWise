/*
# Add slug column to courses

1. Modified tables
- `courses`: add `slug` text column (unique) for human-readable lesson IDs like 'budget-101'.
*/

ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
