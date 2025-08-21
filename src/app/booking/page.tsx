"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "../../components/atoms";
import { ToastProvider } from "../../contexts/ToastContext";
import { BookingProvider } from "../../contexts/BookingContext";
import BookingContent from "./BookingContent";

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
