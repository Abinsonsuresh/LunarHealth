"use client"

import { useState } from "react"
import { supabase } from "@/libs/supabase/supabaseBrowser"

export default function AuthPage() {
  // Email auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMode, setEmailMode] = useState("signin") // signin | signup

  const [message, setMessage] = useState("")

  const redirect = () => {
    window.location.href = "/dashboard"
  }

  /* ---------------- EMAIL AUTH ---------------- */

  async function handleEmailAuth(e) {
    e.preventDefault()
    setEmailLoading(true)
    setMessage("")

    try {
      // ---------------- SIGN IN ----------------
      if (emailMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        redirect()
        return
      }

      // ---------------- SIGN UP ----------------
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (signUpError) throw signUpError

      const user = signUpData?.user
      if (!user) throw new Error("User creation failed")

      // 2️⃣ UPSERT into profiles table
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email,
          role: "patient", // ✅ REQUIRED
        },
        { onConflict: "id" },
      )

      if (profileError) throw profileError

      setMessage("Signup successful. Please sign in.")
      setEmailMode("signin")
    } catch (err) {
      setMessage(err.message || "Authentication failed")
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-1">Email Login</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in or create an account using email
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-300"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-300"
            />

            <button
              disabled={emailLoading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md"
            >
              {emailLoading
                ? "Please wait..."
                : emailMode === "signin"
                  ? "Sign in"
                  : "Sign up"}
            </button>
          </form>

          <button
            onClick={() =>
              setEmailMode(emailMode === "signin" ? "signup" : "signin")
            }
            className="mt-4 text-sm text-indigo-600"
          >
            {emailMode === "signin"
              ? "Create an account"
              : "Already have an account?"}
          </button>
        </section>
      </div>

      {message && (
        <div className="fixed bottom-6 bg-white border shadow px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}
    </main>
  )
}
