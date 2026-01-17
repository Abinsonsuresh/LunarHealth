"use client"
import { supabase } from "@/utils/config"
import React, { useEffect, useState } from "react"

export default function UserModal({ open, onClose, onSaved }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("user")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) {
      // reset fields when closed
      setFullName("")
      setEmail("")
      setRole("user")
      setPassword("")
      setError("")
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Email is required")
      return
    }

    if (!password) {
      setError("Password is required (temporary)")
      return
    }

    setLoading(true)

    try {
      // 1️⃣ Create Auth User
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

      if (signUpError) throw signUpError

      const user = signUpData?.user
      if (!user) throw new Error("User creation failed")

      // 2️⃣ UPSERT into profiles table (SAFE)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          role,
        },
        { onConflict: "id" },
      )

      if (profileError) throw profileError

      // ✅ success
      onSaved?.({
        id: user.id,
        email,
        full_name: fullName,
        role,
      })
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Simple modal overlay + card
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="text-lg font-semibold text-[#213448] mb-4">
          Add New User
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#213448]/80 mb-1">
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Alice Johnson"
            />
          </div>

          <div>
            <label className="block text-sm text-[#213448]/80 mb-1">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border rounded-md px-3 py-2"
              placeholder="alice@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#213448]/80 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="doctor">doctor</option>
              <option value="attender">attender</option>
              <option value="receptionist">receptionist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#213448]/80 mb-1">
              Temporary password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full border rounded-md px-3 py-2"
              placeholder="Set a temporary password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-sm"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#90AB8B] text-white text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
