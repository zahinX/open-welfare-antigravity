-- ========================================================
-- Phase 5: Volunteer Shift Management Schema Enhancements
-- Non-destructive additive migration
-- ========================================================

-- 1. Add updated_at column to volunteer_shifts table if not exists
ALTER TABLE public.volunteer_shifts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_start_time ON public.volunteer_shifts(start_time ASC);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_created_at ON public.volunteer_shifts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_shift_id ON public.volunteer_signups(shift_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_user_id ON public.volunteer_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_attended ON public.volunteer_signups(attended);

-- 3. Automatically update updated_at timestamp on volunteer_shifts
CREATE OR REPLACE FUNCTION public.set_volunteer_shifts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_volunteer_shifts_updated_at ON public.volunteer_shifts;
CREATE TRIGGER tr_volunteer_shifts_updated_at
    BEFORE UPDATE ON public.volunteer_shifts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_volunteer_shifts_updated_at();
