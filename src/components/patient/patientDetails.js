"use client"

export default function PatientDetails({ patient }) {
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
    { label: "Condition", value: patient.condition || "N/A" },
    { label: "Status", value: patient.status || "N/A" },
  ]

  return (
    <div className="w-full min-h-screen bg-primary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-2 border-secondary pb-4">
          <h1 className="text-3xl font-bold text-dark">
            {patient.full_name || "Patient"}
          </h1>
          <p className="text-secondary mt-2">Patient Information</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailsArray.map((detail) => (
            <div
              key={detail.label}
              className="bg-primary rounded-lg p-4 border border-secondary border-opacity-30"
            >
              <label className="block text-sm font-semibold text-secondary mb-2">
                {detail.label}
              </label>
              <p className="text-lg text-dark font-medium">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* Status Badge */}
        {patient.status && (
          <div className="mt-8 flex items-center gap-3">
            <span className="text-secondary font-semibold">
              Current Status:
            </span>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${
                patient.status.toLowerCase() === "active"
                  ? "bg-green-100 text-green-700"
                  : patient.status.toLowerCase() === "inactive"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {patient.status}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
