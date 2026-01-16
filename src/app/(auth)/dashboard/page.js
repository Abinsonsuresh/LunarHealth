// src/app/(auth)/dashboard/page.js
import SignOutButton from "@/components/SignOutButton"
import { createServerSupabase } from "@/libs/supabase/supabaseServer"

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase.auth.getSession()
  const session = data?.session

  const userEmail = session?.user?.email ?? "Unknown"

  // Example server-side query using RLS (optional)
  // const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>
        Signed in as: <strong>{userEmail}</strong>
      </p>
      <SignOutButton />
    </main>
  )
}
