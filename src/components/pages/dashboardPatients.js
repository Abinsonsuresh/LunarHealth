"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export default function DashboardPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    condition: "",
    notes: "",
    mobile_phone: "",
    sms_status: "not_sent",
    public_token: "",
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("patients")
        .select(
          "id, full_name, age, gender, condition, notes, mobile_phone, sms_status, created_at, updated_at",
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function handleAddPatient(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg("")

    // basic validation
    if (!form.full_name || !form.mobile_phone) {
      setErrorMsg("Please provide at least full name and mobile phone.")
      setSaving(false)
      return
    }

    const toInsert = {
      full_name: form.full_name,
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender || null,
      condition: form.condition || null,
      notes: form.notes || null,
      mobile_phone: form.mobile_phone,
      sms_status: form.sms_status || "not_sent",
      public_token: form.public_token || null,
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .insert([toInsert])
        .select()
      if (error) throw error

      // append new patient to UI list
      setPatients((p) => [data[0], ...p])
      setModalOpen(false)
      setForm({
        full_name: "",
        age: "",
        gender: "",
        condition: "",
        notes: "",
        mobile_phone: "",
        sms_status: "not_sent",
        public_token: "",
      })
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to add patient. See console for details.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Patients Dashboard</h1>
          <div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow"
            >
              + Add Patient
            </button>
          </div>
        </header>

        {loading ? (
          <div>Loading patients...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">SMS Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No patients yet. Add one!
                    </td>
                  </tr>
                )}

                {patients.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{p.full_name}</td>
                    <td className="px-4 py-3">{p.age ?? "—"}</td>
                    <td className="px-4 py-3">{p.gender ?? "—"}</td>
                    <td className="px-4 py-3">{p.mobile_phone}</td>
                    <td className="px-4 py-3">{p.condition ?? "—"}</td>
                    <td className="px-4 py-3">{p.sms_status ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Full-screen modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6">
            <form
              onSubmit={handleAddPatient}
              className="w-full h-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Patient</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>

              {errorMsg && <div className="mb-4 text-red-600">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full name *
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.full_name}
                    onChange={(e) => updateForm("full_name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile phone *
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.mobile_phone}
                    onChange={(e) => updateForm("mobile_phone", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.age}
                    onChange={(e) => updateForm("age", e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.gender}
                    onChange={(e) => updateForm("gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Condition
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.condition}
                    onChange={(e) => updateForm("condition", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    SMS status
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.sms_status}
                    onChange={(e) => updateForm("sms_status", e.target.value)}
                  >
                    <option value="not_sent">not_sent</option>
                    <option value="pending">pending</option>
                    <option value="sent">sent</option>
                    <option value="failed">failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Public token
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.public_token}
                    onChange={(e) => updateForm("public_token", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium"
                >
                  {saving ? "Saving..." : "Save patient"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
