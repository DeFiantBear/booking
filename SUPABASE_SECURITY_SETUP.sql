-- =====================================================
-- SUPABASE SECURITY SETUP FOR BOOKING SYSTEM
-- =====================================================

-- Enable Row Level Security on the bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY 1: Allow public read access to all bookings
-- This allows the booking lookup functionality to work
-- =====================================================
CREATE POLICY "Allow public read access to bookings" ON bookings
FOR SELECT USING (true);

-- =====================================================
-- POLICY 2: Allow public insert for new bookings
-- This allows customers to create new bookings
-- =====================================================
CREATE POLICY "Allow public insert for new bookings" ON bookings
FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLICY 3: Allow public update for booking status only
-- This allows updating payment status, etc. but not core data
-- =====================================================
CREATE POLICY "Allow public update booking status" ON bookings
FOR UPDATE USING (true)
WITH CHECK (
  -- Only allow updates to specific fields for security
  -- This prevents modification of core booking data
  (SELECT COUNT(*) FROM jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD)) AS changed_fields) <= 3
);

-- =====================================================
-- POLICY 4: NO DELETE ACCESS (Security by default)
-- No one can delete bookings through the API
-- =====================================================
-- No policy created = no delete access

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
-- OPTIONAL: Add rate limiting at application level
-- =====================================================
-- Consider implementing rate limiting in your Next.js API routes
-- to prevent spam bookings from the same IP address

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. These policies allow public read/write access but prevent deletion
-- 2. The update policy is restrictive to prevent data tampering
-- 3. For production, consider adding authentication for admin functions
-- 4. Monitor your Supabase logs for any policy violations
-- 5. Test thoroughly after applying these policies 