"use client"

import React, { useEffect, useState } from "react"
import { generateQRCode } from "@/utils/qrCodeGenerator"
import { supabase } from "@/utils/config"

export default function PatientModal({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    condition: "",
    notes: "",
    mobile_phone: "",
    status: "not_sent",
    public_token: "",
  })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [generatedId, setGeneratedId] = useState("")
  const [qrCodeHtml, setQrCodeHtml] = useState("")

  useEffect(() => {
    if (initialData) {
      setForm((s) => ({ ...s, ...initialData }))
      // ensure public_token if present
      if (initialData.public_token) setGeneratedId(initialData.public_token)
      else setGeneratedId("")
      setQrCodeHtml("")
    } else {
      setForm({
        full_name: "",
        age: "",
        gender: "",
        condition: "",
        notes: "",
        mobile_phone: "",
        status: "admitted",
        public_token: "",
      })
      setGeneratedId("")
      setQrCodeHtml("")
    }
  }, [initialData, open])

  function updateForm(key, value) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  async function savePatient(e) {
    e.preventDefault()
    setErrorMsg("")

    if (!form.full_name || !form.mobile_phone) {
      setErrorMsg("Please provide at least full name and mobile phone.")
      return
    }

    setSaving(true)

    try {
      if (mode === "edit" && initialData?.id) {
        // update flow
        const { data, error } = await supabase
          .from("patients")
          .update({
            full_name: form.full_name,
            age: form.age ? parseInt(form.age, 10) : null,
            gender: form.gender || null,
            condition: form.condition || null,
            notes: form.notes || null,
            mobile_phone: form.mobile_phone,
            status: form.status || "not_sent",
          })
          .eq("id", initialData.id)
          .select()
          .single()

        if (error) throw error

        // inform parent and close modal (no QR for update)
        onSaved?.(data, { mode: "edit" })
        onClose?.()
      } else {
        // add flow
        const toInsert = {
          full_name: form.full_name,
          age: form.age ? parseInt(form.age, 10) : null,
          gender: form.gender || null,
          condition: form.condition || null,
          notes: form.notes || null,
          mobile_phone: form.mobile_phone,
          status: form.status || "not_sent",
        }

        const { data, error } = await supabase
          .from("patients")
          .insert([toInsert])
          .select(
            "id, full_name, age, gender, condition, notes, mobile_phone, status, created_at, updated_at",
          )
          .single()

        if (error) throw error

        // Use DB id as canonical id and public_token
        const patientId = data.id
        setGeneratedId(patientId)

        // Generate QR for the patient URL
        const patientUrl = `https://lunarhealth/patients/${patientId}`
        const qrImage = await generateQRCode(patientUrl, {
          width: 256,
          margin: 4,
          color: { dark: "#000000ff", light: "#ffffffff" },
        })

        setQrCodeHtml(qrImage)

        // inform parent (so list can refresh) but keep modal open to show QR
        onSaved?.(data, { mode: "add" })
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to save patient. See console for details.")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6">
      <form
        onSubmit={savePatient}
        className="w-full h-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#213448]">
            {mode === "edit" ? "Edit Patient" : "Add Patient"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-[#213448]"
            >
              Close
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Full name *
            </label>
            <input
              className="w-full border text-black border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.full_name}
              onChange={(e) => updateForm("full_name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Mobile phone *
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.mobile_phone}
              onChange={(e) => updateForm("mobile_phone", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Age
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.age}
              onChange={(e) => updateForm("age", e.target.value)}
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Gender
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
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
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Condition
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.condition}
              onChange={(e) => updateForm("condition", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              Notes
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#213448]">
              SMS status
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
            >
              <option value="not_sent">not_sent</option>
              <option value="pending">pending</option>
              <option value="sent">sent</option>
              <option value="failed">failed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors text-[#213448] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-[#90AB8B] text-white font-medium hover:bg-[#7a9576] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Update patient"
                : "Save patient"}
          </button>
        </div>

        {/* QR shown AFTER add only (not on update) */}
        {mode !== "edit" && generatedId && qrCodeHtml && (
          <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2 text-[#213448]">
              Patient QR Code
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Scan to open patient profile
            </p>

            <img
              src={qrCodeHtml}
              alt="patient-qr"
              className="w-48 h-48 border border-[#90AB8B] p-2 bg-white rounded"
            />

            <div className="mt-2 font-mono text-sm text-[#213448]">
              https://lunarhealth/patients/{generatedId}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
