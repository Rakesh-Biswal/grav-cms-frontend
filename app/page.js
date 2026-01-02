import Link from "next/link"
import { ArrowRight, Package, Factory, BarChart3, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Grav Clothing</h1>
              <p className="text-slate-400 text-xs">Bhubaneswar, Odisha</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Company Management
            <span className="block text-emerald-400">Made Simple</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Streamline your clothing manufacturing operations with our comprehensive management system
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Inventory Management</h3>
            <p className="text-slate-400 text-sm">Track and manage your clothing inventory in real-time</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <Factory className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Production Tracking</h3>
            <p className="text-slate-400 text-sm">Monitor production orders and workflows efficiently</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Analytics & Reports</h3>
            <p className="text-slate-400 text-sm">Get insights with detailed reports and analytics</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-xl">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Secure Access</h3>
            <p className="text-slate-400 text-sm">Role-based access control for your team</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          © 2025 Grav Clothing. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
