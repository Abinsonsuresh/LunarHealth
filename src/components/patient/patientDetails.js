"use client"

import { useEffect, useState } from "react"

export default function PatientDetails({ patient, visits = [], doctors = [] }) {
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    return doctor ? doctor.full_name : doctorId || "—"
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No patient data available</p>
      </div>
    )
  }

  const detailsArray = [
    { label: "Name", value: patient.full_name || "N/A" },
    { label: "Age", value: patient.age || "N/A" },
    { label: "Gender", value: patient.gender || "N/A" },
    // { label: "Condition", value: patient.condition || "N/A" },
    { label: "Status", value: patient.status || "N/A" },
  ]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary via-primary to-secondary/10 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary to-dark rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">
                {patient.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-dark">
                {patient.full_name || "Patient"}
              </h1>
              <p className="text-secondary font-medium mt-1">Medical Record</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          {detailsArray.map((detail) => (
            <div
              key={detail.label}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-secondary/10"
            >
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 opacity-75">
                {detail.label}
              </p>
              <p className="text-lg md:text-xl text-dark font-bold break-words">
                {detail.value}
              </p>
            </div>
          ))}
        </div>

        {/* Status Section */}
        {patient.status && (
          <div className="mb-10 flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 w-fit border border-secondary/10">
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Status:
            </span>
            <span
              className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${
                patient.status.toLowerCase() === "active"
                  ? "bg-green-500/20 text-green-700 border border-green-300/50"
                  : patient.status.toLowerCase() === "inactive"
                    ? "bg-gray-400/20 text-gray-700 border border-gray-300/50"
                    : "bg-amber-500/20 text-amber-700 border border-amber-300/50"
              }`}
            >
              {patient.status}
            </span>
          </div>
        )}

        {/* Visits Section */}
        {visits && visits.length > 0 && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-dark">Medical Visits</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-secondary to-transparent rounded-full mt-3"></div>
            </div>

            <div className="space-y-4">
              {visits.map((visit, idx) => (
                <div
                  key={visit.id}
                  className="group bg-white rounded-2xl border border-secondary/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Visit Card Header */}
                  <div className="bg-gradient-to-r from-secondary/5 to-transparent p-5 md:p-6 border-b border-secondary/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-secondary uppercase tracking-wider">
                        Visit #{visits.length - idx}
                      </p>
                      <h3 className="text-lg md:text-xl font-bold text-dark mt-1">
                        {visit.visited_at
                          ? new Date(visit.visited_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : new Date(visit.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-mono">
                        {visit.visited_at
                          ? new Date(visit.visited_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Visit Content */}
                  <div className="p-5 md:p-6">
                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      {visit.doctor_id && (
                        <div className="bg-gradient-to-br from-secondary/5 to-transparent rounded-xl p-4 border border-secondary/10">
                          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                            Doctor
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-dark rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {getDoctorName(visit.doctor_id)
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <p className="text-dark font-semibold text-sm">
                              {getDoctorName(visit.doctor_id)}
                            </p>
                          </div>
                        </div>
                      )}

                      {visit.condition && (
                        <div className="bg-gradient-to-br from-blue-50 to-transparent rounded-xl p-4 border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                            Condition
                          </p>
                          <p className="text-dark font-semibold text-sm">
                            {visit.condition}
                          </p>
                        </div>
                      )}

                      {visit.diagnosis && (
                        <div className="bg-gradient-to-br from-purple-50 to-transparent rounded-xl p-4 border border-purple-100">
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                            Diagnosis
                          </p>
                          <p className="text-dark font-semibold text-sm">
                            {visit.diagnosis}
                          </p>
                        </div>
                      )}

                      {visit.treatment && (
                        <div className="bg-gradient-to-br from-orange-50 to-transparent rounded-xl p-4 border border-orange-100">
                          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                            Treatment
                          </p>
                          <p className="text-dark font-semibold text-sm">
                            {visit.treatment}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {visit.notes && (
                      <div className="mb-4 bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-xl p-4 border border-blue-200/50">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                          Notes
                        </p>
                        <p className="text-dark text-sm leading-relaxed">
                          {visit.notes}
                        </p>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-green-50/30 rounded-xl p-4 border border-green-200/50">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3">
                          Medications
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(visit.prescriptions) ? (
                            visit.prescriptions.map((rx, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-dark border border-green-200/50 shadow-sm"
                              >
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {rx}
                              </span>
                            ))
                          ) : (
                            <span className="text-dark text-sm">
                              {JSON.stringify(visit.prescriptions)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!visits || visits.length === 0) && (
          <div className="mt-12 text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-secondary/20">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-secondary font-semibold text-lg">
              No visit history yet
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Visits will appear here once recorded
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
