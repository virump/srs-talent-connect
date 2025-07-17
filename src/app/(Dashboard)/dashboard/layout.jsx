import DashboardLayout from '@/components/layout/dashboard-layout'
import { AuthCheck } from '@/components/auth/auth-check'

export default function RootLayout({ children }) {
  return (
   
    <>
    {/* <AuthCheck /> */}
        <DashboardLayout>{children}</DashboardLayout>

      </>
  )
}
