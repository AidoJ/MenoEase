-- MenoTrak Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sleep Logs Table
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIME,
  wake_time TIME,
  quality VARCHAR(20), -- 'awful', 'poor', 'good', 'great'
  night_sweats VARCHAR(20), -- 'none', 'mild', 'moderate', 'severe'
  disturbances TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Food Items Master Table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'Protein', 'Grain', 'Dairy', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food Logs Table
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(20), -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
  foods JSONB, -- Array of food items: [{id, name, category, quantity, quantityAmount, quantityUnit, isCustom}, ...]
  -- Example: [{"id": 1, "name": "Eggs", "category": "Breakfast", "quantity": {"amount": "2", "unit": "piece"}, "quantityAmount": "2", "quantityUnit": "piece", "isCustom": false}, ...]
  -- Note: quantity can be string (backward compat) or object {amount, unit}. quantityAmount/quantityUnit are stored separately for easier querying.
  post_meal_symptoms JSONB, -- Array of symptoms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptoms Table
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  physical_symptoms JSONB, -- Array of physical symptoms
  emotional_symptoms JSONB, -- Array of emotional symptoms
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  schedule JSONB, -- { time: "08:00", frequency: "daily", days: [] }
  type VARCHAR(50), -- 'medication', 'supplement', 'therapy'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Logs Table
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_type VARCHAR(50), -- 'Walking', 'Running', 'Yoga', etc.
  duration INTEGER, -- minutes
  intensity VARCHAR(20), -- 'light', 'moderate', 'vigorous', 'intense'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood Logs Table
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level INTEGER, -- 0-11 scale (references energy_levels table)
  mental_clarity JSONB, -- Array of clarity states
  emotional_state JSONB, -- Array of emotional states
  stress_management JSONB, -- Array of stress management activities
  tension_zones JSONB, -- Array of tension zones
  hydration_liters DECIMAL(4, 2),
  caffeine BOOLEAN DEFAULT FALSE,
  alcohol BOOLEAN DEFAULT FALSE,
  weather_impact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood_summary VARCHAR(50), -- 'Overall Good Day', 'Challenging Day', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weather Data Table
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  temperature DECIMAL(5, 2),
  humidity INTEGER,
  pressure DECIMAL(6, 2),
  conditions VARCHAR(100),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, location)
);

-- Insights Table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50), -- 'sleep', 'hot_flash', 'energy', etc.
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON symptoms(user_id, date);
CREATE INDEX IF NOT EXISTS idx_medications_user ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercises_user_date ON exercises(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);

-- Enable Row Level Security
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own sleep logs" ON sleep_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs" ON sleep_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs" ON sleep_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs" ON sleep_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage own food logs" ON food_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own symptoms" ON symptoms
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercises" ON exercises
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mood logs" ON mood_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own insights" ON insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Food items are public (read-only for all users)
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view food items" ON food_items
  FOR SELECT USING (true);

-- Weather data is public (read-only for all users)
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view weather data" ON weather_data
  FOR SELECT USING (true);

