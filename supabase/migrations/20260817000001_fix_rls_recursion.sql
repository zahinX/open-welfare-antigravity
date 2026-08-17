-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Update profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (public.is_admin());

-- Update campaigns policies
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
CREATE POLICY "Admins can view all campaigns" 
    ON public.campaigns FOR SELECT 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.campaigns;
CREATE POLICY "Admins can insert campaigns" 
    ON public.campaigns FOR INSERT 
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update campaigns" ON public.campaigns;
CREATE POLICY "Admins can update campaigns" 
    ON public.campaigns FOR UPDATE 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
CREATE POLICY "Admins can delete campaigns" 
    ON public.campaigns FOR DELETE 
    USING (public.is_admin());

-- Update donations policies
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
CREATE POLICY "Admins can view all donations" 
    ON public.donations FOR SELECT 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all donations" ON public.donations;
CREATE POLICY "Admins can manage all donations" 
    ON public.donations FOR ALL 
    USING (public.is_admin());

-- Update beneficiaries policies
DROP POLICY IF EXISTS "Admins can manage beneficiaries" ON public.beneficiaries;
CREATE POLICY "Admins can manage beneficiaries" 
    ON public.beneficiaries FOR ALL 
    USING (public.is_admin());

-- Update disbursements policies
DROP POLICY IF EXISTS "Admins can manage disbursements" ON public.disbursements;
CREATE POLICY "Admins can manage disbursements" 
    ON public.disbursements FOR ALL 
    USING (public.is_admin());

-- Update volunteer_shifts policies
DROP POLICY IF EXISTS "Admins can manage shifts" ON public.volunteer_shifts;
CREATE POLICY "Admins can manage shifts" 
    ON public.volunteer_shifts FOR ALL 
    USING (public.is_admin());

-- Update volunteer_signups policies
DROP POLICY IF EXISTS "Admins can view all signups" ON public.volunteer_signups;
CREATE POLICY "Admins can view all signups" 
    ON public.volunteer_signups FOR SELECT 
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update signups" ON public.volunteer_signups;
CREATE POLICY "Admins can update signups" 
    ON public.volunteer_signups FOR UPDATE 
    USING (public.is_admin());
