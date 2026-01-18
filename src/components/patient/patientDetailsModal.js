"use client"

import React, { useEffect, useState } from "react"
import { X, Save } from "lucide-react"
import { supabase } from "@/utils/config"

export function PatientDetailsModal({
  open = false,
  mode = "add",
  initialData = null,
  onClose = () => {},
  onSaved = () => {},
  patientId,
}) {
  const empty = {
    patient_id: patientId ?? null,
    full_name: "",
    date_of_birth: "",
    age: "",
    gender: "",
    nationality: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    height_cm: "",
    weight_kg: "",
    blood_group: "",
    smoking_status: "",
    alcohol_consumption: "",
    allergies: "",
    chronic_conditions: "",
    current_medications: "",
    is_active: true,
    created_at: null,
    updated_at: null,
  }

  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm((f) => ({ ...f, ...mapInitial(initialData) }))
      } else {
        setForm({ ...empty, patient_id: patientId ?? null })
      }
    }
    // keep patientId in sync when modal opens for different patients
  }, [open, initialData, patientId])

  function mapInitial(data) {
    return {
      patient_id: patientId ?? data.patient_id ?? null,
      full_name: data.full_name ?? data.fullName ?? "",
      date_of_birth: data.date_of_birth
        ? new Date(data.date_of_birth).toISOString().slice(0, 10)
        : (data.dateOfBirth ?? ""),
      age: data.age ?? "",
      gender: data.gender ?? "",
      nationality: data.nationality ?? "",
      phone:
        data.phone ??
        data.mobile_phone ??
        data.mobile_num ??
        data.mob_num ??
        "",
      emergency_contact_name: data.emergency_contact_name ?? "",
      emergency_contact_phone: data.emergency_contact_phone ?? "",
      height_cm: data.height_cm ?? "",
      weight_kg: data.weight_kg ?? "",
      blood_group: data.blood_group ?? "",
      smoking_status: data.smoking_status ?? "",
      alcohol_consumption: data.alcohol_consumption ?? "",
      allergies: data.allergies ?? "",
      chronic_conditions: data.chronic_conditions ?? "",
      current_medications: data.current_medications ?? "",
      is_active:
        typeof data.is_active === "boolean"
          ? data.is_active
          : data.status === "inactive"
            ? false
            : true,
      created_at: data.created_at ?? null,
      updated_at: data.updated_at ?? null,
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }))
    } else {
      setForm((s) => ({ ...s, [name]: value }))
    }

    if (name === "date_of_birth") {
      const dob = value ? new Date(value) : null
      if (dob && !Number.isNaN(dob.getTime())) {
        const now = new Date()
        let years = now.getFullYear() - dob.getFullYear()
        const m = now.getMonth() - dob.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--
        setForm((s) => ({ ...s, age: years }))
      }
    }
  }

  async function handleSave() {
    setError("")
    setLoading(true)

    try {
      // Build payload. IMPORTANT: do NOT invent a new `id` here,
      // because `user_details.id` typically references auth.users.id
      const payload = {
        // only include id if it's present and presumably valid (auth.user id)
        patient_id: patientId ?? form.patient_id ?? null,
        full_name: form.full_name || null,
        date_of_birth: form.date_of_birth || null,
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
        nationality: form.nationality || null,
        phone: form.phone || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        blood_group: form.blood_group || null,
        smoking_status: form.smoking_status || null,
        alcohol_consumption: form.alcohol_consumption || null,
        allergies: form.allergies || null,
        chronic_conditions: form.chronic_conditions || null,
        current_medications: form.current_medications || null,
        is_active: typeof form.is_active === "boolean" ? form.is_active : true,
      }

      // If patient_id is required, validate early
      if (!payload.patient_id) {
        throw new Error("Missing patient_id - cannot save details.")
      }

      // UPSERT by patient_id (so you keep one details row per patient).
      // NOTE: DB must have a UNIQUE constraint on patient_id for this to be safe:
      // ALTER TABLE user_details ADD CONSTRAINT user_details_patient_unique UNIQUE (patient_id);
      const { data, error: upsertError } = await supabase
        .from("user_details")
        .upsert(payload, {
          returning: "representation",
          onConflict: "patient_id",
        })

      if (upsertError) throw upsertError

      const saved = Array.isArray(data) ? data[0] : data

      onSaved(saved)
      onClose()
    } catch (err) {
      console.error("PatientModal save", err)
      // err might be an object from supabase
      setError((err && err.message) || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">
            {mode === "edit" ? "Edit Patient" : "Add Patient"}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Full name
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border p-2 font-mono text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Date of birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Age</label>
            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              type="number"
              className="w-full rounded-md border p-2 text-black bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Nationality
            </label>
            <input
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Height (cm)
            </label>
            <input
              name="height_cm"
              value={form.height_cm}
              onChange={handleChange}
              type="number"
              step="0.1"
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Weight (kg)
            </label>
            <input
              name="weight_kg"
              value={form.weight_kg}
              onChange={handleChange}
              type="number"
              step="0.1"
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Blood group
            </label>
            <select
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Is active
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={!!form.is_active}
                  onChange={handleChange}
                />
                <span className="text-sm text-black">Active</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Emergency contact name
            </label>
            <input
              name="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Emergency contact phone
            </label>
            <input
              name="emergency_contact_phone"
              value={form.emergency_contact_phone}
              onChange={handleChange}
              className="w-full rounded-md border p-2 font-mono text-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Smoking status
            </label>
            <select
              name="smoking_status"
              value={form.smoking_status}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            >
              <option value="">Select status</option>
              <option value="non_smoker">Never</option>
              <option value="former_smoker">Former</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Alcohol consumption
            </label>
            <select
              name="alcohol_consumption"
              value={form.alcohol_consumption}
              onChange={handleChange}
              className="w-full rounded-md border p-2 text-black"
            >
              <option value="">Select frequency</option>

              <option value="occasional">Occasionally</option>
              <option value="regular">Regularly</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Allergies
            </label>
            <textarea
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              className="w-full rounded-md border p-2 h-20 text-black"
              placeholder="List any known allergies..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Chronic conditions
            </label>
            <textarea
              name="chronic_conditions"
              value={form.chronic_conditions}
              onChange={handleChange}
              className="w-full rounded-md border p-2 h-20 text-black"
              placeholder="List any chronic conditions..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Current medications
            </label>
            <textarea
              name="current_medications"
              value={form.current_medications}
              onChange={handleChange}
              className="w-full rounded-md border p-2 h-20 text-black"
              placeholder="List current medications..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[#90AB8B] text-white flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
