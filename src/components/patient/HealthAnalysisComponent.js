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
  Brain,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
  Info,
  Stethoscope,
  ChevronRight,
} from "lucide-react"

export const HealthAnalysisComponent = ({ aiData, loadingAiData, aiError }) => {
  const [activeTab, setActiveTab] = useState("overview")

  if (loadingAiData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-indigo-100 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">
                AI Health Synthesizer
              </h3>
              <p className="text-indigo-100 text-xs font-medium">
                Processing medical records...
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce"></div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-50 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
            <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (aiError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-red-100">
        <div className="bg-red-50 px-6 py-4 flex items-center gap-3 border-b border-red-100">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-red-900">
            Analysis Unavailable
          </h3>
        </div>
        <div className="p-8 text-center">
          <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-600 max-w-sm mx-auto mb-6">
            We encountered an issue while generating your health insights. This
            could be due to a temporary connection problem.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    )
  }

  if (!aiData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200 p-10 text-center mb-8">
        <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Ready for Insights
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          AI-powered analysis will appear here once medical visits are recorded
          for this patient.
        </p>
      </div>
    )
  }

  // The new data structure: aiData is the analysis object
  const {
    summary,
    timeline,
    likely_outcomes,
    risk_factors,
    recommendations,
    followup_plan,
    patient_facing_summary,
    _meta,
  } = aiData

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const tabs = [
    { id: "overview", label: "Executive Summary", icon: Info },
    { id: "timeline", label: "Health Journey", icon: Calendar },
    { id: "recommendations", label: "Action Plan", icon: CheckCircle },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8 border border-indigo-50 transition-all hover:shadow-indigo-100/50">
      {/* Premium AI Header */}
      <div className="bg-gradient-to-r from-[#213448] via-[#2d4a62] to-[#213448] px-8 py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#90AB8B]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#90AB8B] to-[#7a9476] rounded-xl shadow-lg shadow-[#90AB8B]/20 border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                LU-AI Analysis
                <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold uppercase tracking-widest backdrop-blur-md">
                  Alpha
                </span>
              </h3>
              <div className="flex items-center gap-2 text-indigo-100/70 text-xs mt-1">
                <Brain className="w-3 h-3" />
                <span>Neural synthesizer active</span>
                <span className="w-1 h-1 rounded-full bg-green-400"></span>
                <span>{_meta?.visits_count || 0} visits processed</span>
              </div>
            </div>
          </div>
          {_meta?.generated_at && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                Last Synthesis
              </p>
              <p className="text-xs text-white/80 font-mono">
                {formatDate(_meta.generated_at)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="border-b border-gray-100 px-4 bg-gray-50/50">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id
                  ? "text-[#213448]"
                  : "text-gray-400 hover:text-[#90AB8B]"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? "text-[#90AB8B]" : ""}`}
              />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#90AB8B] rounded-t-full shadow-[0_-2px_8px_rgba(144,171,139,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="p-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Patient Focused Insight */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#90AB8B] to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white border border-indigo-50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-full flex-shrink-0">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">
                      Patient Summary
                    </h4>
                    <p className="text-lg text-[#213448] font-medium leading-relaxed italic">
                      {`"${patient_facing_summary}"`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-[#213448] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#90AB8B]" />
                    Clinical Synthesis
                  </h4>
                  <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <FileText className="w-12 h-12" />
                    </div>
                    <p className="text-sm text-[#213448]/80 leading-relaxed font-medium">
                      {summary}
                    </p>
                  </div>
                </div>

                {/* Risk Factors Section */}
                {risk_factors && risk_factors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-black text-[#213448] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      Risk Assessment
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {risk_factors.map((risk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Likely Outcomes */}
                {likely_outcomes && likely_outcomes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-black text-[#213448] uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-600">
                      <TrendingUp className="w-4 h-4" />
                      Projected Trajectory
                    </h4>
                    <div className="space-y-3">
                      {likely_outcomes.map((outcome, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                            <span className="text-xs font-black text-indigo-600 group-hover:text-white">
                              {idx + 1}
                            </span>
                          </div>
                          <p className="text-sm text-[#213448]/80 font-medium">
                            {outcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="relative pl-12 border-l-2 border-[#90AB8B]/20 ml-6 space-y-12 py-4">
              {timeline?.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  {/* Modern Timeline Node */}
                  <div className="absolute -left-[61px] top-0 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#90AB8B] flex items-center justify-center shadow-lg group">
                      <Clock className="w-5 h-5 text-[#90AB8B]" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase">
                        {formatDate(event.date)}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-[#213448] mb-3 pr-24 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#90AB8B]"></div>
                      Observation
                    </h4>
                    <p className="text-sm text-[#213448]/70 leading-relaxed font-medium">
                      {event.short}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-black text-[#213448] uppercase tracking-widest mb-4 flex items-center gap-2 text-amber-600">
                  <Stethoscope className="w-4 h-4" />
                  Clinical Directives
                </h4>
                <div className="space-y-3">
                  {recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 bg-amber-50/50 p-5 rounded-2xl border border-amber-100 group hover:bg-amber-50 transition-colors"
                    >
                      <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 text-amber-600">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-amber-900 font-semibold leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Plan */}
              {followup_plan && followup_plan.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-[#213448] uppercase tracking-widest mb-4 flex items-center gap-2 text-emerald-600">
                    <Calendar className="w-4 h-4" />
                    Evolutionary Plan
                  </h4>
                  <div className="space-y-3">
                    {followup_plan.map((plan, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0 text-emerald-600">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-emerald-900 font-semibold leading-relaxed">
                          {plan}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Info className="w-4 h-4 text-gray-400" />
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                This analysis is generated by AI and should be reviewed by a
                qualified medical professional before clinical application.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
