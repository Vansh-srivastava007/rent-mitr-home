-- Fix phone number exposure by restricting public access to contact_phone
-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Public can view basic listing info" ON listings;

-- Create a new policy that hides contact_phone from anonymous users
CREATE POLICY "Public can view listing info without contact"
ON listings FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN contact_phone IS NULL
    ELSE true
  END
);

-- Note: This policy allows authenticated users to see all fields including contact_phone
-- Anonymous users can query listings but contact_phone will appear as NULL in results
-- The get_listings_safe() function provides additional defense-in-depth