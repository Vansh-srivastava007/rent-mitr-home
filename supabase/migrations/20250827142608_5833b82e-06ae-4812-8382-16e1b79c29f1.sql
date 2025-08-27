-- Fix the security warnings by setting search_path for the functions
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
SET search_path = public
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

-- Fix the second function as well
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
SET search_path = public
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