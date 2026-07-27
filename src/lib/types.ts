export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  shares: number;
  buy_price: number;
  current_price: number;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  content: string;
  track: string;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed: boolean;
  progress_percent: number;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
  // New optional fields for community feed
  image_url?: string;
  hashtags?: string[]; // e.g. ['#saving', '#firstinvestment']
  achievement_tag?: 'Debt Free' | 'First Investment' | 'Side Hustle' | 'Emergency Fund' | 'Business' | 'Scholarship';
  category?: 'Saving' | 'Investing' | 'Budgeting' | 'Side Hustles' | 'Entrepreneurship' | 'Scholarships' | 'Career Growth' | 'Debt-Free Journey';
  is_anonymous?: boolean;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

export interface Profile {
  id: string;
  full_name: string;
  monthly_income_goal: number;
  created_at: string;
  // Additional profile fields for community module
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  total_likes_received?: number;
  achievement_badges?: string[];
}
