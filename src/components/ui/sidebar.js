"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import SignOutButton from "../SignOutButton"

export default function Sidebar({ userEmail, profile }) {
  const pathname = usePathname()

  const navItems = [
    {
      label: profile?.role === "super_admin" ? "Users" : "Patients",
      href: "/dashboard",
    },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "About", href: "/dashboard/about" },
  ]

  return (
    <aside className="h-screen w-64 bg-[#EBF4DD] border-r flex flex-col justify-between">
      {/* Top */}
      <div>
        <div className="px-6 py-5 text-xl font-bold text-[#213448]">
          LunarHealth 360
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
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
        <p className="font-medium text-[#213448] truncate">{userEmail}</p>
      </div>
    </aside>
  )
}
