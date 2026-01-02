import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"

export default function InventoryStats() {
  const stats = [
    {
      label: "Total Items",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Low Stock Items",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      label: "In Stock",
      value: "1,180",
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
    {
      label: "Out of Stock",
      value: "31",
      change: "+3%",
      trend: "up",
      icon: TrendingDown,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
              {stat.change}
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
