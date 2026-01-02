"use client"

import { useState } from "react"
import {
    Settings,
    Building,
    Users,
    Package,
    Wrench,
    ArrowRight,
    Search,
    Plus,
    BarChart3,
    Calendar,
    Shield,
    AlertCircle,
    TrendingUp
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"

// Configurations modules data
const configurationsModules = [
    {
        id: 1,
        title: "Warehouse Management",
        description: "Manage storage locations, capacity, and warehouse details",
        icon: Building,
        href: "/project-manager/dashboard/inventory/configurations/warehouse",
        color: "bg-blue-100 text-blue-600",
        borderColor: "border-blue-200",
        stats: {
            totalWarehouses: 6,
            active: 5,
            capacity: "45,000 sq ft"
        },
        features: [
            "Add/Edit warehouse locations",
            "Track storage capacity",
            "Manage warehouse details",
            "Location mapping"
        ]
    },
    {
        id: 2,
        title: "Workers / Employees",
        description: "Manage production staff, assignments, and team structure",
        icon: Users,
        href: "/project-manager/dashboard/inventory/configurations/assigned-team",
        color: "bg-green-100 text-green-600",
        borderColor: "border-green-200",
        stats: {
            totalEmployees: 24,
            active: 22,
            departments: 5
        },
        features: [
            "Employee registration",
            "Department assignment",
            "Skill tracking",
            "Shift management"
        ]
    },
    {
        id: 3,
        title: "Devices / Machines",
        description: "Manage manufacturing equipment and maintenance schedules",
        icon: Wrench,
        href: "/project-manager/dashboard/inventory/configurations/devices-machines",
        color: "bg-purple-100 text-purple-600",
        borderColor: "border-purple-200",
        stats: {
            totalMachines: 18,
            operational: 15,
            underMaintenance: 3
        },
        features: [
            "Machine registration",
            "Maintenance scheduling",
            "Performance tracking",
            "Repair history"
        ]
    },
    {
        id: 4,
        title: "Units & Packaging",
        description: "Manage measurement units and packaging configurations",
        icon: Package,
        href: "/project-manager/dashboard/inventory/configurations/units-packaging",
        color: "bg-amber-100 text-amber-600",
        borderColor: "border-amber-200",
        stats: {
            totalUnits: 15,
            baseUnits: 7,
            conversions: 8
        },
        features: [
            "Unit definitions",
            "Conversion rates",
            "Packaging types",
            "GST UQC codes"
        ]
    }
]

// System status
const systemStatus = [
    { id: 1, component: "Database", status: "Healthy", color: "bg-green-100 text-green-700" },
    { id: 2, component: "File Storage", status: "Healthy", color: "bg-green-100 text-green-700" },
    { id: 3, component: "Backup System", status: "Active", color: "bg-blue-100 text-blue-700" },
    { id: 4, component: "Security", status: "Enabled", color: "bg-green-100 text-green-700" },
    { id: 5, component: "API Services", status: "Running", color: "bg-green-100 text-green-700" },
    { id: 6, component: "Notifications", status: "Active", color: "bg-blue-100 text-blue-700" },
]

export default function ConfigurationsPage() {
    const [searchTerm, setSearchTerm] = useState("")

    // Filter modules based on search
    const filteredModules = configurationsModules.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate overall statistics
    const overallStats = {
        totalModules: configurationsModules.length,
        totalConfigurations: 63,
        activeSystems: 6,
        lastUpdated: "Today, 10:30 AM"
    }

    return (
        <DashboardLayout activeMenu="inventory">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">System Configurations</h1>
                        <p className="text-gray-600 mt-1">Central hub for managing all system settings and configurations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                            Last updated: <span className="font-medium text-gray-700">{overallStats.lastUpdated}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Total Modules</div>
                                <div className="text-xl font-semibold text-gray-900">{overallStats.totalModules}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Active Configurations</div>
                                <div className="text-xl font-semibold text-gray-900">{overallStats.totalConfigurations}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Active Systems</div>
                                <div className="text-xl font-semibold text-gray-900">{overallStats.activeSystems}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">System Health</div>
                                <div className="text-xl font-semibold text-green-600">100%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Configuration Modules</h2>
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search modules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredModules.map((module) => {
                            const Icon = module.icon
                            return (
                                <Link
                                    key={module.id}
                                    href={module.href}
                                    className="group block"
                                >
                                    <div className={`bg-white border ${module.borderColor} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                                        {/* Stats */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                {module.stats.totalWarehouses && (
                                                    <span>Warehouses: <span className="font-semibold text-gray-700">{module.stats.totalWarehouses}</span></span>
                                                )}
                                                {module.stats.totalEmployees && (
                                                    <span>Employees: <span className="font-semibold text-gray-700">{module.stats.totalEmployees}</span></span>
                                                )}
                                                {module.stats.totalMachines && (
                                                    <span>Machines: <span className="font-semibold text-gray-700">{module.stats.totalMachines}</span></span>
                                                )}
                                                {module.stats.totalUnits && (
                                                    <span>Units: <span className="font-semibold text-gray-700">{module.stats.totalUnits}</span></span>
                                                )}
                                                {module.stats.active && (
                                                    <span>Active: <span className="font-semibold text-green-600">{module.stats.active}</span></span>
                                                )}
                                                {module.stats.capacity && (
                                                    <span className="font-semibold text-blue-600">{module.stats.capacity}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-500">Key Features:</div>
                                            <ul className="space-y-1">
                                                {module.features.map((feature, index) => (
                                                    <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Click to configure</span>
                                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">Configure</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* System Status & Quick Actions */}
                

                {/* Configuration Guide */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-1">Configuration Management Guide</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>1. <span className="font-medium">Warehouse Management</span>: Define storage locations and track inventory distribution</p>
                                <p>2. <span className="font-medium">Workers/Employees</span>: Manage production teams and assign responsibilities</p>
                                <p>3. <span className="font-medium">Devices/Machines</span>: Track manufacturing equipment and maintenance schedules</p>
                                <p>4. <span className="font-medium">Units & Packaging</span>: Define measurement standards and packaging types</p>
                                <p className="text-xs mt-2">These configurations form the foundation of your production system. Ensure all settings are accurate for smooth operations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}