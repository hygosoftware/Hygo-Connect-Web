import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    console.log('🔍 [Test Connection] Testing API connection to:', `${API_BASE_URL}/Staff/d`);
    
    const response = await axios.get(`${API_BASE_URL}/Staff/d`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });

    return NextResponse.json({
      success: true,
      status: response.status,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method,
        headers: response.config.headers,
      },
    });
  } catch (error: any) {
    console.error('❌ [Test Connection] Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      },
      { status: error.response?.status || 500 }
    );
  }
}
