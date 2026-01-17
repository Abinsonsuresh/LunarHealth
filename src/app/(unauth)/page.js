"use client"

import { useState } from "react"
import { supabase } from "@/libs/supabase/supabaseBrowser"
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMode, setEmailMode] = useState("signin")

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const redirect = () => {
    window.location.href = "/dashboard"
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    setEmailLoading(true)
    setMessage("")
    setMessageType("")

    try {
      if (emailMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        redirect()
        return
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (signUpError) throw signUpError

      const user = signUpData?.user
      if (!user) throw new Error("User creation failed")

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email,
          role: "patient",
        },
        { onConflict: "id" },
      )

      if (profileError) throw profileError

      setMessage("Account created successfully! Please sign in.")
      setMessageType("success")
      setEmailMode("signin")
      setPassword("")
    } catch (err) {
      setMessage(err.message || "Authentication failed")
      setMessageType("error")
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EBF4DD] via-[#d8e8c5] to-[#c5ddb0] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#90AB8B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[#213448]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#90AB8B] to-[#7a9476] rounded-2xl shadow-xl mb-4">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-3xl font-bold text-[#213448] mb-2">
            LunarHealth 360
          </h1>
          <p className="text-[#213448]/60">
            Comprehensive Healthcare Management
          </p>
        </div>

        <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#213448] mb-2">
              {emailMode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-[#213448]/60">
              {emailMode === "signin"
                ? "Sign in to access your healthcare dashboard"
                : "Join us to manage your health records"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#90AB8B]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent transition-all outline-none bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleEmailAuth(e)
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#213448] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#90AB8B]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 text-black py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#90AB8B] focus:border-transparent transition-all outline-none bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleEmailAuth(e)
                    }
                  }}
                />
              </div>
              {emailMode === "signup" && (
                <p className="mt-1 text-xs text-[#213448]/50">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={emailLoading}
              className="w-full bg-gradient-to-r from-[#90AB8B] to-[#7a9476] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#7a9476] hover:to-[#6b8566] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {emailLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {emailMode === "signin" ? "Sign In" : "Create Account"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#213448]/60">
              {emailMode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setEmailMode(emailMode === "signin" ? "signup" : "signin")
                setMessage("")
                setMessageType("")
              }}
              className="mt-2 text-[#90AB8B] font-semibold hover:text-[#7a9476] transition-colors"
            >
              {emailMode === "signin" ? "Create Account" : "Sign In"}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            {/* <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/80 text-[#213448]/50">Secure Authentication</span>
            </div> */}
          </div>

          {/* <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-[#213448]/70">
              <CheckCircle className="w-4 h-4 text-[#90AB8B]" />
              <span>Encrypted Data</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#213448]/70">
              <CheckCircle className="w-4 h-4 text-[#90AB8B]" />
              <span>HIPAA Compliant</span>
            </div>
          </div> */}
        </section>

        <p className="text-center text-sm text-[#213448]/50 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {message && (
        <div className="fixed bottom-6 right-6 max-w-md animate-slide-up z-50">
          <div
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-lg ${
              messageType === "success"
                ? "bg-green-50/90 border-green-200 text-green-800"
                : "bg-red-50/90 border-red-200 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{message}</p>
            </div>
            <button
              onClick={() => setMessage("")}
              className="text-current hover:opacity-70 transition-opacity"
            >
              <svg
                className="w-4 h-4"
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
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}
