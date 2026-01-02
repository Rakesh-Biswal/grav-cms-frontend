"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Calendar,
    FileText,
    Briefcase,
    Award,
    CreditCard,
    BarChart3,
    Settings,
    Menu,
    X,
    Bell,
    Mail,
    LogOut,
    FileCheck,
    GraduationCap,
    Heart,
    Clock,
    Building,
} from "lucide-react"
import Breadcrumb from "./Breadcrumb"

export default function HRDashboardLayout({ children, activeMenu }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated")
        router.push("/login")
    }

    const navItems = [
        { key: "dashboard", name: "HR Dashboard", href: "/hr/dashboard", icon: LayoutDashboard, active: true },
        { key: "employees", name: "Employees", href: "/hr/dashboard/employees", icon: Users, active: true },
        { key: "recruitment", name: "Recruitment", href: "/hr/dashboard/recruitment", icon: UserPlus, active: true },
        { key: "attendance", name: "Attendance", href: "/hr/dashboard/attendance", icon: Clock, active: true },
        { key: "leaves", name: "Leaves", href: "/hr/dashboard/leaves", icon: Calendar, active: true },
        { key: "payroll", name: "Payroll", href: "/hr/dashboard/payroll", icon: CreditCard, active: true },
        { key: "performance", name: "Performance", href: "/hr/dashboard/performance", icon: Award, active: true },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Overlay (mobile only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          w-64 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo + Close */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <div>
                                <h1 className="text-gray-900 font-semibold text-lg">Grav Clothing</h1>
                                <p className="text-gray-500 text-xs">Human Resources</p>
                            </div>
                        </div>

                        {/* Close button (desktop + mobile) */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = activeMenu === item.key

                                return (
                                    <li key={item.key}>
                                        {item.active ? (
                                            <Link
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${isActive
                                                        ? "bg-purple-50 text-purple-700"
                                                        : "text-gray-700 hover:bg-gray-50"}
                        `}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50">
                                                <item.icon className="w-5 h-5" />
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm">HR Manager</p>
                                <p className="text-gray-500 text-xs">hr@gravclothing.com</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2
              bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div
                className={`
          transition-all duration-300
          ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}
        `}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                    <div className="px-4 lg:px-8 py-4">
                        {/* Top row: Toggle + User controls */}
                        <div className="flex flex-col items-center justify-between lg:flex-row">

                            <div className="flex items-center gap-4">
                                {/* Toggle button */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    {sidebarOpen ? (
                                        <></>
                                    ) : (
                                        <Menu className="w-6 h-6 text-gray-700" />
                                    )}
                                </button>

                                {/* Breadcrumb */}
                                <div className="flex items-center justify-between">
                                    <Breadcrumb />
                                </div>

                            </div>

                            <div className="flex-1 lg:hidden">
                                <h2 className="text-xl font-semibold text-gray-900 text-center">
                                    HR Dashboard
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                                </button>

                                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>

                                <div className="hidden sm:flex items-center gap-2 ml-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Briefcase className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">HR Department</p>
                                        <p className="text-gray-500 text-xs">Managing {Math.floor(Math.random() * 50) + 100} Employees</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    )
}