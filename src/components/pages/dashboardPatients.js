"use client"
import React, { useEffect, useState } from "react"
import PatientModal from "../patient/patientsModal"
import { supabase } from "@/utils/config"
import {
  UserPlus,
  Edit3,
  Phone,
  Calendar,
  User,
  Users,
  Activity,
} from "lucide-react"

export default function DashboardPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("add")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    fetchPatients()
  }, [])

  async function fetchPatients() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("patients")
        .select(
          "id, full_name, age, gender, condition, notes, mobile_phone, status, created_at, updated_at",
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

  function openAddModal() {
    setSelectedPatient(null)
    setModalMode("add")
    setModalOpen(true)
  }

  function openEditModal(patient) {
    setSelectedPatient(patient)
    setModalMode("edit")
    setModalOpen(true)
  }

  function handleModalSaved(data, { mode }) {
    // refresh list after add or edit
    fetchPatients()

    // If add, keep modal open because modal component shows QR after add; parent does not need to do anything else.
    // If edit, modal component already closed the modal.
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#213448] flex items-center gap-3">
                <Users className="w-8 h-8 text-[#90AB8B]" />
                Patient Management
              </h1>
              <p className="text-[#213448]/70 mt-2">
                Manage and track all your patients in one place
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#90AB8B] text-white font-medium shadow-lg hover:bg-[#7a9576] transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              Add Patient
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-sm font-medium">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-[#213448] mt-1">
                    {patients.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-sm font-medium">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-[#213448] mt-1">
                    {patients.filter((p) => p.status === "Active").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-sm font-medium">
                    New This Week
                  </p>
                  <p className="text-3xl font-bold text-[#213448] mt-1">2</p>
                </div>
                <div className="w-12 h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#90AB8B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#213448]/70 mt-4">Loading patients...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#213448] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Age
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Mobile
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-[#213448]/50"
                      >
                        <Users className="w-16 h-16 mx-auto mb-3 text-[#90AB8B]/30" />
                        <p className="text-lg font-medium">No patients yet</p>
                        <p>Click &quot;Add Patient&quot; to get started</p>
                      </td>
                    </tr>
                  )}

                  {patients.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#EBF4DD]/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#90AB8B] text-white flex items-center justify-center font-semibold">
                            {p.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#213448]">
                            {p.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#213448]/80">
                        {p.age ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-[#213448]/80">
                        {p.gender ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-[#213448]/80">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#90AB8B]" />
                          {p.mobile_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EBF4DD] text-[#90AB8B] border border-[#90AB8B]/20">
                          {p.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#213448]/60">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(p)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBF4DD] text-[#213448] text-sm font-medium hover:bg-[#90AB8B] hover:text-white transition-all duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <PatientModal
          open={modalOpen}
          mode={modalMode}
          initialData={modalMode === "edit" ? selectedPatient : null}
          onClose={() => setModalOpen(false)}
          onSaved={handleModalSaved}
        />
      </div>
    </div>
  )
}
