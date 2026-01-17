"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/utils/config"

/**
 * UpdatePhoneModal
 *
 * Props:
 * - open: boolean
 * - patientId: string (profile.id - the auth user id / profile PK)
 * - initialPhone: string (optional)
 * - onClose: () => void
 * - onUpdated: (updatedProfileRow) => void
 *
 * Behavior:
 * - Updates profile.mob_num column
 * - Then attempts to update the currently signed-in auth user's phone via supabase.auth.updateUser({ phone })
 * - Calls onUpdated(updatedProfile) on success
 */
export default function UpdatePhoneModal({
  open,
  patientId,
  initialPhone = "",
  onClose,
  onUpdated,
}) {
  const [phone, setPhone] = useState(initialPhone || "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setPhone(initialPhone || "")
      setMsg("")
      setError("")
    }
  }, [open, initialPhone])

  if (!open) return null

  function validPhone(p) {
    if (!p) return false
    // simple validation (digits and optional +), adjust for local formats if needed
    const cleaned = p.replace(/[\s-]/g, "")
    return /^[\d+]{7,15}$/.test(cleaned)
  }

  async function handleSubmit(e) {
    e && e.preventDefault()
    setMsg("")
    setError("")

    if (!validPhone(phone)) {
      setError("Please enter a valid phone number (digits, optional +).")
      return
    }

    setSaving(true)

    try {
      let updatedProfile = null

      // Update profile.mob_num (table name 'profile')
      if (patientId) {
        const { data, error } = await supabase
          .from("profiles")
          .update({ mob_num: phone })
          .eq("id", patientId)
          .select()
          .single()

        if (error) throw error
        updatedProfile = data
      }

      // Try update current auth user phone (client-side only for current session user)
      try {
        const { data: sdata } = await supabase.auth.getSession()
        const session = sdata?.session
        if (session?.user?.id) {
          // update current signed-in user's auth record
          // NOTE: This updates only the current session user
          // supabase.auth.updateUser may return { data, error } depending on SDK version
          const updateResp = await supabase.auth.updateUser({ phone })
          if (updateResp?.error) {
            console.warn("Auth updateUser failed:", updateResp.error)
          }
        }
      } catch (authErr) {
        console.warn("auth update attempt failed:", authErr)
      }

      setMsg("Phone updated successfully.")
      setError("")
      onUpdated?.(updatedProfile || null)
    } catch (err) {
      console.error("handleSubmit UpdatePhoneModal:", err)
      const msg =
        err?.message ||
        (err?.error && err.error.message) ||
        "Failed to update phone."
      setError(msg)
      setMsg("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-[#213448] mb-3">
          Update Phone Number
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Update your profile phone number.
        </p>

        <label className="block text-sm font-medium text-[#213448] mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+919876543210"
          className="w-full border text-black border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#90AB8B]"
          required
        />

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        {msg && <div className="text-sm text-green-600 mb-2">{msg}</div>}

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              setError("")
              setMsg("")
              onClose?.()
            }}
            className="px-4 py-2 text-black rounded bg-gray-200 hover:bg-gray-300"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#90AB8B] text-white hover:bg-[#7a9576]"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Phone"}
          </button>
        </div>
      </form>
    </div>
  )
}
