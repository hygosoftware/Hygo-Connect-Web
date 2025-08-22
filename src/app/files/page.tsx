import { FileScreen, FileScreenDesktop } from '@/components';
import FilesClient from './FilesClient';
import { Suspense } from 'react';

// SSR-enabled page component
export default async function FilesPage() {
  // You can fetch server-side data here if needed in the future
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Files...</div>}>
      <FilesClient />
    </Suspense>
  );
}
