// src/app/(auth)/layout.js
import { redirect } from "next/navigation"
import { createServerSupabase } from "@/libs/supabase/supabaseServer"

export const dynamic = "force-dynamic"

export default async function AuthLayout({ children }) {
  const supabase = createServerSupabase()
  const { data } = await supabase.auth.getSession()
  const session = data?.session ?? null

  if (!session) {
    // not authenticated -> send to sign-in page
    redirect("/")
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
