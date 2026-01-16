// src/app/(unauth)/page.js
"use client"
import { useState } from "react"
import { supabase } from "@/libs/supabase/supabaseBrowser"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function signInPassword() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // Full navigation to ensure server layout (auth) runs and shows dashboard
    // This also guarantees cookies are read by the server on the fresh request.
    window.location.href = "/dashboard"
  }

  // Optional: listen for auth state changes (not strictly required when doing hard redirect)
  // supabase.auth.onAuthStateChange((_event, session) => { if (session) window.location.href = '/dashboard'; });

  return (
    <main style={{ padding: 20 }}>
      <h1>Sign in</h1>
      <label>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <br />
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
      </label>
      <br />
      <button onClick={signInPassword} disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </main>
  )
}
