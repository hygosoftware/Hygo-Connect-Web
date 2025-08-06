import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface WithAuthProps {
  redirectTo?: string;
  requireAuth?: boolean;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const { redirectTo = '/login', requireAuth = true } = options;

  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (requireAuth && !isAuthenticated) {
          // User is not authenticated but auth is required
          router.replace(redirectTo);
        } else if (!requireAuth && isAuthenticated) {
          // User is authenticated but shouldn't be (e.g., login page)
          router.replace('/home');
        }
      }
    }, [isAuthenticated, loading, router]);

    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render the component if auth requirements aren't met
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (!requireAuth && isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default withAuth;
