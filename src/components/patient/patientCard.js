import React, { useState, useEffect } from "react"
import {
  X,
  User,
  Phone,
  Calendar,
  Activity,
  FileText,
  Clock,
} from "lucide-react"
import { generateQRCode } from "@/utils/qrCodeGenerator"

export default function PatientCardModal({ patient, open, onClose }) {
  const [qrCodeHtml, setQrCodeHtml] = useState("")

  useEffect(() => {
    if (!open || !patient?.id) {
      setQrCodeHtml("")
      return
    }

    const generateQR = async () => {
      try {
        const url = `http://localhost:3000/patients/${patient.id}`
        const qrImage = await generateQRCode(url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#213448ff",
            light: "#ffffffff",
          },
        })
        setQrCodeHtml(qrImage)
      } catch (error) {
        console.error("Failed to generate QR code", error)
      }
    }

    generateQR()
  }, [patient, open])

  if (!open || !patient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#213448] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#90AB8B] flex items-center justify-center text-2xl font-bold">
              {patient.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#90AB8B] text-white">
                  {patient.status ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#213448]/60 uppercase tracking-wide">
              Basic Information
            </h3>

            <div className="flex items-center gap-3 p-3 bg-[#EBF4DD]/30 rounded-lg">
              <User className="w-5 h-5 text-[#90AB8B]" />
              <div className="flex-1">
                <p className="text-xs text-[#213448]/60">Age</p>
                <p className="text-sm font-medium text-[#213448]">
                  {patient.age ?? "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#EBF4DD]/30 rounded-lg">
              <User className="w-5 h-5 text-[#90AB8B]" />
              <div className="flex-1">
                <p className="text-xs text-[#213448]/60">Gender</p>
                <p className="text-sm font-medium text-[#213448]">
                  {patient.gender ?? "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#EBF4DD]/30 rounded-lg">
              <Phone className="w-5 h-5 text-[#90AB8B]" />
              <div className="flex-1">
                <p className="text-xs text-[#213448]/60">Mobile Phone</p>
                <p className="text-sm font-medium text-[#213448]">
                  {patient.mobile_phone}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          {patient.condition && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#213448]/60 uppercase tracking-wide">
                Medical Information
              </h3>

              <div className="flex items-start gap-3 p-3 bg-[#EBF4DD]/30 rounded-lg">
                <Activity className="w-5 h-5 text-[#90AB8B] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#213448]/60">Condition</p>
                  <p className="text-sm font-medium text-[#213448]">
                    {patient.condition}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {patient.notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#213448]/60 uppercase tracking-wide">
                Notes
              </h3>

              <div className="flex items-start gap-3 p-3 bg-[#EBF4DD]/30 rounded-lg">
                <FileText className="w-5 h-5 text-[#90AB8B] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#213448]">{patient.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#213448]/60 uppercase tracking-wide">
              Record Information
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#EBF4DD]/30 rounded-lg">
                <Calendar className="w-4 h-4 text-[#90AB8B]" />
                <div>
                  <p className="text-xs text-[#213448]/60">Created</p>
                  <p className="text-xs font-medium text-[#213448]">
                    {patient.created_at
                      ? new Date(patient.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#EBF4DD]/30 rounded-lg">
                <Clock className="w-4 h-4 text-[#90AB8B]" />
                <div>
                  <p className="text-xs text-[#213448]/60">Updated</p>
                  <p className="text-xs font-medium text-[#213448]">
                    {patient.updated_at
                      ? new Date(patient.updated_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {qrCodeHtml && (
          <div className="p-6 border-t border-gray-100 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-[#213448]/60 uppercase tracking-wide mb-4">
              Patient QR Code
            </h3>
            <img
              src={qrCodeHtml}
              alt="patient-qr"
              className="w-40 h-40 border-2 border-[#90AB8B] p-2 bg-white rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-3">
              Scan to view full profile
            </p>
            <div className="mt-2 font-mono text-xs text-[#213448]">
              http://localhost:3000/patients/{patient.id}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
