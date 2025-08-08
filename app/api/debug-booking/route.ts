import { NextRequest, NextResponse } from 'next/server'
import { supabase, BOOKINGS_TABLE } from '@/lib/supabase'
import { generateUUID } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Starting booking creation test...')
    
    const body = await request.json()
    console.log('🔍 DEBUG: Received data:', JSON.stringify(body, null, 2))
    
    // Step 1: Test basic Supabase connection
    console.log('🔍 DEBUG: Step 1 - Testing Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from(BOOKINGS_TABLE)
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ DEBUG: Connection failed:', connectionError)
      return NextResponse.json({
        success: false,
        step: 'connection',
        error: connectionError
      })
    }
    
    console.log('✅ DEBUG: Connection successful')
    
    // Step 2: Create test booking data
    console.log('🔍 DEBUG: Step 2 - Creating test booking...')
    const testBooking = {
      id: generateUUID(),
      date: body.date || '2025-01-01',
      starttime: body.startTime || '12:00',
      duration: Number(body.duration) || 1,
      adults: Number(body.adults) || 1,
      children: Number(body.children) || 0,
      totalprice: Number(body.totalPrice) || 15,
      status: 'pending',
      paymentmethod: body.paymentMethod || 'cash',
      paymentstatus: 'pending',
      contactname: body.contactName || 'Test User',
      contactemail: body.contactEmail || 'test@test.com',
      contactphone: body.contactPhone || '123456789',
      specialrequests: body.specialRequests || null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      bookingtype: body.bookingType || 'vr',
      partypackage: body.partyPackage || null
    }
    
    console.log('🔍 DEBUG: Test booking data:', JSON.stringify(testBooking, null, 2))
    
    // Step 3: Attempt insert
    console.log('🔍 DEBUG: Step 3 - Attempting insert...')
    const { data: insertData, error: insertError } = await supabase
      .from(BOOKINGS_TABLE)
      .insert([testBooking])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ DEBUG: Insert failed:', insertError)
      return NextResponse.json({
        success: false,
        step: 'insert',
        error: insertError,
        testData: testBooking
      })
    }
    
    console.log('✅ DEBUG: Insert successful:', insertData)
    
    // Step 4: Verify the booking was saved
    console.log('🔍 DEBUG: Step 4 - Verifying saved booking...')
    const { data: verifyData, error: verifyError } = await supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .eq('id', testBooking.id)
      .single()
    
    if (verifyError) {
      console.error('❌ DEBUG: Verification failed:', verifyError)
      return NextResponse.json({
        success: false,
        step: 'verification',
        error: verifyError,
        insertData
      })
    }
    
    console.log('✅ DEBUG: Verification successful:', verifyData)
    
    // Step 5: Clean up test data
    console.log('🔍 DEBUG: Step 5 - Cleaning up test data...')
    await supabase
      .from(BOOKINGS_TABLE)
      .delete()
      .eq('id', testBooking.id)
    
    console.log('✅ DEBUG: Test completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'All steps completed successfully',
      testData: testBooking,
      insertResult: insertData,
      verificationResult: verifyData
    })
    
  } catch (error) {
    console.error('❌ DEBUG: Unexpected error:', error)
    return NextResponse.json({
      success: false,
      step: 'unexpected',
      error: error
    })
  }
} 