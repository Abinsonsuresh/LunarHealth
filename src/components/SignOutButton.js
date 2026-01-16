// src/app/components/SignOutButton.js
"use client"
import { supabase } from "@/libs/supabase/supabaseBrowser"

export default function SignOutButton() {
  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return <button onClick={handleSignOut}>Sign out</button>
}
