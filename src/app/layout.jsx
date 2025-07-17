import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'  // Update import path
import { Inter } from 'next/font/google'

const Navbar = dynamic(
  () => import('@/components/layout/navbar').then(mod => mod.Navbar),
  { ssr: false }
);

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "SRS",
  description: "Your one-stop platform for courses, internships, and training",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
