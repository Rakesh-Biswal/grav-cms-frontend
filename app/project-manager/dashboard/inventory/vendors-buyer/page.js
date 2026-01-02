"use client"

import { useState } from "react"
import {
    Building,
    Users,
    ShoppingBag,
    ArrowRight,
    Search,
    TrendingUp,
    Package,
    CreditCard,
    BarChart3,
    Shield,
    Mail,
    Phone
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"

// Vendors & Buyers modules data
const vendorsBuyersModules = [
    {
        id: 1,
        title: "Vendors & Suppliers",
        description: "Manage your clothing industry suppliers, vendors, and service providers",
        icon: Building,
        href: "/project-manager/dashboard/inventory/vendors-buyer/vendors",
        color: "bg-blue-100 text-blue-600",
        borderColor: "border-blue-200",
        stats: {
            totalVendors: 45,
            active: 38,
            categories: 6
        },
        features: [
            "Supplier registration",
            "Contact management",
            "Product catalog",
            "Payment terms"
        ],
        vendorTypes: ["Fabric Suppliers", "Accessories", "Equipment", "Logistics"]
    },
    {
        id: 2,
        title: "Customers & Buyers",
        description: "Manage customer information, orders, and relationship history",
        icon: Users,
        href: "/project-manager/dashboard/inventory/vendors-buyer/customers",
        color: "bg-green-100 text-green-600",
        borderColor: "border-green-200",
        stats: {
            totalCustomers: 128,
            active: 112,
            orders: 342
        },
        features: [
            "Customer profiles",
            "Order history",
            "Communication log",
            "Credit management"
        ],
        customerTypes: ["Retail", "Wholesale", "Corporate", "Export"]
    }
]

// Quick Stats
const quickStats = [
    {
        id: 1,
        title: "Total Partners",
        value: "173",
        icon: Users,
        color: "bg-purple-100 text-purple-600",
        change: "+12%"
    },
    {
        id: 2,
        title: "Active This Month",
        value: "89",
        icon: TrendingUp,
        color: "bg-green-100 text-green-600",
        change: "+8%"
    },
    {
        id: 3,
        title: "Pending Orders",
        value: "24",
        icon: ShoppingBag,
        color: "bg-amber-100 text-amber-600",
        change: "-3"
    },
    {
        id: 4,
        title: "Total Revenue",
        value: "₹2.4L",
        icon: CreditCard,
        color: "bg-blue-100 text-blue-600",
        change: "+18%"
    },
]

// Recent Activities
const recentActivities = [
    { id: 1, type: "vendor", action: "New fabric supplier registered", time: "10 min ago", vendor: "Textile Traders Ltd." },
    { id: 2, type: "customer", action: "New order received", time: "25 min ago", customer: "Fashion House Inc." },
    { id: 3, type: "vendor", action: "Payment processed", time: "1 hour ago", vendor: "Accessories World" },
    { id: 4, type: "customer", action: "Order shipped", time: "2 hours ago", customer: "Retail Store XYZ" },
    { id: 5, type: "vendor", action: "New product added", time: "3 hours ago", vendor: "Packaging Solutions" },
]

export default function VendorsBuyersPage() {
    const [searchTerm, setSearchTerm] = useState("")

    // Filter modules based on search
    
    const filteredModules = vendorsBuyersModules.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate overall statistics
    const overallStats = {
        totalVendors: 45,
        totalCustomers: 128,
        totalOrders: 342,
        activePartners: 150
    }

    return (
        <DashboardLayout activeMenu="history-report">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Vendors & Buyers</h1>
                        <p className="text-gray-600 mt-1">Manage your business partners - suppliers, vendors, and customers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                            Last updated: <span className="font-medium text-gray-700">Today, 10:30 AM</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickStats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div key={stat.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">{stat.title}</div>
                                        <div className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</div>
                                        <div className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} from last month
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Main Modules */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Manage Business Partners</h2>
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
                                                {module.stats.totalVendors && (
                                                    <span>Total Vendors: <span className="font-semibold text-gray-700">{module.stats.totalVendors}</span></span>
                                                )}
                                                {module.stats.totalCustomers && (
                                                    <span>Total Customers: <span className="font-semibold text-gray-700">{module.stats.totalCustomers}</span></span>
                                                )}
                                                {module.stats.active && (
                                                    <span>Active: <span className="font-semibold text-green-600">{module.stats.active}</span></span>
                                                )}
                                                {module.stats.orders && (
                                                    <span>Orders: <span className="font-semibold text-blue-600">{module.stats.orders}</span></span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="mb-4">
                                            <div className="text-xs font-medium text-gray-500 mb-2">Key Features:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {module.features.map((feature, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Types */}
                                        {module.vendorTypes && (
                                            <div className="mb-4">
                                                <div className="text-xs font-medium text-gray-500 mb-2">Vendor Categories:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {module.vendorTypes.map((type, index) => (
                                                        <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {module.customerTypes && (
                                            <div className="mb-4">
                                                <div className="text-xs font-medium text-gray-500 mb-2">Customer Types:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {module.customerTypes.map((type, index) => (
                                                        <span key={index} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Click to manage</span>
                                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">Manage</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Recent Activities */}
                

                {/* Help Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-1">Business Partner Management</h3>
                            <div className="text-sm text-blue-700 space-y-2">
                                <p><span className="font-medium">Vendors & Suppliers:</span> Manage all your suppliers for fabrics, accessories, equipment, and services. Track contact details, products, and payment terms.</p>
                                <p><span className="font-medium">Customers & Buyers:</span> Manage customer relationships, track orders, maintain communication history, and handle credit terms.</p>
                                <p className="text-xs mt-2">Keep your partner information updated for smooth business operations and better relationships.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}