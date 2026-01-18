"use client"

import React from "react"
import {
  Users,
  Code,
  Layout,
  Server,
  Github,
  Linkedin,
  Mail,
} from "lucide-react"

const team = [
  {
    name: "Abinson Suresh",
    role: "Team Lead & Backend Developer",
    // description: "Architecting robust server-side solutions and managing the overall project vision.",
    icon: Server,
    color: "#213448",
  },
  {
    name: "Hemanth Chandran",
    role: "Frontend Developer",
    // description: "Crafting responsive and interactive user interfaces with a focus on performance and usability.",
    icon: Code,
    color: "#90AB8B",
  },
  {
    name: "Brijesh Sebastian",
    role: "UI/UX Developer",
    // description: "Designing beautiful and intuitive user experiences that make healthcare accessible.",
    icon: Layout,
    color: "#7a9476",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-gray-100">
            <Users className="w-8 h-8 text-[#90AB8B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#213448] mb-4 tracking-tight">
            Meet Our Team
          </h1>
          <p className="text-lg text-[#213448]/70 max-w-2xl mx-auto leading-relaxed">
            We are a dedicated group of innovators working to redefine digital
            healthcare management through elegant, tech-driven solutions.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => {
            const Icon = member.icon
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Decorative Background Element */}
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: member.color }}
                />

                <div className="relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ backgroundColor: `${member.color}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: member.color }} />
                  </div>

                  <h3 className="text-2xl font-bold text-[#213448] mb-2">
                    {member.name}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-4 uppercase tracking-wider"
                    style={{ color: member.color }}
                  >
                    {member.role}
                  </p>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    {member.description}
                  </p>

                  {/* <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                        <button className="p-2 text-gray-400 hover:text-[#213448] transition-colors rounded-lg hover:bg-gray-50">
                                            <Linkedin className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-[#213448] transition-colors rounded-lg hover:bg-gray-50">
                                            <Github className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-[#213448] transition-colors rounded-lg hover:bg-gray-50">
                                            <Mail className="w-5 h-5" />
                                        </button>
                                    </div> */}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center bg-[#213448] rounded-[2rem] p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#90AB8B]/10 rounded-full -ml-32 -mb-32 blur-3xl" />

          <h2 className="text-3xl font-bold mb-4 relative z-10">Our Mission</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
            To empower healthcare providers with cutting-edge tools that
            simplify patient care, streamline operations, and prioritize medical
            excellence.
          </p>
        </div>
      </div>
    </div>
  )
}
