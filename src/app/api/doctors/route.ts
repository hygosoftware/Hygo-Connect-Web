import { NextResponse } from 'next/server';
import { doctorService } from '@/services/apiServices';

// This route will be server-side rendered
export async function GET() {
  console.log('🔍 [API] /api/doctors endpoint called at', new Date().toISOString());
  
  try {
    console.log('🌐 [API] Fetching all doctors...');
    const doctors = await doctorService.getAllDoctors();
    
    console.log(`✅ [API] Successfully fetched ${doctors.length} doctors`);
    
    return NextResponse.json({
      success: true,
      data: doctors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [API] Error in /api/doctors:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch doctors',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Control caching behavior (uncomment to enable)
// export const revalidate = 60; // Revalidate every 60 seconds

// Disable caching for debugging (uncomment if needed)
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
