"use client"

import {
  Truck,
  ClipboardList,
  ArrowRight,
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"

const operationsModules = [
  {
    id: 1,
    title: "Receipt / Purchase Order",
    description: "Record inbound materials and purchase transactions",
    icon: ClipboardList,
    href: "/project-manager/dashboard/inventory/operations/purchase-order",
    color: "bg-cyan-100 text-cyan-600",
    borderColor: "border-cyan-200",
    stats: { total: 42, pending: 6 },
    features: [
      "Create purchase orders",
      "Receive materials",
      "Supplier linkage",
      "Pending receipts tracking"
    ]
  },
  {
    id: 2,
    title: "Delivery",
    description: "Handle outbound dispatch and customer shipments",
    icon: Truck,
    href: "/project-manager/dashboard/inventory/operations/delivery",
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-200",
    stats: { total: 58, dispatched: 51 },
    features: [
      "Generate delivery challan",
      "Assign transport vehicle",
      "Dispatch tracking",
      "Customer linkage"
    ]
  }
]

export default function OperationsPage() {

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operations</h1>
          <p className="text-gray-600 mt-1">
            Perform daily inbound and outbound operations
          </p>
        </div>

        {/* OPERATIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operationsModules.map((op) => {
            const Icon = op.icon
            return (
              <Link
                key={op.id}
                href={op.href}
                className="group block"
              >
                <div className={`bg-white border ${op.borderColor} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
                  
                  {/* ICON + NAV ARROW */}
                  <div className="flex justify-between items-center mb-4">
                    <div className={`w-12 h-12 ${op.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>

                  {/* TITLE */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {op.title}
                  </h3>

                  {/* DESC */}
                  <p className="text-gray-600 text-sm mt-1 mb-4">
                    {op.description}
                  </p>

                  {/* SIMPLE STATS */}
                  <div className="text-xs text-gray-500 mb-3">
                    {op.stats.total && <span className="mr-4">Total: <span className="text-gray-800 font-semibold">{op.stats.total}</span></span>}
                    {op.stats.pending && <span className="text-yellow-600 font-medium">Pending: {op.stats.pending}</span>}
                    {op.stats.dispatched && <span className="text-green-600 font-medium">Dispatched: {op.stats.dispatched}</span>}
                  </div>

                  {/* FEATURES / KEY POINTS */}
                  <div className="space-y-1 mt-2">
                    <div className="text-xs font-medium text-gray-500">Key Actions:</div>
                    <ul className="space-y-1">
                      {op.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Click to proceed</span>
                    <span className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-600">Open</span>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </DashboardLayout>
  )
}
