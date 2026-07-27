/*
# Financial Empowerment Platform Schema

## Overview
Creates the full data model for a women's financial literacy platform with
budgeting, savings goals, investment tracking, and a learning hub. Each user's
financial data is private to them (owner-scoped via auth.uid()).

## New Tables

1. `profiles`
   - Extends auth.users with display name and avatar info.
   - `id` (uuid, pk, references auth.users)
   - `full_name` (text)
   - `monthly_income_goal` (numeric, optional target income)
   - `created_at` (timestamptz)

2. `transactions`
   - Income and expense entries that feed the budget.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `amount` (numeric, always positive)
   - `type` (text: 'income' | 'expense')
   - `category` (text, e.g. 'Groceries', 'Salary')
   - `description` (text)
   - `date` (date, when the transaction occurred)
   - `created_at` (timestamptz)

3. `budgets`
   - Per-category spending limits for a given month.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `category` (text)
   - `limit_amount` (numeric, monthly cap)
   - `month` (date, first day of the target month)
   - `created_at` (timestamptz)
   - Unique constraint on (user_id, category, month)

4. `savings_goals`
   - Named savings targets with progress tracking.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `name` (text, e.g. 'Emergency Fund')
   - `target_amount` (numeric)
   - `current_amount` (numeric, default 0)
   - `target_date` (date, optional)
   - `icon` (text, optional emoji/symbol name)
   - `created_at` (timestamptz)

5. `investments`
   - Portfolio holdings the user is tracking.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `symbol` (text, ticker)
   - `name` (text, full asset name)
   - `shares` (numeric)
   - `buy_price` (numeric, average cost per share)
   - `current_price` (numeric, latest price)
   - `created_at` (timestamptz)

6. `courses`
   - Shared financial literacy lessons (read-only for users, seeded content).
   - `id` (uuid, pk)
   - `title` (text)
   - `description` (text)
   - `category` (text, e.g. 'Budgeting', 'Investing')
   - `level` (text: 'Beginner' | 'Intermediate' | 'Advanced')
   - `duration_minutes` (int)
   - `content` (text, lesson body)
   - `created_at` (timestamptz)

7. `course_progress`
   - Per-user progress through shared courses.
   - `id` (uuid, pk)
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `course_id` (uuid, fk to courses)
   - `completed` (boolean, default false)
   - `progress_percent` (int, 0-100, default 0)
   - `updated_at` (timestamptz)
   - Unique constraint on (user_id, course_id)

## Security
- RLS enabled on every table.
- profiles, transactions, budgets, savings_goals, investments, course_progress:
  owner-scoped CRUD (TO authenticated, auth.uid() = user_id).
- courses: SELECT open to authenticated (shared content); no user writes.
- All owner columns default to auth.uid() so inserts that omit user_id succeed.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  monthly_income_goal numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('income','expense')),
  category text NOT NULL DEFAULT 'Other',
  description text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);

-- budgets
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  limit_amount numeric NOT NULL DEFAULT 0,
  month date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, category, month)
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- savings_goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  icon text NOT NULL DEFAULT 'Target',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_savings_goals" ON savings_goals;
CREATE POLICY "select_own_savings_goals" ON savings_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_savings_goals" ON savings_goals;
CREATE POLICY "insert_own_savings_goals" ON savings_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_savings_goals" ON savings_goals;
CREATE POLICY "update_own_savings_goals" ON savings_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_savings_goals" ON savings_goals;
CREATE POLICY "delete_own_savings_goals" ON savings_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- investments
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  shares numeric NOT NULL DEFAULT 0,
  buy_price numeric NOT NULL DEFAULT 0,
  current_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_investments" ON investments;
CREATE POLICY "select_own_investments" ON investments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_investments" ON investments;
CREATE POLICY "insert_own_investments" ON investments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_investments" ON investments;
CREATE POLICY "update_own_investments" ON investments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_investments" ON investments;
CREATE POLICY "delete_own_investments" ON investments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- courses (shared content)
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  level text NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner','Intermediate','Advanced')),
  duration_minutes int NOT NULL DEFAULT 10,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_courses" ON courses;
CREATE POLICY "read_courses" ON courses FOR SELECT
  TO authenticated USING (true);

-- course_progress
CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  progress_percent int NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id)
);
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_course_progress" ON course_progress;
CREATE POLICY "select_own_course_progress" ON course_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_course_progress" ON course_progress;
CREATE POLICY "insert_own_course_progress" ON course_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_course_progress" ON course_progress;
CREATE POLICY "update_own_course_progress" ON course_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_course_progress" ON course_progress;
CREATE POLICY "delete_own_course_progress" ON course_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
