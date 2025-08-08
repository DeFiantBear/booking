-- =====================================================
-- CLEANUP EXISTING POLICIES AND APPLY SECURE ONES
-- =====================================================

-- First, drop all existing policies on the bookings table
DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public insert for new bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public update booking status" ON bookings;
DROP POLICY IF EXISTS "Allow public read access to own bookings" ON bookings;

-- =====================================================
-- NOW APPLY SECURE POLICIES
-- =====================================================

-- Enable Row Level Security on the bookings table (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY 1: Allow public read access to all bookings (for lookup)
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
-- POLICY 3: NO PUBLIC UPDATE ACCESS (SECURE)
-- No one can modify existing bookings through public API
-- =====================================================
-- No update policy = no public update access

-- =====================================================
-- POLICY 4: NO DELETE ACCESS (SECURE)
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
-- SECURITY SUMMARY:
-- =====================================================
-- ✅ Public CAN: Read all bookings, Create new bookings
-- ❌ Public CANNOT: Update existing bookings, Delete any bookings
-- 🔒 Admin functions should use service role key for full access 