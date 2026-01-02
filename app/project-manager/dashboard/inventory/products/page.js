"use client"

import { useState } from "react"
import { 
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  Users,
  Settings,
  AlertCircle,
  TrendingUp
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"

// Products modules data
const productsModules = [
  {
    id: 1,
    title: "Raw Items / Materials",
    description: "Manage all raw materials inventory for clothing production",
    icon: Layers,
    href: "/project-manager/dashboard/inventory/products/raw-items",
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    stats: {
      totalItems: 24,
      lowStock: 3,
      totalValue: "₹1,25,000"
    },
    features: [
      "Add/Edit raw materials",
      "Track stock levels",
      "Set reorder points",
      "Supplier management"
    ]
  },
  {
    id: 2,
    title: "Stock Items",
    description: "Manage finished clothing products and inventory",
    icon: ShoppingBag,
    href: "/project-manager/dashboard/inventory/products/stock-items",
    color: "bg-green-100 text-green-600",
    borderColor: "border-green-200",
    stats: {
      totalItems: 156,
      categories: 8,
      totalValue: "₹8,45,000"
    },
    features: [
      "Product catalog management",
      "Stock level tracking",
      "Pricing & cost management",
      "Category organization"
    ]
  },
  {
    id: 3,
    title: "Customer Order Request",
    description: "Capture and manage customer requirements and inquiries",
    icon: FileText,
    href: "/project-manager/dashboard/inventory/products/customer-order-request",
    color: "bg-purple-100 text-purple-600",
    borderColor: "border-purple-200",
    stats: {
      activeRequests: 18,
      pending: 5,
      totalValue: "₹15,20,000"
    },
    features: [
      "Organization details",
      "Product requirements",
      "Request tracking",
      "Priority management"
    ]
  }
]

// Recent activities
const recentActivities = [
  { id: 1, module: "Raw Items", action: "Cotton Fabric stock updated", time: "2 hours ago", type: "update" },
  { id: 2, module: "Stock Items", action: "New product 'Men's Polo' added", time: "4 hours ago", type: "add" },
  { id: 3, module: "Customer Requests", action: "New request from Fashion Retail Ltd.", time: "6 hours ago", type: "add" },
  { id: 4, module: "Raw Items", action: "Polyester Thread low stock alert", time: "1 day ago", type: "alert" },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter modules based on search
  const filteredModules = productsModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate overall statistics
  const overallStats = {
    totalModules: productsModules.length,
    totalRawItems: 24,
    totalStockItems: 156,
    totalCustomerRequests: 18,
    totalInventoryValue: "₹9,70,000"
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Central hub for managing all product-related operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{overallStats.totalModules}</span> modules available
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Raw Materials</div>
                <div className="text-xl font-semibold text-gray-900">{overallStats.totalRawItems}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Stock Items</div>
                <div className="text-xl font-semibold text-gray-900">{overallStats.totalStockItems}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Customer Requests</div>
                <div className="text-xl font-semibold text-gray-900">{overallStats.totalCustomerRequests}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Value</div>
                <div className="text-xl font-semibold text-gray-900">{overallStats.totalInventoryValue}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Modules</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {module.stats.totalItems && (
                          <span>Items: <span className="font-semibold text-gray-700">{module.stats.totalItems}</span></span>
                        )}
                        {module.stats.categories && (
                          <span>Categories: <span className="font-semibold text-gray-700">{module.stats.categories}</span></span>
                        )}
                        {module.stats.lowStock && (
                          <span>Low Stock: <span className="font-semibold text-red-600">{module.stats.lowStock}</span></span>
                        )}
                        {module.stats.totalValue && (
                          <span className="font-semibold text-green-600">{module.stats.totalValue}</span>
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
                        <span className="text-xs text-gray-500">Click to open</span>
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">Manage</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        

        {/* Usage Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">How to Use Products Management</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. <span className="font-medium">Raw Items</span>: Register all materials needed for production (fabric, thread, buttons, etc.)</p>
                <p>2. <span className="font-medium">Stock Items</span>: Manage finished products ready for sale (T-shirts, jeans, etc.)</p>
                <p>3. <span className="font-medium">Customer Requests</span>: Capture incoming customer requirements for quotations</p>
                <p className="text-xs mt-2">Each module is interconnected - customer requests create production needs, which consume raw materials to create stock items.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}