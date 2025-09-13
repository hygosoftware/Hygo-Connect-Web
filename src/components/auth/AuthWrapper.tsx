'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// List of public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/otp',
  '/register',
  '/forgot-password',
  '/privacy-policy',
  '/terms'
];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const token = sessionStorage.getItem('accessToken');
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      const returnUrl = searchParams?.get('from') || '';
      
      if (!token && !isPublicRoute) {
        // If not authenticated and not on a public route, redirect to login
        const redirectUrl = `/login?from=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
      } else if (token && isPublicRoute) {
        // If authenticated and on a public route, redirect to home or intended URL
        router.push(returnUrl || '/home');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
