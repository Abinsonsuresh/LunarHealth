// src/app/(auth)/dashboard/page.js

import DashboardAdmin from "@/components/pages/dashboardAdmin"
import DashboardPatients from "@/components/pages/dashboardPatients"
import PatientDetailsPage from "@/components/pages/patientDetailsPage"
import SignOutButton from "@/components/SignOutButton"
import Sidebar from "@/components/ui/sidebar"
import { createServerSupabase } from "@/libs/supabase/supabaseServer"

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  const userEmail = session?.user?.email ?? "Unknown"
  const userId = session.user.id

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, email,mob_num,id")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Profile fetch error:", error)
    redirect("/login")
  }

  console.log(profile)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar profile={profile} userEmail={userEmail} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#213448] md:ml-0 ml-12">
            Dashboard
          </h1>
        </div>

        {profile?.role === "super_admin" && <DashboardAdmin />}
        {profile?.role === "attender" && <DashboardPatients />}
        {profile?.role === "doctor" && <DashboardPatients />}
        {profile?.role === "patient" && (
          <PatientDetailsPage
            profile={profile && profile}
            patientNumber={profile && profile?.phone}
          />
        )}
      </main>
    </div>
  )
}
