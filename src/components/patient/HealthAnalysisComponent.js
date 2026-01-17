import React, { useState } from "react"
import {
  Activity,
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

export const HealthAnalysisComponent = ({ aiData, loadingAiData, aiError }) => {
  const [activeTab, setActiveTab] = useState("overview")

  if (loadingAiData) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-[#90AB8B]/30">
        <div className="bg-gradient-to-r from-[#90AB8B] to-[#7a9476] px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 animate-pulse" />
            AI Health Analysis
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        </div>
        <div className="p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    )
  }

  if (aiError) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-red-200">
        <div className="bg-gradient-to-r from-[#90AB8B] to-[#7a9476] px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6" />
            AI Health Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Unable to connect to AI analysis assistant. Please try again
              later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!aiData || !aiData.data) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-[#90AB8B]/30">
        <div className="bg-gradient-to-r from-[#90AB8B] to-[#7a9476] px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6" />
            AI Health Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-6 text-[#213448]/60 italic">
            Complete your visits to receive personalized AI health insights.
          </div>
        </div>
      </div>
    )
  }

  const { analysis, visits } = aiData.data
  const {
    summary,
    timeline,
    likely_outcomes,
    recommendations,
    followup_plan,
    patient_facing_summary,
  } = analysis

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "stable":
        return "text-green-600 bg-green-50 border-green-200"
      case "worse":
        return "text-red-600 bg-red-50 border-red-200"
      case "improving":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "admitted":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "discharged":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-[#90AB8B]/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#90AB8B] to-[#7a9476] px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Activity className="w-6 h-6" />
          AI Health Analysis
        </h3>
        <p className="text-white/80 text-sm mt-1">
          Based on {visits?.length || 0} visit{visits?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 px-6">
          {["overview", "timeline", "visits", "recommendations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-[#90AB8B] border-b-2 border-[#90AB8B] bg-white"
                  : "text-gray-600 hover:text-[#90AB8B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Patient Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Patient Summary
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {patient_facing_summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Clinical Summary */}
            <div>
              <h4 className="font-semibold text-[#213448] mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#90AB8B]" />
                Clinical Analysis
              </h4>
              <p className="text-sm text-[#213448]/80 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {summary}
              </p>
            </div>

            {/* Likely Outcomes */}
            {likely_outcomes && likely_outcomes.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#213448] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#90AB8B]" />
                  Likely Outcomes
                </h4>
                <div className="space-y-2">
                  {likely_outcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#90AB8B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#90AB8B]">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-sm text-[#213448]/80 flex-1">
                        {outcome}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-[#213448] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#90AB8B]" />
              Medical Timeline
            </h4>
            <div className="relative">
              {timeline &&
                timeline.map((event, idx) => (
                  <div key={event.id} className="relative pl-8 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {idx !== timeline.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-[#90AB8B]/30"></div>
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#90AB8B] border-4 border-white shadow-md"></div>
                    {/* Content */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[#90AB8B]" />
                        <span className="text-xs font-medium text-[#90AB8B]">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-[#213448]">{event.short}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === "visits" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-[#213448] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#90AB8B]" />
              Visit Details
            </h4>
            {visits &&
              visits.map((visit, idx) => (
                <div
                  key={visit.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#213448]">
                        Visit {visits.length - idx}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatDate(visit.visited_at)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          Diagnosis
                        </span>
                        <span className="text-sm font-semibold text-[#213448] capitalize">
                          {visit.diagnosis}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          Treatment
                        </span>
                        <span className="text-sm text-[#213448] capitalize">
                          {visit.treatment}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          Condition
                        </span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded inline-block capitalize border ${getConditionColor(visit.condition)}`}
                        >
                          {visit.condition}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          Status
                        </span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded inline-block capitalize border ${getStatusColor(visit.status)}`}
                        >
                          {visit.status}
                        </span>
                      </div>
                    </div>
                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-2">
                          Prescriptions
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {visit.prescriptions.map((prescription, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
                            >
                              {prescription}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {visit.notes && visit.notes !== "nothing" && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          Notes
                        </span>
                        <p className="text-sm text-[#213448]/80 italic">
                          {visit.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-[#213448] mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#90AB8B]" />
                Clinical Recommendations
              </h4>
              <div className="space-y-2">
                {recommendations &&
                  recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-900 flex-1">{rec}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Follow-up Plan */}
            {followup_plan && followup_plan.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#213448] mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#90AB8B]" />
                  Follow-up Plan
                </h4>
                <div className="space-y-2">
                  {followup_plan.map((plan, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-900 flex-1">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
