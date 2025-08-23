import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This is a server-side only function
  const data = {
    message: 'This data is server-side rendered!',
    timestamp: new Date().toISOString(),
    // You can add any server-side logic here
    // For example, database queries, API calls, etc.
  };

  return NextResponse.json(data);
}

// To make this API route work with SSR, we don't need to do anything special
// as all API routes in the App Router are server components by default

// If you want to disable SSR for a specific route, you can add:
// export const dynamic = 'force-dynamic' // Force dynamic (server) route instead of static page
// or
// export const dynamic = 'force-static' // Force static (pre-rendered) page

// You can also use revalidation for incremental static regeneration:
// export const revalidate = 60 // Revalidate this page every 60 seconds
