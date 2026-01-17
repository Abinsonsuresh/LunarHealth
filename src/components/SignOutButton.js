"use client"

import { supabase } from "@/libs/supabase/supabaseBrowser"

export default function SignOutButton() {
  async function handleSignOut() {
    try {
      // Clear session in Supabase
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      // Full reload to home page clears all Next.js client-side cache and memory
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error.message)
      // Fallback redirect if signOut fails or takes too long
      window.location.href = "/"
    }
  }

  return (
    <button
      className="text-black p-4 bg-red-100 w-full hover:bg-red-200 transition-colors"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  )
}
