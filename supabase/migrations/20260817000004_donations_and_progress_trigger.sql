-- Migration: Enhance donations table with multi-currency conversion and atomic campaign progress trigger

-- 1. Add new columns to donations table
ALTER TABLE public.donations
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
    ADD COLUMN IF NOT EXISTS converted_amount NUMERIC NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC NOT NULL DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS donor_name TEXT,
    ADD COLUMN IF NOT EXISTS donor_email TEXT,
    ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing rows if any
UPDATE public.donations
SET converted_amount = amount,
    donor_name = COALESCE(donor_name, donor_name_override)
WHERE converted_amount = 0;

-- 2. Create trigger function to keep campaign current_amount atomically up-to-date
CREATE OR REPLACE FUNCTION public.update_campaign_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.payment_status = 'completed') THEN
            UPDATE public.campaigns
            SET current_amount = current_amount + NEW.converted_amount
            WHERE id = NEW.campaign_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.payment_status <> 'completed' AND NEW.payment_status = 'completed') THEN
            UPDATE public.campaigns
            SET current_amount = current_amount + NEW.converted_amount
            WHERE id = NEW.campaign_id;
        ELSIF (OLD.payment_status = 'completed' AND NEW.payment_status <> 'completed') THEN
            UPDATE public.campaigns
            SET current_amount = GREATEST(0, current_amount - OLD.converted_amount)
            WHERE id = OLD.campaign_id;
        ELSIF (OLD.payment_status = 'completed' AND NEW.payment_status = 'completed' AND OLD.converted_amount <> NEW.converted_amount) THEN
            UPDATE public.campaigns
            SET current_amount = GREATEST(0, current_amount - OLD.converted_amount + NEW.converted_amount)
            WHERE id = NEW.campaign_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.payment_status = 'completed') THEN
            UPDATE public.campaigns
            SET current_amount = GREATEST(0, current_amount - OLD.converted_amount)
            WHERE id = OLD.campaign_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_update_campaign_current_amount ON public.donations;
CREATE TRIGGER tr_update_campaign_current_amount
AFTER INSERT OR UPDATE OR DELETE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.update_campaign_current_amount();

-- 3. Row Level Security Updates
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated users to insert donations to active campaigns
DROP POLICY IF EXISTS "Users can insert their own donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;
CREATE POLICY "Anyone can insert donations"
    ON public.donations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND status = 'active'
        )
    );

-- Allow public to view public non-anonymous donations
DROP POLICY IF EXISTS "Public can view public donations" ON public.donations;
CREATE POLICY "Public can view public donations"
    ON public.donations FOR SELECT
    USING (
        is_anonymous = false OR is_public = true
    );

-- Allow donors to view their own donations
DROP POLICY IF EXISTS "Donors can view their own donations" ON public.donations;
CREATE POLICY "Donors can view their own donations"
    ON public.donations FOR SELECT
    USING (auth.uid() IS NOT NULL AND auth.uid() = donor_id);

-- Explicitly allow Admins full control
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
CREATE POLICY "Admins can view all donations"
    ON public.donations FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Admins can update donations"
    ON public.donations FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;
CREATE POLICY "Admins can delete donations"
    ON public.donations FOR DELETE
    USING (public.is_admin());

-- Ensure anon & authenticated roles have table permissions
GRANT SELECT, INSERT ON public.donations TO anon, authenticated;
GRANT UPDATE, DELETE ON public.donations TO authenticated;
