"use client"

import React, { useEffect, useState } from "react"
import PatientModal from "../patient/patientsModal"
import UpdatePhoneModal from "../patient/updatePhone"
import { supabase } from "@/utils/config"
import {
  Edit3,
  Phone,
  User,
  Calendar,
  FileText,
  Stethoscope,
  Pill,
  ChevronDown,
  ChevronUp,
  Activity,
  UserCircle,
} from "lucide-react"

export default function PatientDetailsPage({ patientNumber, profile }) {
  const [profileState, setProfileState] = useState(profile || null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const [patient, setPatient] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [visits, setVisits] = useState([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [errorMsg, setErrorMsg] = useState("")
  const [expandedVisits, setExpandedVisits] = useState({})

  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [patientModalMode, setPatientModalMode] = useState("edit")
  const [patientModalInitial, setPatientModalInitial] = useState(null)

  const [phoneModalOpen, setPhoneModalOpen] = useState(false)

  useEffect(() => {
    if (!profile) {
      ;(async () => {
        await loadCurrentProfile()
      })()
    } else {
      setProfileState(profile)
    }
  }, [profile])

  useEffect(() => {
    ;(async () => {
      if (patientNumber) {
        await fetchPatientByPhone(patientNumber)
        return
      }

      if (!profileState) {
        return
      }

      if (!profileState.mob_num) {
        setPhoneModalOpen(true)
        return
      }

      await fetchPatientByPhone(profileState.mob_num)
    })()
  }, [profileState, patientNumber])

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

  function normalizePhone(p) {
    if (!p) return p
    return p.toString().replace(/\s+/g, "").replace(/^\+/, "")
  }

  async function fetchPatientByPhone(rawPhone) {
    const phone = normalizePhone(rawPhone)
    if (!phone) {
      setPatient(null)
      setVisits([])
      return
    }

    try {
      setLoadingPatient(true)

      const orQuery = `mobile_phone.eq.${phone},mobile_phone.eq.${phone},mobile_phone.eq.${phone}`

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
        .from("profiles")
        .select("id, full_name")
        .eq("role", "doctor")
        .order("full_name", { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (err) {
      console.error("fetchDoctors", err)
      setDoctors([])
    }
  }

  async function handlePatientModalSaved(data, meta) {
    if (data?.id) {
      setPatient(data)
      await fetchVisits(data.id)
    } else {
      const phone = patientNumber || profileState?.mob_num
      if (phone) await fetchPatientByPhone(phone)
    }
  }

  async function handleProfileUpdated(updatedProfile) {
    if (updatedProfile) {
      setProfileState(updatedProfile)
      if (updatedProfile.mob_num) {
        await fetchPatientByPhone(updatedProfile.mob_num)
      }
    } else {
      await loadCurrentProfile()
    }
    setPhoneModalOpen(false)
  }

  function doctorNameByIdLocal(id) {
    const doc = doctors.find((d) => d.id === id)
    return doc ? doc.full_name : "—"
  }

  function toggleVisit(visitId) {
    setExpandedVisits((prev) => ({
      ...prev,
      [visitId]: !prev[visitId],
    }))
  }

  const phoneToShow = patientNumber || profileState?.mob_num || "(no phone)"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#213448] flex items-center gap-3">
                <div className="p-2 bg-[#90AB8B] rounded-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                Patient Details
              </h1>
              <p className="text-sm text-[#213448]/60 mt-2 ml-14">
                Phone:{" "}
                <span className="font-mono font-medium text-[#213448]">
                  {phoneToShow}
                </span>
              </p>
            </div>

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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#90AB8B] text-white hover:bg-[#7a9476] transition-all shadow-md hover:shadow-lg"
            >
              <Edit3 className="w-4 h-4" />
              {patient ? "Edit Patient" : "Add Patient"}
            </button>
          </div>
        </div>

        {/* Patient Card */}
        {loadingPatient ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#90AB8B] border-t-transparent"></div>
            <p className="mt-3 text-[#213448]/70">Loading patient...</p>
          </div>
        ) : patient ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#90AB8B] to-[#7a9476] p-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                  {patient.full_name
                    ? patient.full_name.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {patient.full_name || "Unknown Patient"}
                  </h2>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <UserCircle className="w-4 h-4" />
                    <span className="font-mono">
                      ID: {patient.id?.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium">
                    {patient.status || "Active"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#EBF4DD] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#90AB8B]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                      Age
                    </div>
                    <div className="text-lg font-semibold text-[#213448]">
                      {patient.age || "—"} years
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#EBF4DD] rounded-lg">
                    <User className="w-5 h-5 text-[#90AB8B]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                      Gender
                    </div>
                    <div className="text-lg font-semibold text-[#213448]">
                      {patient.gender || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#EBF4DD] rounded-lg">
                    <Phone className="w-5 h-5 text-[#90AB8B]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                      Mobile
                    </div>
                    <div className="text-lg font-semibold text-[#213448] font-mono">
                      {patient.mobile_phone ||
                        patient.mobile_num ||
                        patient.mob_num ||
                        "—"}
                    </div>
                  </div>
                </div>
              </div>

              {(patient.condition || patient.notes) && (
                <div className="border-t pt-6 space-y-4">
                  {patient.condition && (
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-[#90AB8B] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                          Current Condition
                        </div>
                        <div className="text-[#213448] font-medium">
                          {patient.condition}
                        </div>
                      </div>
                    </div>
                  )}

                  {patient.notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#90AB8B] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                          Notes
                        </div>
                        <div className="text-[#213448]/80 whitespace-pre-wrap">
                          {patient.notes}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                <User className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                {errorMsg || "Patient Not Found"}
              </h3>
              <p className="text-sm text-[#213448]/70">
                You can create a patient record by clicking the &quot;Add
                Patient&quot; button above.
              </p>
            </div>
          </div>
        )}

        {/* Visits Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#213448] to-[#2d4a62] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Stethoscope className="w-6 h-6" />
                Medical Visits
              </h3>
              <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {visitsLoading
                  ? "Loading..."
                  : `${visits.length} visit${visits.length !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>

          <div className="p-6">
            {visitsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#90AB8B] border-t-transparent"></div>
                <p className="mt-3 text-[#213448]/70">Loading visits...</p>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-[#213448]/70">
                  No visits found for this patient.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((v) => (
                  <div
                    key={v.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Visit Header - Always Visible */}
                    <div
                      onClick={() => toggleVisit(v.id)}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-[#EBF4DD]/30 hover:to-white transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-[#90AB8B]" />
                            <h4 className="text-lg font-semibold text-[#213448]">
                              {v.condition || "General Checkup"}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#213448]/60">
                            <Calendar className="w-4 h-4" />
                            {v.visited_at
                              ? new Date(v.visited_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : v.created_at
                                ? new Date(v.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "Date not recorded"}
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {expandedVisits[v.id] ? (
                            <ChevronUp className="w-5 h-5 text-[#213448]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#213448]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Visit Details - Collapsible */}
                    {expandedVisits[v.id] && (
                      <div className="p-4 pt-0 border-t bg-white">
                        <div className="space-y-4 mt-4">
                          {v.notes && (
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-[#90AB8B] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                                  Notes
                                </div>
                                <div className="text-[#213448]/80">
                                  {v.notes}
                                </div>
                              </div>
                            </div>
                          )}

                          {v.diagnosis && (
                            <div className="flex items-start gap-3">
                              <Stethoscope className="w-5 h-5 text-[#90AB8B] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                                  Diagnosis
                                </div>
                                <div className="text-[#213448] font-medium">
                                  {v.diagnosis}
                                </div>
                              </div>
                            </div>
                          )}

                          {v.treatment && (
                            <div className="flex items-start gap-3">
                              <Activity className="w-5 h-5 text-[#90AB8B] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                                  Treatment
                                </div>
                                <div className="text-[#213448] font-medium">
                                  {v.treatment}
                                </div>
                              </div>
                            </div>
                          )}

                          {v.doctor_id && (
                            <div className="flex items-start gap-3">
                              <UserCircle className="w-5 h-5 text-[#90AB8B] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-1">
                                  Attending Doctor
                                </div>
                                <div className="text-[#213448] font-medium">
                                  {doctorNameByIdLocal(v.doctor_id)}
                                </div>
                              </div>
                            </div>
                          )}

                          {v.prescriptions && (
                            <div className="flex items-start gap-3">
                              <Pill className="w-5 h-5 text-[#90AB8B] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs text-[#213448]/60 uppercase tracking-wide mb-2">
                                  Prescriptions
                                </div>
                                <div className="bg-[#EBF4DD]/30 rounded-lg p-3">
                                  <ul className="space-y-2">
                                    {Array.isArray(v.prescriptions) ? (
                                      v.prescriptions.map((rx, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-[#213448]/80"
                                        >
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#90AB8B] mt-2 flex-shrink-0"></span>
                                          <span>{rx}</span>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-[#213448]/80">
                                        {JSON.stringify(v.prescriptions)}
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t">
                            {/* <div className="text-xs text-[#213448]/40 font-mono">
                              Visit ID: {v.id?.slice(0, 16)}
                            </div> */}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PatientModal
        open={patientModalOpen}
        mode={patientModalMode}
        initialData={patientModalInitial}
        onClose={async () => {
          setPatientModalOpen(false)
          const phone = patientNumber || profileState?.mob_num
          if (phone) await fetchPatientByPhone(phone)
        }}
        onSaved={handlePatientModalSaved}
      />

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
