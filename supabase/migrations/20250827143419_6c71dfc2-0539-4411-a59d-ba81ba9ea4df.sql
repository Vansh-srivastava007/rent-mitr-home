-- Drop the public_listings view as it exposes sensitive data without RLS protection
-- The application already uses secure functions get_listings_safe() and get_listing_safe()
-- which properly handle data privacy based on authentication status

DROP VIEW IF EXISTS public.public_listings;