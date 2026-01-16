"use client"
import React, { useEffect, useState } from "react"
import PatientModal from "../patient/patientsModal"
import { supabase } from "@/utils/config"

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
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Patients</h1>
          <div>
            <button
              onClick={openAddModal}
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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
                    <td className="px-4 py-3">{p.status ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
