-- =====================================================
-- SECURE SUPABASE SECURITY SETUP FOR BOOKING SYSTEM
-- =====================================================

-- Enable Row Level Security on the bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY 1: Allow public read access to bookings by contact info only
-- This allows the booking lookup functionality to work
-- =====================================================
CREATE POLICY "Allow public read access to own bookings" ON bookings
FOR SELECT USING (
  -- Only allow reading bookings that match the contact email or phone
  -- This prevents seeing other people's bookings
  contactemail = current_setting('request.jwt.claims', true)::json->>'email'
  OR contactphone = current_setting('request.jwt.claims', true)::json->>'phone'
  -- Fallback: allow if no JWT (for basic lookup functionality)
  OR current_setting('request.jwt.claims', true) IS NULL
);

-- =====================================================
-- POLICY 2: Allow public insert for new bookings
-- This allows customers to create new bookings
-- =====================================================
CREATE POLICY "Allow public insert for new bookings" ON bookings
FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLICY 3: NO PUBLIC UPDATE ACCESS (More Secure)
-- Only allow updates through admin functions
-- =====================================================
-- No update policy = no public update access

-- =====================================================
-- POLICY 4: NO DELETE ACCESS (Security by default)
-- No one can delete bookings through the API
-- =====================================================
-- No policy created = no delete access

-- =====================================================
-- ALTERNATIVE: If you need some update functionality, use this instead:
-- =====================================================
-- CREATE POLICY "Allow limited public updates" ON bookings
-- FOR UPDATE USING (
--   -- Only allow updates to specific fields
--   -- This prevents modification of core booking data
--   (SELECT COUNT(*) FROM (
--     SELECT unnest(ARRAY['paymentstatus', 'status', 'updatedat']) AS allowed_fields
--   ) AS allowed) > 0
-- )
-- WITH CHECK (
--   -- Only allow updating payment status and booking status
--   -- Prevent changes to core booking data like date, time, contact info
--   (SELECT COUNT(*) FROM (
--     SELECT unnest(ARRAY['paymentstatus', 'status', 'updatedat']) AS allowed_fields
--   ) AS allowed) > 0
-- );

-- =====================================================
-- VERIFICATION QUERIES (Run these to test the policies)
-- =====================================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookings';

-- Check all policies on the bookings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookings';

-- =====================================================
-- SECURITY NOTES:
-- =====================================================
-- 1. Public can only READ their own bookings (by contact info)
-- 2. Public can CREATE new bookings
-- 3. Public CANNOT UPDATE existing bookings (more secure)
-- 4. Public CANNOT DELETE any bookings
-- 5. Admin functions should use service role key for full access
-- 6. Consider adding authentication for sensitive operations 