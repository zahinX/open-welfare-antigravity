-- ========================================================
-- Phase 4: Beneficiary & Disbursement Schema Enhancements
-- Non-destructive additive migration
-- ========================================================

-- 1. Add updated_at column to beneficiaries table if not exists
ALTER TABLE public.beneficiaries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Add created_at column to disbursements table if not exists
ALTER TABLE public.disbursements
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at ON public.beneficiaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disbursements_beneficiary_id ON public.disbursements(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_campaign_id ON public.disbursements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_disbursed_at ON public.disbursements(disbursed_at DESC);

-- 4. Automatically update updated_at timestamp on beneficiaries
CREATE OR REPLACE FUNCTION public.set_beneficiaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_beneficiaries_updated_at ON public.beneficiaries;
CREATE TRIGGER tr_beneficiaries_updated_at
    BEFORE UPDATE ON public.beneficiaries
    FOR EACH ROW
    EXECUTE FUNCTION public.set_beneficiaries_updated_at();
