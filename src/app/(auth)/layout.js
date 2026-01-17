import { redirect } from "next/navigation"
import { createServerSupabase } from "@/libs/supabase/supabaseServer"

export const dynamic = "force-dynamic"

export default async function AuthLayout({ children }) {
  const supabase = createServerSupabase()

  // getUser() is the secure way to verify the user on the server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/")
  }

  // Return children directly. <html> and <body> must only be in the root layout.js.
  return <>{children}</>
}
