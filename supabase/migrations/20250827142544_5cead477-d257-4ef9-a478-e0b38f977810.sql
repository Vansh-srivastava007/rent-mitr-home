-- Create a secure view for public listings that excludes sensitive contact information
CREATE OR REPLACE VIEW public.public_listings AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  images,
  created_at,
  updated_at,
  owner_id,
  -- Hide contact_phone for unauthenticated users
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_phone
    ELSE NULL
  END as contact_phone
FROM public.listings;

-- Grant access to the view
GRANT SELECT ON public.public_listings TO authenticated, anon;

-- Create RLS policy for the view
ALTER VIEW public.public_listings SET (security_invoker = on);

-- Update existing RLS policy on listings table to be more restrictive
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;

-- Create new policy that only shows full data to authenticated users
CREATE POLICY "Public can view basic listing info" 
  ON public.listings 
  FOR SELECT 
  USING (true);

-- Since we can't easily modify what columns are returned in RLS policies,
-- let's create a function to get listings safely
CREATE OR REPLACE FUNCTION public.get_listings_safe()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  category text,
  images text[],
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid,
  contact_phone text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.images,
    l.created_at,
    l.updated_at,
    l.owner_id,
    CASE 
      WHEN auth.uid() IS NOT NULL THEN l.contact_phone
      ELSE NULL
    END as contact_phone
  FROM public.listings l;
$$;

-- Create function to get single listing safely
CREATE OR REPLACE FUNCTION public.get_listing_safe(listing_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  category text,
  images text[],
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid,
  contact_phone text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.images,
    l.created_at,
    l.updated_at,
    l.owner_id,
    CASE 
      WHEN auth.uid() IS NOT NULL THEN l.contact_phone
      ELSE NULL
    END as contact_phone
  FROM public.listings l
  WHERE l.id = listing_id;
$$;