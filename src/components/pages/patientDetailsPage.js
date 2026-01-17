"use client"

import React, { useEffect, useState } from "react"
import PatientModal from "../patient/patientsModal" // keep path if correct
import UpdatePhoneModal from "../patient/updatePhone" // keep path if correct
import { supabase } from "@/utils/config"
import { Edit3, Phone, User } from "lucide-react"

/**
 * PatientDetailsPage
 * Props:
 * - patientNumber (optional) : phone string to lookup patient by phone
 * - profile (optional) : preloaded profile row { id, mob_num, ... }
 */
export default function PatientDetailsPage({ patientNumber, profile }) {
  const [profileState, setProfileState] = useState(profile || null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const [patient, setPatient] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [visits, setVisits] = useState([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [errorMsg, setErrorMsg] = useState("")

  // separate modal states
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [patientModalMode, setPatientModalMode] = useState("edit")
  const [patientModalInitial, setPatientModalInitial] = useState(null)

  const [phoneModalOpen, setPhoneModalOpen] = useState(false)

  // If no profile prop is passed, try to load current profile
  useEffect(() => {
    if (!profile) {
      ;(async () => {
        await loadCurrentProfile()
      })()
    } else {
      setProfileState(profile)
    }
  }, [profile])

  // decide what to do when we have profileState or patientNumber
  useEffect(() => {
    ;(async () => {
      // if explicit patientNumber given, always use it
      if (patientNumber) {
        await fetchPatientByPhone(patientNumber)
        return
      }

      // no patientNumber supplied -> wait for profileState
      if (!profileState) {
        return
      }

      // if profile exists but mob_num missing -> open only the phone modal
      if (!profileState.mob_num) {
        setPhoneModalOpen(true)
        return
      }

      // profile has mob_num -> fetch patient by that number
      await fetchPatientByPhone(profileState.mob_num)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileState, patientNumber])

  // load current profile from 'profile' table using session user id (if available)
  async function loadCurrentProfile() {
    try {
      setLoadingProfile(true)
      const { data: sdata } = await supabase.auth.getSession()
      const session = sdata?.session
      if (!session?.user?.id) {
        setProfileState(null)
        return
      }
      const userId = session.user.id

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) throw error
      setProfileState(data || null)
    } catch (err) {
      console.error("loadCurrentProfile", err)
      setProfileState(null)
    } finally {
      setLoadingProfile(false)
    }
  }

  // Normalize phone helper (strip spaces, leading + if you want)
  function normalizePhone(p) {
    if (!p) return p
    return p.toString().replace(/\s+/g, "").replace(/^\+/, "")
  }

  // Fetch patient by phone — robust versus different columns (mobile_phone, mobile_num, mob_num)
  async function fetchPatientByPhone(rawPhone) {
    const phone = normalizePhone(rawPhone)
    if (!phone) {
      setPatient(null)
      setVisits([])
      return
    }

    try {
      setLoadingPatient(true)

      // supabase .or uses comma-separated conditions, match exact normalized value
      // we will query the three likely columns: mobile_phone, mobile_num, mob_num
      const orQuery = `mobile_phone.eq.${phone},mobile_phone.eq.${phone},mobile_phone.eq.${phone}`

      // get results (limit 1 to avoid array of duplicates); order by newest
      const res = await supabase
        .from("patients")
        .select("*")
        .or(orQuery)
        .order("created_at", { ascending: false })
        .limit(1)

      if (res.error) throw res.error

      let found = null
      const d = res.data

      if (Array.isArray(d)) {
        found = d.length > 0 ? d[0] : null
      } else if (d && typeof d === "object") {
        // some SDK responses may return object for single record
        found = d
      }

      if (!found) {
        setPatient(null)
        setVisits([])
      } else {
        setPatient(found)
        await fetchVisits(found.id)
        await fetchDoctors()
      }
    } catch (err) {
      console.error("fetchPatientByPhone", err)
      setErrorMsg("Failed to load patient by phone.")
      setPatient(null)
      setVisits([])
    } finally {
      setLoadingPatient(false)
    }
  }

  // Fetch visits using actual patient.id (table name patient_visits)
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
      setVisits([])
    } finally {
      setVisitsLoading(false)
    }
  }

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, full_name")
        .order("full_name", { ascending: true })
      if (error) throw error
      setDoctors(data || [])
    } catch (err) {
      console.error("fetchDoctors", err)
      setDoctors([])
    }
  }

  // Called when PatientModal saves (both add & edit)
  async function handlePatientModalSaved(data, meta) {
    if (data?.id) {
      setPatient(data)
      await fetchVisits(data.id)
    } else {
      const phone = patientNumber || profileState?.mob_num
      if (phone) await fetchPatientByPhone(phone)
    }
  }

  // Called when UpdatePhoneModal updates profile
  async function handleProfileUpdated(updatedProfile) {
    // update local profile state
    if (updatedProfile) {
      setProfileState(updatedProfile)
      // if phone now exists, fetch patient by that phone
      if (updatedProfile.mob_num) {
        await fetchPatientByPhone(updatedProfile.mob_num)
      }
    } else {
      // reload profile from server if modal returned nothing
      await loadCurrentProfile()
    }
    setPhoneModalOpen(false)
  }

  // helper to map doctor id -> name
  function doctorNameByIdLocal(id) {
    const doc = doctors.find((d) => d.id === id)
    return doc ? doc.full_name : "—"
  }

  const phoneToShow = patientNumber || profileState?.mob_num || "(no phone)"

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#213448] flex items-center gap-3">
              <User className="w-6 h-6 text-[#90AB8B]" />
              Patient Details
            </h1>
            <p className="text-sm text-[#213448]/70 mt-1">
              Looking up by phone:{" "}
              <span className="font-mono">{phoneToShow}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPatientModalMode(patient ? "edit" : "add")
                setPatientModalInitial(
                  patient ?? {
                    mobile_phone: patientNumber ?? profileState?.mob_num ?? "",
                  },
                )
                setPatientModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#EBF4DD] text-[#213448] hover:bg-[#90AB8B] hover:text-white transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Patient card */}
        {loadingPatient ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            Loading patient...
          </div>
        ) : patient ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#90AB8B] text-white flex items-center justify-center text-2xl font-bold">
                {patient.full_name ? patient.full_name.charAt(0) : "?"}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#213448]">
                    {patient.full_name}
                  </h2>
                  <div className="text-sm text-[#213448]/60 font-mono">
                    {patient.id?.slice(0, 8)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-[#213448]/80">
                  <div>
                    <div className="text-xs text-[#213448]/60">Age</div>
                    <div className="font-medium">{patient.age ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-[#213448]/60">Gender</div>
                    <div className="font-medium">{patient.gender ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-[#213448]/60">Mobile</div>
                    <div className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#90AB8B]" />
                      {patient.mobile_phone ??
                        patient.mobile_num ??
                        patient.mob_num ??
                        "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-[#213448]/80">
                  <div>
                    <div className="text-xs text-[#213448]/60">Status</div>
                    <div className="inline-block px-3 py-1 rounded-full bg-[#EBF4DD] text-[#90AB8B]">
                      {patient.status ?? "—"}
                    </div>
                  </div>

                  {patient.condition && (
                    <div className="mt-3">
                      <div className="text-xs text-[#213448]/60">
                        Condition (patient-level)
                      </div>
                      <div className="font-medium">{patient.condition}</div>
                    </div>
                  )}

                  {patient.notes && (
                    <div className="mt-2">
                      <div className="text-xs text-[#213448]/60">
                        Notes (patient-level)
                      </div>
                      <div className="font-medium whitespace-pre-wrap">
                        {patient.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600">
              {errorMsg || "Patient not found."}
            </div>
            <div className="mt-3 text-sm text-[#213448]/70">
              You can create a patient record by clicking Edit and filling
              details (phone is required).
            </div>
          </div>
        )}

        {/* Visits */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#213448]">Visits</h3>
            <div className="text-sm text-[#213448]/70">
              {visitsLoading ? "Loading..." : `${visits.length} visit(s)`}
            </div>
          </div>

          {visitsLoading ? (
            <div className="text-sm text-[#213448]/70">Loading visits...</div>
          ) : visits.length === 0 ? (
            <div className="text-sm text-[#213448]/70">
              No visits found for this patient.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visits.map((v) => (
                <div key={v.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-[#213448]">
                      {v.visited_at
                        ? new Date(v.visited_at).toLocaleString()
                        : v.created_at
                          ? new Date(v.created_at).toLocaleString()
                          : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {v.id?.slice(0, 8)}
                    </div>
                  </div>

                  <div className="text-sm text-[#213448]/90 mb-2">
                    Condition:{" "}
                    <span className="font-medium">{v.condition ?? "—"}</span>
                  </div>
                  <div className="text-sm text-[#213448]/80 mb-2">
                    Notes: {v.notes ?? "—"}
                  </div>

                  {v.diagnosis && (
                    <div className="text-sm mb-1">
                      Diagnosis:{" "}
                      <span className="font-medium">{v.diagnosis}</span>
                    </div>
                  )}
                  {v.treatment && (
                    <div className="text-sm mb-1">
                      Treatment:{" "}
                      <span className="font-medium">{v.treatment}</span>
                    </div>
                  )}
                  {v.doctor_id && (
                    <div className="text-sm mt-1">
                      Doctor:{" "}
                      <span className="font-medium">
                        {doctorNameByIdLocal(v.doctor_id)}
                      </span>
                    </div>
                  )}

                  {v.prescriptions && (
                    <div className="mt-2 text-sm">
                      <div className="text-xs text-gray-500">Prescriptions</div>
                      <ul className="list-disc ml-5 mt-1 text-sm">
                        {Array.isArray(v.prescriptions) ? (
                          v.prescriptions.map((rx, i) => <li key={i}>{rx}</li>)
                        ) : (
                          <li>{JSON.stringify(v.prescriptions)}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient add/edit modal (manual trigger via Edit button) */}
      <PatientModal
        open={patientModalOpen}
        mode={patientModalMode}
        initialData={patientModalInitial}
        onClose={async () => {
          setPatientModalOpen(false)
          // refresh after close using phone from profile or prop
          const phone = patientNumber || profileState?.mob_num
          if (phone) await fetchPatientByPhone(phone)
        }}
        onSaved={handlePatientModalSaved}
      />

      {/* Update phone modal: only open when phoneModalOpen true */}
      <UpdatePhoneModal
        open={phoneModalOpen}
        patientId={profileState?.id}
        initialPhone={profileState?.mob_num || ""}
        onClose={() => {
          setPhoneModalOpen(false)
        }}
        onUpdated={handleProfileUpdated}
      />
    </div>
  )
}
