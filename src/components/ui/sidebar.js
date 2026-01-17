"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import SignOutButton from "../SignOutButton"

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

    // Set initial state
    handleResize()

    // Listen for window resize
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    {
      label: profile?.role === "super_admin" ? "Users" : "Patients",
      href: "/dashboard",
    },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "About", href: "/dashboard/about" },
  ]

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Menu Button - Only visible when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#213448] text-white rounded-md hover:bg-[#2d4a62] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static h-screen w-64 bg-[#EBF4DD] border-r flex flex-col justify-between transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Top */}
        <div>
          <div className="px-6 py-5 flex items-center justify-between">
            <span className="text-xl font-bold text-[#213448]">
              LunarHealth 360
            </span>
            {/* Close button - Only visible on mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 hover:bg-[#90AB8B]/40 rounded-md transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5 text-[#213448]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`px-4 py-2 rounded-md font-medium transition
                    ${
                      active
                        ? "bg-[#213448] text-white"
                        : "text-[#213448] hover:bg-[#90AB8B]/40"
                    }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom user info */}
        <div className="border-t px-4 py-4 text-sm">
          <SignOutButton />

          <p className="text-gray-600">Signed in as</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 bg-[#213448] text-white rounded-full hover:bg-[#2d4a62] transition-colors flex-shrink-0"
              aria-label="Open profile menu"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" />
              </svg>
            </button>
            <p className="font-medium text-[#213448] truncate flex-1">
              {userEmail}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
