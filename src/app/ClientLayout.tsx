'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AppLayout } from "@/components/layouts";
import PWASetup from "@/components/PWASetup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { ToastProvider } from "@/contexts/ToastContext";

// Client-side only component for authentication
const ClientAuthWrapper = dynamic(
  () => import('@/components/auth/AuthWrapper'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ToastProvider>
      <ClientAuthWrapper>
        <AppLayout>
          <PWASetup />
          <PWAInstallPrompt />
          {children}
        </AppLayout>
      </ClientAuthWrapper>
    </ToastProvider>
  );
}
