
-- Add new behavioral columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN eat_out_frequency text DEFAULT 'rarely',
  ADD COLUMN calorie_tracking_attitude text DEFAULT 'dislike_a_little';

-- Create weekly reflections table
CREATE TABLE public.weekly_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  worth_it_indulgence text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections" ON public.weekly_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reflections" ON public.weekly_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reflections" ON public.weekly_reflections FOR UPDATE USING (auth.uid() = user_id);
