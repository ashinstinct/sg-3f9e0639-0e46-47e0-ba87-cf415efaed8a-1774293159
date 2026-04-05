-- User Library Tables for Generation History

-- 1. Image Generations History
CREATE TABLE IF NOT EXISTS image_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  version_name TEXT,
  width INTEGER,
  height INTEGER,
  guidance_scale DECIMAL,
  num_steps INTEGER,
  seed BIGINT,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Video Generations History
CREATE TABLE IF NOT EXISTS video_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  version_name TEXT,
  duration INTEGER,
  aspect_ratio TEXT,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_image_generations_user_id ON image_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON image_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_generations_user_id ON video_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at DESC);

-- RLS Policies - Users can only see their own generations
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own image generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own image generations" ON image_generations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own video generations" ON video_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video generations" ON video_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own video generations" ON video_generations
  FOR DELETE USING (auth.uid() = user_id);