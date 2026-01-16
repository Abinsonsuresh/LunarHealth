// src/app/components/SignOutButton.js
"use client"
import { supabase } from "@/libs/supabase/supabaseBrowser"

export default function SignOutButton() {
  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <button
      className="text-black p-4 bg-red-100 w-full"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  )
}
