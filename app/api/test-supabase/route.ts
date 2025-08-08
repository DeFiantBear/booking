import { NextRequest, NextResponse } from 'next/server'
import { supabase, BOOKINGS_TABLE } from '@/lib/supabase'
import { generateUUID } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection and table structure...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }
    
    console.log('✅ Supabase connection successful')
    console.log('✅ Sample data:', data)
    
    // Try to get table info by attempting an insert with minimal data
    const testBooking = {
      id: generateUUID(), // Use proper UUID format
      date: '2025-01-01',
      starttime: '12:00',
      duration: 1,
      adults: 1,
      children: 0,
      totalprice: 15,
      status: 'pending',
      paymentmethod: 'cash',
      paymentstatus: 'pending',
      contactname: 'Test User',
      contactemail: 'test@test.com',
      contactphone: '123456789',
      specialrequests: null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      bookingtype: 'vr',
      partypackage: null
    }
    
    console.log('🔍 Attempting test insert with data:', testBooking)
    
    const { data: insertData, error: insertError } = await supabase
      .from(BOOKINGS_TABLE)
      .insert([testBooking])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Test insert failed',
        details: insertError,
        tableStructure: 'Could not determine - insert failed'
      })
    }
    
    console.log('✅ Test insert successful:', insertData)
    
    // Clean up test data
    await supabase
      .from(BOOKINGS_TABLE)
      .delete()
      .eq('id', testBooking.id)
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection and table structure verified',
      sampleData: data,
      testInsert: insertData,
      tableColumns: Object.keys(insertData)
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error
    })
  }
} 