"use client"
import React, { useEffect, useState } from "react"
import PatientModal from "../patient/patientsModal"
import PatientCardModal from "../patient/patientCard"
import { supabase } from "@/utils/config"
import {
  UserPlus,
  Edit3,
  Phone,
  Calendar,
  User,
  Users,
  Activity,
  Eye,
} from "lucide-react"

export default function DashboardPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("add")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewPatient, setViewPatient] = useState(null)

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

  function openViewModal(patient) {
    setViewPatient(patient)
    setViewModalOpen(true)
  }

  function handleModalSaved(data, { mode }) {
    fetchPatients()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#213448] flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#90AB8B]" />
                Patient Management
              </h1>
              <p className="text-sm sm:text-base text-[#213448]/70 mt-2">
                Manage and track all your patients in one place
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[#90AB8B] text-white font-medium shadow-lg hover:bg-[#7a9576] transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <UserPlus className="w-5 h-5" />
              Add Patient
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-xs sm:text-sm font-medium">
                    Total Patients
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#213448] mt-1">
                    {patients.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-xs sm:text-sm font-medium">
                    Active Patients
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#213448] mt-1">
                    {patients.filter((p) => p.status === "Active").length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-xs sm:text-sm font-medium">
                    New This Week
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#213448] mt-1">
                    2
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EBF4DD] rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#90AB8B]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#90AB8B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#213448]/70 mt-4">Loading patients...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#213448] text-white">
                  <tr>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold">
                      Age
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold">
                      Gender
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Mobile
                      </div>
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 sm:py-12 text-center text-[#213448]/50"
                      >
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-[#90AB8B]/30" />
                        <p className="text-base sm:text-lg font-medium">
                          No patients yet
                        </p>
                        <p className="text-sm sm:text-base">
                          Click &quot;Add Patient&quot; to get started
                        </p>
                      </td>
                    </tr>
                  )}

                  {patients.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#EBF4DD]/30 transition-colors duration-150"
                    >
                      <td className="px-2 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#90AB8B] text-white flex items-center justify-center font-semibold text-sm sm:text-base">
                            {p.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#213448] text-sm sm:text-base">
                            {p.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-[#213448]/80">
                        {p.age ?? "—"}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-[#213448]/80">
                        {p.gender ?? "—"}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-[#213448]/80">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#90AB8B]" />
                          {p.mobile_phone}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#EBF4DD] text-[#90AB8B] border border-[#90AB8B]/20">
                          {p.status ?? "—"}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-sm text-[#213448]/60">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* Mobile: View button (icon only) */}
                          <button
                            onClick={() => openViewModal(p)}
                            className="flex items-center justify-center p-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#EBF4DD] text-[#213448] hover:bg-[#90AB8B] hover:text-white transition-all duration-200"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Desktop: Edit button with text */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBF4DD] text-[#213448] text-sm font-medium hover:bg-[#90AB8B] hover:text-white transition-all duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>

                          {/* Mobile: Edit button (icon only) */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="lg:hidden flex items-center justify-center p-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#90AB8B] text-white hover:bg-[#7a9576] transition-all duration-200"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
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

        <PatientCardModal
          patient={viewPatient}
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      </div>
    </div>
  )
}
