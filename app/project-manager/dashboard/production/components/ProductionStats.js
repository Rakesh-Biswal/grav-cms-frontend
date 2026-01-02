import { Factory, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ProductionStats() {
  const stats = [
    {
      label: "Total Orders",
      value: "245",
      change: "+18%",
      icon: Factory,
      color: "bg-blue-500",
    },
    {
      label: "In Progress",
      value: "45",
      change: "+12%",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Completed",
      value: "186",
      change: "+24%",
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      label: "Delayed",
      value: "14",
      change: "-8%",
      icon: AlertCircle,
      color: "bg-red-500",
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
            <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
          </div>
          <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
