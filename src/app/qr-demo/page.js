"use client"

import React, { useState, useEffect } from "react"
import { generateQRCode } from "@/utils/qrCodeGenerator"
import {
  createMockPatient,
  generatePatientQRPayload,
} from "@/services/mockPatientService"

export default function QrDemoPage() {
  const [patient, setPatient] = useState(null)
  const [qrCodeHtml, setQrCodeHtml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "Male", // Default value
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateAge = (dobString) => {
    if (!dobString) return ""
    const today = new Date()
    const birthDate = new Date(dobString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Create patient object from form data
      const age = calculateAge(formData.dob)

      const newPatient = {
        id: `PAT-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        name: formData.name,
        age: age,
        gender: formData.gender,
        dateOfBirth: formData.dob,
        timestamp: new Date().toISOString(),
      }

      setPatient(newPatient)

      // 2. Prepare payload
      const payload = generatePatientQRPayload(newPatient)

      // 3. Generate QR Code
      const qrImage = await generateQRCode(payload, {
        width: 256,
        margin: 4,
        color: {
          dark: "#000000ff",
          light: "#ffffffff",
        },
      })

      setQrCodeHtml(qrImage)
    } catch (error) {
      console.error("Failed to generate QR code", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex flex-col items-center justify-center font-sans text-gray-800">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 border-r border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Patient Reception
            </h1>
            <p className="text-gray-500">
              Enter patient details to generate their ID & QR code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 block"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="dob"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 hover:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="gender"
                  className="text-sm font-semibold text-gray-700 block"
                >
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 hover:bg-white appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Patient ID"}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="w-full md:w-1/2 p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
          {patient && qrCodeHtml ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-xs animate-fade-in-up">
              <div className="w-full flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Patient ID Card
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-mono py-1 px-2 rounded">
                  {patient.id}
                </span>
              </div>

              <img
                src={qrCodeHtml}
                alt={`QR code for ${patient.name}`}
                className="w-48 h-48 object-contain mb-4 border p-2 rounded"
              />

              <h3 className="text-lg font-bold text-gray-900 text-center">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {patient.age} years old • {patient.gender}
              </p>
              <p className="text-xs text-gray-400">{patient.dateOfBirth}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
                <p className="text-xs text-gray-400">
                  Scan for full medical history
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 opacity-50 flex items-center justify-center">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  ></path>
                </svg>
              </div>
              <p className="font-medium">No patient data yet</p>
              <p className="text-sm opacity-70 mt-1">
                Fill the form to generate a QR code
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm max-w-lg">
        <p>
          Powered by <code>qrcode</code> generator
        </p>
      </div>
    </div>
  )
}
