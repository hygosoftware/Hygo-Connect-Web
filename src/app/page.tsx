'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function () {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.replace('/login');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-white flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    </div>
  );
}
