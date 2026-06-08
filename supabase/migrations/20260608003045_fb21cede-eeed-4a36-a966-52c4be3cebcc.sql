-- user_progress: tracks lesson completion per user
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number int NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wizards manage own progress v2" ON public.user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notebook: stores saved highlights from lessons
CREATE TABLE public.notebook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number int NOT NULL,
  highlighted_text text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notebook TO authenticated;
GRANT ALL ON public.notebook TO service_role;
ALTER TABLE public.notebook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wizards manage own notebook" ON public.notebook
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX notebook_user_lesson_idx ON public.notebook(user_id, lesson_number, saved_at DESC);