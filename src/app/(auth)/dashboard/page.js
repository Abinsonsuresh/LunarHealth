// src/app/(auth)/dashboard/page.js
import DashboardPatients from "@/components/pages/dashboardPatients"
import SignOutButton from "@/components/SignOutButton"
import Sidebar from "@/components/ui/sidebar"
import { createServerSupabase } from "@/libs/supabase/supabaseServer"

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  const userEmail = session?.user?.email ?? "Unknown"

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar userEmail={userEmail} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#213448] md:ml-0 ml-12">
            Dashboard
          </h1>
        </div>
        <DashboardPatients />
      </main>
    </div>
  )
}
