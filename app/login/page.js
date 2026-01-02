"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, User } from "lucide-react"
import toast from "react-hot-toast"

import { Toast } from "@/utils/toast"

export default function LoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔐 VERY IMPORTANT
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Login successful!") // Success toast
        router.push(data.redirectTo)
      } else {
        const errorMsg = data.message || "Login failed"
        setError(errorMsg)
        toast.error(errorMsg) // Error toast
      }
    } catch (err) {
      console.error(err)
      const errorMsg = "Network error - Please check your connection"
      setError(errorMsg)
      toast.error(errorMsg) // Error toast
    } finally {
      setLoading(false)
    }
  }


  // Quick login buttons for testing
  const handleQuickLogin = (email, password) => {
    setCredentials({ email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <div className="text-left">
              <h1 className="text-white font-bold text-2xl">Grav Clothing</h1>
              <p className="text-slate-400 text-sm">Bhubaneswar, Odisha</p>
            </div>
          </div>
          <h2 className="text-white text-xl font-semibold">Sign in to your account</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Login for Testing */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm text-center mb-3">Quick login for testing:</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("hr@grav.in", "hr@grav")}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors text-center"
              >
                HR Manager (hr@grav.in)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Use the HR credentials above for testing
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}