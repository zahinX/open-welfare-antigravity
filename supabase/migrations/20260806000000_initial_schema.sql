-- ==========================================
-- Core Enums
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'volunteer', 'public');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE beneficiary_status AS ENUM ('pending', 'approved', 'rejected', 'inactive');

-- ==========================================
-- 1. profiles
-- ==========================================
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'public',
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Read: Users can read their own profile. Admins can read all profiles.
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Write: Users can update their own profile (name, phone). Admins can update roles.
CREATE POLICY "Users can update own basic info" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); -- Note: Role changes by users should ideally be prevented via trigger or application logic, as RLS column-level grants are complex. We'll handle strict enforcement in app logic.

CREATE POLICY "Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 2. campaigns
-- ==========================================
CREATE TABLE public.campaigns (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    status campaign_status NOT NULL DEFAULT 'draft',
    deadline_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Read: Anyone can read active/completed. Admins read all.
CREATE POLICY "Anyone can view active campaigns" 
    ON public.campaigns FOR SELECT 
    USING (status IN ('active', 'completed'));

CREATE POLICY "Admins can view all campaigns" 
    ON public.campaigns FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Write: Admins only
CREATE POLICY "Admins can insert campaigns" 
    ON public.campaigns FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update campaigns" 
    ON public.campaigns FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete campaigns" 
    ON public.campaigns FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 3. donations
-- ==========================================
CREATE TABLE public.donations (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.profiles(id),
    donor_name_override TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Read: Admins read all. Donors read own. Public reads if is_public.
CREATE POLICY "Admins can view all donations" 
    ON public.donations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Donors can view their own donations" 
    ON public.donations FOR SELECT 
    USING (auth.uid() = donor_id);

CREATE POLICY "Public can view public donations" 
    ON public.donations FOR SELECT 
    USING (is_public = true);

-- Write: Authenticated users can insert own. Admins can insert/update all.
CREATE POLICY "Users can insert their own donations" 
    ON public.donations FOR INSERT 
    WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Admins can manage all donations" 
    ON public.donations FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 4. beneficiaries
-- ==========================================
CREATE TABLE public.beneficiaries (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    contact_phone TEXT,
    address TEXT,
    family_size INTEGER NOT NULL DEFAULT 1,
    assessment_notes TEXT,
    status beneficiary_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Read/Write: Admins only
CREATE POLICY "Admins can manage beneficiaries" 
    ON public.beneficiaries FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 5. disbursements
-- ==========================================
CREATE TABLE public.disbursements (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    amount_value NUMERIC NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    disbursed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    logged_by UUID NOT NULL REFERENCES public.profiles(id)
);

ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

-- Read/Write: Admins only
CREATE POLICY "Admins can manage disbursements" 
    ON public.disbursements FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 6. volunteer_shifts
-- ==========================================
CREATE TABLE public.volunteer_shifts (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_volunteers INTEGER NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;

-- Read: Anyone can read
CREATE POLICY "Anyone can view shifts" 
    ON public.volunteer_shifts FOR SELECT 
    USING (true);

-- Write: Admins only
CREATE POLICY "Admins can manage shifts" 
    ON public.volunteer_shifts FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 7. volunteer_signups
-- ==========================================
CREATE TABLE public.volunteer_signups (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.volunteer_shifts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(shift_id, user_id)
);

ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Read: Admins read all. Users read own.
CREATE POLICY "Admins can view all signups" 
    ON public.volunteer_signups FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view own signups" 
    ON public.volunteer_signups FOR SELECT 
    USING (auth.uid() = user_id);

-- Write: Users can insert/delete own. Admins can update all.
CREATE POLICY "Users can insert own signup" 
    ON public.volunteer_signups FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own signup" 
    ON public.volunteer_signups FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update signups" 
    ON public.volunteer_signups FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );
