"use client"

import React, { useEffect, useState } from "react"
import Select from "react-select"
import { generateQRCode } from "@/utils/qrCodeGenerator"
import { supabase } from "@/utils/config"

const medicineOptions = [
  { value: "Paracetamol 500mg", label: "Paracetamol 500mg" },
  { value: "Ibuprofen 400mg", label: "Ibuprofen 400mg" },
  { value: "Amoxicillin 250mg", label: "Amoxicillin 250mg" },
  { value: "Amoxicillin 500mg", label: "Amoxicillin 500mg" },
  { value: "Aspirin 100mg", label: "Aspirin 100mg" },
  { value: "Aspirin 500mg", label: "Aspirin 500mg" },
  { value: "Metformin 500mg", label: "Metformin 500mg" },
  { value: "Metformin 1000mg", label: "Metformin 1000mg" },
  { value: "Lisinopril 10mg", label: "Lisinopril 10mg" },
  { value: "Atorvastatin 20mg", label: "Atorvastatin 20mg" },
  { value: "Omeprazole 20mg", label: "Omeprazole 20mg" },
  { value: "Loratadine 10mg", label: "Loratadine 10mg" },
  { value: "Cetirizine 10mg", label: "Cetirizine 10mg" },
  { value: "Ciprofloxacin 500mg", label: "Ciprofloxacin 500mg" },
  { value: "Doxycycline 100mg", label: "Doxycycline 100mg" },
  { value: "Cephalexin 500mg", label: "Cephalexin 500mg" },
  { value: "Azithromycin 500mg", label: "Azithromycin 500mg" },
  { value: "Metronidazole 400mg", label: "Metronidazole 400mg" },
  { value: "Diclofenac 50mg", label: "Diclofenac 50mg" },
  { value: "Ranitidine 150mg", label: "Ranitidine 150mg" },
]

/**
 * PatientModal
 *
 * Props:
 * - open: boolean
 * - mode: "add" | "edit"
 * - initialData: patient object when editing (must include `id`)
 * - onClose: callback
 * - onSaved: callback(data, { mode })
 */
export default function PatientModal({
  open,
  mode = "add",
  enableSearch = false,
  initialData = null,
  onClose,
  onSaved,
  onPatientSelect,
  userRole,
}) {
  // Patient-level form (demographics)
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    mobile_phone: "",
    status: "admitted",
  })

  // Visit form used for initial visit (on add) and add-visit in edit mode
  const [visitForm, setVisitForm] = useState({
    condition: "",
    notes: "",
    doctor_id: "",
    diagnosis: "",
    treatment: "",
    prescriptions: [],
    status: "admitted",
  })

  const [doctors, setDoctors] = useState([])
  const [visits, setVisits] = useState([])
  const [visitsLoading, setVisitsLoading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [visitSaving, setVisitSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [visitError, setVisitError] = useState("")

  // QR state (only used after add)
  const [generatedId, setGeneratedId] = useState("")
  const [qrCodeHtml, setQrCodeHtml] = useState("")

  // Search state
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedName, setDebouncedName] = useState("")
  const [debouncedMobile, setDebouncedMobile] = useState("")

  // Debounce logic
  useEffect(() => {
    if (!enableSearch || mode !== "add") return

    const handler = setTimeout(() => {
      setDebouncedName(form.full_name)
      setDebouncedMobile(form.mobile_phone)
    }, 3000)

    return () => {
      clearTimeout(handler)
    }
  }, [form.full_name, form.mobile_phone, enableSearch, mode])

  // Search execution
  useEffect(() => {
    if (!enableSearch || mode !== "add") {
      setSearchResults([])
      return
    }

    if (debouncedName || debouncedMobile) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [debouncedName, debouncedMobile, enableSearch, mode])

  async function performSearch() {
    setIsSearching(true)
    try {
      let query = supabase.from("patients").select("*")
      let conditions = []

      if (debouncedName) {
        conditions.push(`full_name.ilike.%${debouncedName}%`)
      }
      if (debouncedMobile) {
        conditions.push(`mobile_phone.ilike.%${debouncedMobile}%`)
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(","))
      }

      const { data, error } = await query.limit(5)
      if (error) throw error
      setSearchResults(data || [])
    } catch (err) {
      console.error("Search failed", err)
    } finally {
      setIsSearching(false)
    }
  }

  // Reset/populate form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setForm((s) => ({ ...s, ...initialData }))
      setGeneratedId(initialData.id || "")
      setQrCodeHtml("")
      // clear visit form when editing
      setVisitForm({
        condition: "",
        notes: "",
        doctor_id: "",
        diagnosis: "",
        treatment: "",
        prescriptions: [],
        status: "admitted",
      })
    } else {
      setForm({
        full_name: "",
        age: "",
        gender: "",
        mobile_phone: "",
        status: "admitted",
      })
      setGeneratedId("")
      setQrCodeHtml("")
      setSearchResults([]) // clear search results on new open
      setVisitForm({
        condition: "",
        notes: "",
        doctor_id: "",
        diagnosis: "",
        treatment: "",
        prescriptions: [],
        status: "admitted",
      })
    }
  }, [initialData, open])

  // Fetch doctors and visits (if edit) when modal opens
  useEffect(() => {
    if (!open) return
    fetchDoctors()
    if (mode === "edit" && initialData?.id) fetchVisits(initialData.id)
  }, [open])

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "doctor")
        .order("full_name", { ascending: true })
      if (error) throw error
      setDoctors(data || [])
    } catch (err) {
      console.error("fetchDoctors", err)
    }
  }

  async function fetchVisits(patientId) {
    try {
      setVisitsLoading(true)
      const { data, error } = await supabase
        .from("patient_visits")
        .select(
          "id, visited_at, condition, notes, diagnosis, treatment, prescriptions, doctor_id, created_at",
        )
        .eq("patient_id", patientId)
        .order("visited_at", { ascending: false })
      if (error) throw error
      setVisits(data || [])
    } catch (err) {
      console.error("fetchVisits", err)
    } finally {
      setVisitsLoading(false)
    }
  }

  function updateForm(key, value) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  function updateVisitForm(key, value) {
    setVisitForm((s) => ({ ...s, [key]: value }))
  }

  // Save patient: if add -> create patient + create initial visit + generate QR
  // if edit -> update patient (no QR)
  async function savePatient(e) {
    e && e.preventDefault()
    setErrorMsg("")

    if (!form.full_name || !form.mobile_phone) {
      setErrorMsg("Please provide full name and mobile phone.")
      return
    }

    setSaving(true)
    try {
      if (mode === "edit" && initialData?.id) {
        const { data, error } = await supabase
          .from("patients")
          .update({
            full_name: form.full_name,
            age: form.age ? parseInt(form.age, 10) : null,
            gender: form.gender || null,
            mobile_phone: form.mobile_phone,
            status: form.status || "admitted",
          })
          .eq("id", initialData.id)
          .select()
          .single()

        if (error) throw error

        onSaved?.(data, { mode: "edit" })
        onClose?.()
      } else {
        // Check if mobile number already exists
        const { data: existingPatients, error: checkError } = await supabase
          .from("patients")
          .select("id")
          .eq("mobile_phone", form.mobile_phone)
          .limit(1)

        if (checkError) throw checkError

        if (existingPatients && existingPatients.length > 0) {
          setErrorMsg("A patient with this mobile number already exists.")
          setSaving(false)
          return
        }

        // create patient
        const toInsert = {
          full_name: form.full_name,
          age: form.age ? parseInt(form.age, 10) : null,
          gender: form.gender || null,
          mobile_phone: form.mobile_phone,
          status: form.status || "admitted",
        }

        const { data, error } = await supabase
          .from("patients")
          .insert([toInsert])
          .select(
            "id, full_name, age, gender, mobile_phone, status, created_at, updated_at",
          )
          .single()

        if (error) throw error
        const patientId = data.id
        setGeneratedId(patientId)

        // create initial visit using visitForm
        const parsedPrescriptions =
          visitForm.prescriptions && visitForm.prescriptions.length > 0
            ? visitForm.prescriptions.map((p) => p.value)
            : null

        const visitPayload = {
          patient_id: patientId,
          condition: visitForm.condition || null,
          notes: visitForm.notes || null,
          doctor_id: visitForm.doctor_id || null,
          diagnosis: visitForm.diagnosis || null,
          treatment: visitForm.treatment || null,
          prescriptions: parsedPrescriptions,
          status: form.status || "admitted",
        }

        const { data: visitData, error: visitError } = await supabase
          .from("patient_visits")
          .insert([visitPayload])
          .select(
            "id, visited_at, condition, notes, diagnosis, treatment, prescriptions, doctor_id",
          )
          .single()

        if (visitError) {
          // not fatal for patient creation, but notify in console
          console.error("Initial visit creation failed:", visitError)
        } else {
          // load visits so the modal in add mode can show the initial visit if desired
          setVisits([visitData, ...visits])
        }

        // Generate QR for the patient URL
        const patientUrl = `http://localhost:3000/patients/${patientId}`
        try {
          const qrImage = await generateQRCode(patientUrl, {
            width: 256,
            margin: 4,
            color: { dark: "#000000ff", light: "#ffffffff" },
          })
          setQrCodeHtml(qrImage)
        } catch (qrErr) {
          console.error("QR generation failed", qrErr)
        }

        onSaved?.(data, { mode: "add" })
        // keep modal open so user can see QR after add
      }
    } catch (err) {
      console.error("savePatient", err)
      setErrorMsg("Failed to save patient. See console for details.")
    } finally {
      setSaving(false)
    }
  }

  // Add a visit (used in edit mode, and can also be used to add more in add-mode)
  async function saveVisit(e) {
    e && e.preventDefault()
    setVisitError("")

    // require patient id for saving visits
    const patientId = mode === "edit" ? initialData?.id : generatedId
    if (!patientId) {
      setVisitError("Patient ID missing. Save patient first.")
      return
    }

    if (!visitForm.condition && !visitForm.notes) {
      setVisitError("Please provide at least condition or notes for the visit.")
      return
    }

    setVisitSaving(true)
    try {
      const parsedPrescriptions =
        visitForm.prescriptions && visitForm.prescriptions.length > 0
          ? visitForm.prescriptions.map((p) => p.value)
          : null

      const toInsert = {
        patient_id: patientId,
        condition: visitForm.condition || null,
        notes: visitForm.notes || null,
        doctor_id: visitForm.doctor_id || null,
        diagnosis: visitForm.diagnosis || null,
        treatment: visitForm.treatment || null,
        prescriptions: parsedPrescriptions,
      }

      const { data, error } = await supabase
        .from("patient_visits")
        .insert([toInsert])
        .select(
          "id, visited_at, condition, notes, diagnosis, treatment, prescriptions, doctor_id",
        )
        .single()

      if (error) throw error

      // refresh visits list (for edit mode)
      if (mode === "edit" && initialData?.id) {
        fetchVisits(initialData.id)
      } else {
        // in add mode, prepend
        setVisits((v) => [data, ...v])
      }

      // clear visit form
      setVisitForm({
        condition: "",
        notes: "",
        doctor_id: "",
        diagnosis: "",
        treatment: "",
        prescriptions: [],
      })
    } catch (err) {
      console.error("saveVisit", err)
      setVisitError("Failed to save visit. See console for details.")
    } finally {
      setVisitSaving(false)
    }
  }

  if (!open) return null

  // helper to get doctor name by id
  function doctorNameById(id) {
    const doc = doctors.find((d) => d.id === id)
    return doc ? doc.full_name : "—"
  }

  const showSuccess = mode !== "edit" && generatedId && qrCodeHtml

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-h-[90vh] max-w-4xl bg-white rounded-2xl shadow-2xl overflow-auto p-6 flex flex-col transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#213448]">
            {showSuccess
              ? "Patient Added Successfully"
              : mode === "edit"
                ? "Edit Patient"
                : "Add Patient"}
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

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <h3 className="text-2xl font-semibold mb-4 text-[#213448]">
              Ready for Check-in
            </h3>
            <p className="text-gray-500 mb-8 text-center max-w-md">
              The patient has been successfully registered. Scan the QR code
              below to access their digital profile.
            </p>

            <div className="bg-white p-4 rounded-xl border-2 border-[#90AB8B] shadow-sm mb-6">
              <img
                src={qrCodeHtml}
                alt="patient-qr"
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-center mb-8">
              <p className="text-sm text-gray-500 mb-1">Direct Link</p>
              <code className="text-[#213448] font-mono text-sm block">
                http://localhost:3000/patients/{generatedId}
              </code>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md bg-[#213448] text-white hover:bg-[#1a2a3a] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={savePatient} className="flex flex-col flex-1">
            {errorMsg && (
              <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
                {errorMsg}
              </div>
            )}

            {/* Patient form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* Search results overlay */}
              {mode === "add" && enableSearch && searchResults.length > 0 && (
                <div className="absolute top-20 left-0 right-0 z-10 bg-white border border-[#90AB8B] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="p-2 bg-[#EBF4DD] text-xs font-semibold text-[#213448] uppercase tracking-wider">
                    Found Existing Patients ({searchResults.length})
                  </div>
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPatientSelect && onPatientSelect(p)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-medium text-[#213448]">
                          {p.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.age} yrs • {p.gender} • {p.mobile_phone}
                        </div>
                      </div>
                      <div className="text-xs bg-[#213448] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-[#213448]">
                  Full name *
                </label>
                <input
                  className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={form.full_name}
                  onChange={(e) => updateForm("full_name", e.target.value)}
                  placeholder={
                    enableSearch && mode === "add" ? "Type to search..." : ""
                  }
                  required
                />
                {isSearching && (
                  <div className="text-xs text-[#90AB8B] mt-1">
                    Searching...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#213448]">
                  Mobile phone *
                </label>
                <input
                  className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={form.mobile_phone}
                  onChange={(e) => updateForm("mobile_phone", e.target.value)}
                  placeholder={
                    enableSearch && mode === "add" ? "Type to search..." : ""
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#213448]">
                  Age
                </label>
                <input
                  type="number"
                  className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent"
                  value={form.gender}
                  onChange={(e) => updateForm("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Update details button (Only for Edit mode, above Visits) */}
            {mode === "edit" &&
              (() => {
                const isDataChanged =
                  initialData &&
                  (form.full_name !== initialData.full_name ||
                    form.mobile_phone !== (initialData.mobile_phone || "") ||
                    (form.age ? parseInt(form.age, 10) : null) !==
                      (initialData.age
                        ? parseInt(initialData.age, 10)
                        : null) ||
                    (form.gender || "") !== (initialData.gender || ""))

                const isSubmitDisabled = saving || !isDataChanged

                return (
                  <div className="mt-4 flex items-center justify-end gap-3 pb-6 border-b border-gray-100">
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="px-4 py-2 rounded-md bg-[#90AB8B] text-white font-medium hover:bg-[#7a9576] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Update patient"}
                    </button>
                  </div>
                )
              })()}

            {/* Visit inputs */}
            {userRole !== "patient" && (
              <div className="mt-0 border-t border-gray-100 pt-4">
                <h3 className="text-md font-semibold mb-3 text-[#213448]">
                  Visit (initial or new)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Doctor
                    </label>
                    <select
                      value={visitForm.doctor_id}
                      onChange={(e) =>
                        updateVisitForm("doctor_id", e.target.value)
                      }
                      className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={userRole === "attender"}
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Diagnosis
                    </label>
                    <input
                      className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={visitForm.diagnosis}
                      onChange={(e) =>
                        updateVisitForm("diagnosis", e.target.value)
                      }
                      disabled={userRole === "attender"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Treatment
                    </label>
                    <input
                      className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={visitForm.treatment}
                      onChange={(e) =>
                        updateVisitForm("treatment", e.target.value)
                      }
                      disabled={userRole === "attender"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Prescriptions
                    </label>
                    <Select
                      isMulti
                      options={medicineOptions}
                      value={visitForm.prescriptions}
                      onChange={(selected) =>
                        updateVisitForm("prescriptions", selected || [])
                      }
                      onCreateOption={(inputValue) => {
                        const newOption = {
                          value: inputValue,
                          label: inputValue,
                        }
                        updateVisitForm("prescriptions", [
                          ...visitForm.prescriptions,
                          newOption,
                        ])
                      }}
                      isClearable
                      isCreatable
                      isDisabled={userRole === "attender"}
                      placeholder="Select or type to add medicines..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "#d1d5db",
                          borderRadius: "6px",
                          color: "#213448",
                          "&:hover": {
                            borderColor: "#9ca3af",
                          },
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "#213448",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "#213448",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#90AB8B"
                            : state.isFocused
                              ? "#EBF4DD"
                              : "white",
                          color: state.isSelected ? "white" : "#213448",
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: "#EBF4DD",
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: "#213448",
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: "#90AB8B",
                          "&:hover": {
                            backgroundColor: "#90AB8B",
                            color: "white",
                          },
                        }),
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Condition
                    </label>
                    <input
                      className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2"
                      value={visitForm.condition}
                      onChange={(e) =>
                        updateVisitForm("condition", e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-[#213448]">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border text-[#213448] border-gray-300 rounded px-3 py-2"
                      value={visitForm.notes}
                      onChange={(e) => updateVisitForm("notes", e.target.value)}
                    />
                  </div>
                </div>

                {mode === "edit" && (
                  <div className="flex items-center justify-end gap-3 mb-4">
                    <div className="text-sm text-red-600">{visitError}</div>
                    <button
                      type="button"
                      onClick={saveVisit}
                      disabled={visitSaving}
                      className="px-4 py-2 rounded-md bg-[#213448] text-white disabled:opacity-50"
                    >
                      {visitSaving ? "Saving..." : "Add Visit"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Save Button for Add Mode (At Bottom) */}
            {mode === "add" && (
              <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving || !form.full_name || !form.mobile_phone}
                  className="px-6 py-2.5 rounded-md bg-[#90AB8B] text-white font-bold shadow-lg hover:bg-[#7a9576] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Save Patient Record"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
