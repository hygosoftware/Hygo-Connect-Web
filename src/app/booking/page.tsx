import { Suspense } from "react";
import { ErrorBoundary } from "../../components/atoms";
import { ToastProvider } from "../../contexts/ToastContext";
import { BookingProvider } from "../../contexts/BookingContext";
import dynamic from "next/dynamic";

// Dynamically import the client component to ensure proper module handling and client-side rendering
const BookingContent = dynamic(() => import("./BookingContent"), { ssr: false });

export default function BookingPage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BookingProvider>
          <Suspense fallback={<p>Loading booking page...</p>}>
            <BookingContent />
          </Suspense>
        </BookingProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
