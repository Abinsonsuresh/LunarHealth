"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import SignOutButton from "../SignOutButton"
import {
  Users,
  Settings,
  Info,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react"

export default function Sidebar({ userEmail, profile }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar by default on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    {
      label: profile?.role === "super_admin" ? "Users" : "Patients",
      href: "/dashboard",
      icon: Users,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      label: "About",
      href: "/dashboard/about",
      icon: Info,
    },
  ]

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  // Get user initials from email
  const getUserInitials = (email) => {
    if (!email) return "U"
    const name = email.split("@")[0]
    return name.charAt(0).toUpperCase()
  }

  // Generate avatar color based on email
  const getAvatarColor = (email) => {
    if (!email) return "bg-[#90AB8B]"
    const colors = [
      "bg-[#90AB8B]",
      "bg-[#7a9476]",
      "bg-[#6b8566]",
      "bg-[#5c7657]",
      "bg-[#213448]",
    ]
    const index = email.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <>
      {/* Menu Button - Only visible when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-[#213448] text-white rounded-lg hover:bg-[#2d4a62] transition-all shadow-lg hover:shadow-xl md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static h-screen w-72 bg-gradient-to-b from-[#EBF4DD] to-[#d8e8c5] border-r border-[#90AB8B]/20 flex flex-col justify-between transition-transform duration-300 z-50 shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Top */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 flex items-center justify-between border-b border-[#90AB8B]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#90AB8B] to-[#7a9476] rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#213448]">
                LunarHealth
              </span>
            </div>

            {/* Close button - Only visible on mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 hover:bg-[#90AB8B]/30 rounded-lg transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#213448]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col gap-2 px-4 flex-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`group px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between
                    ${
                      active
                        ? "bg-[#213448] text-white shadow-lg"
                        : "text-[#213448] hover:bg-white/60 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-[#90AB8B]"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom user info */}
        <div className="border-t border-[#90AB8B]/20 bg-white/40 backdrop-blur-sm">
          <div className="p-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl p-4 shadow-md mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 ${getAvatarColor(userEmail)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}
                >
                  {getUserInitials(userEmail)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#213448]/60 mb-1">Signed in as</p>
                  <p className="font-semibold text-[#213448] truncate text-sm">
                    {userEmail}
                  </p>
                  {profile?.role && (
                    <p className="text-xs text-[#90AB8B] font-medium mt-1 capitalize">
                      {profile.role.replace("_", " ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Link
                  href="/dashboard/settings"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#EBF4DD] hover:bg-[#90AB8B]/30 rounded-lg transition-all text-[#213448] text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </div>
            </div>

            {/* Sign Out Button */}
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  )
}
