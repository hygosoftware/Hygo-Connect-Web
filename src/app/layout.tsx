import { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/layouts";
import PWASetup from "@/components/PWASetup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Hygo - Health & Wellness Platform",
  description: "Your comprehensive health and wellness companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hygo",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Hygo Connect",
    title: "Hygo - Health & Wellness Platform",
    description: "Your comprehensive health and wellness companion",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <PWASetup />
          <AppLayout>{children}</AppLayout>
          <PWAInstallPrompt />
        </ToastProvider>
      </body>
    </html>
  );
}
