/*
# Update schema for wealthwise redesign

## Overview
Adds a `track` column to courses to organize lessons by topic (Budgeting,
Savings, Investing, Earning, Retirement), and creates a `stories` table for
community member stories.

## Changes

1. `courses` table
   - Add `track` text column (Budgeting, Savings, Investing, Earning, Retirement)

2. New table: `stories`
   - Community stories shared by members.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `title` (text)
   - `body` (text)
   - `author_name` (text, display name)
   - `created_at` (timestamptz)

## Security
- RLS enabled on `stories`.
- Owner-scoped CRUD (TO authenticated, auth.uid() = user_id).
- `courses` SELECT policy already open to authenticated — no change needed.
*/

-- Add track column to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'General';

-- stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  author_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_stories" ON stories;
CREATE POLICY "select_own_stories" ON stories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_stories" ON stories;
CREATE POLICY "insert_own_stories" ON stories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_stories" ON stories;
CREATE POLICY "update_own_stories" ON stories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_stories" ON stories;
CREATE POLICY "delete_own_stories" ON stories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
