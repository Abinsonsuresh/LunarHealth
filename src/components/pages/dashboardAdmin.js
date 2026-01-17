"use client"
import React, { useEffect, useState } from "react"
import { supabase } from "@/utils/config"
import {
  UserPlus,
  Edit3,
  Mail,
  Calendar,
  User,
  Users,
  Activity,
} from "lucide-react"
import UserModal from "../admin/addUserModal"

export default function DashboardAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchUsers()
    // refresh when refreshKey changes (e.g. after adding)
  }, [refreshKey])

  async function fetchUsers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setModalOpen(true)
  }

  function handleModalSaved(newUser) {
    // bump refresh key to reload list
    setRefreshKey((k) => k + 1)
    setModalOpen(false)
  }

  const totalUsers = users.length
  const adminCount = users.filter(
    (u) => (u.role || "").toLowerCase() === "admin",
  ).length
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = users.filter(
    (u) => u.created_at && new Date(u.created_at) > oneWeekAgo,
  ).length

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#213448] flex items-center gap-3">
                <Users className="w-8 h-8 text-[#90AB8B]" />
                Superadmin
              </h1>
              <p className="text-[#213448]/70 mt-2">
                View and manage application users (profiles).
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#90AB8B] text-white font-medium shadow-lg hover:bg-[#7a9576] transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-[#90AB8B]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#213448]/60 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-[#213448] mt-1">
                    {totalUsers}
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
                    Admin Accounts
                  </p>
                  <p className="text-3xl font-bold text-[#213448] mt-1">
                    {adminCount}
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
                  <p className="text-3xl font-bold text-[#213448] mt-1">
                    {newThisWeek}
                  </p>
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
            <p className="text-[#213448]/70 mt-4">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#213448] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Created
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-[#213448]/50"
                      >
                        <Users className="w-16 h-16 mx-auto mb-3 text-[#90AB8B]/30" />
                        <p className="text-lg font-medium">No users yet</p>
                        <p>Click &quot;Add User&quot; to add a new account</p>
                      </td>
                    </tr>
                  )}

                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[#EBF4DD]/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#90AB8B] text-white flex items-center justify-center font-semibold">
                            {(u.full_name || "U").charAt(0)}
                          </div>
                          <span className="font-medium text-[#213448]">
                            {u.full_name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#213448]/80 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#90AB8B]" />
                        {u.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EBF4DD] text-[#90AB8B] border border-[#90AB8B]/20">
                          {u.role ?? "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#213448]/60">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {/* Edit button placeholder (you can add edit functionality later) */}
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EBF4DD] text-[#213448] text-sm font-medium hover:bg-[#90AB8B] hover:text-white transition-all duration-200">
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

        {/* Add User Modal */}
        <UserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleModalSaved}
        />
      </div>
    </div>
  )
}
