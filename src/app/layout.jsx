import localFont from 'next/font/local'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider, themeInitScript } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
// Imported directly: `dynamic(..., { ssr: false })` is not supported inside a
// Server Component and broke `next build` with a React Client Manifest error.
// Navbar is already a Client Component, so a plain import is both valid and
// cheaper — it reads auth state in effects, never during render.
import { Navbar } from '@/components/layout/navbar'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'SRS — Learn, Practice, Get Hired',
    template: '%s · SRS',
  },
  description:
    'SRS is the talent platform connecting learners with expert-led courses, real projects, and internship and job opportunities.',
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d12' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint to avoid a flash of light mode. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
