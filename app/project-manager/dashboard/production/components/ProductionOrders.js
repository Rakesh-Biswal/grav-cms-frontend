import { MoreVertical, ArrowRight } from "lucide-react"

export default function ProductionOrders({ filters }) {
  const orders = [
    {
      id: "WO2024001",
      product: "Cotton T-Shirt - White",
      quantity: 500,
      status: "In Progress",
      startDate: "2024-01-10",
      targetDate: "2024-01-25",
      assignedTo: "Production Team A",
      progress: 65,
    },
    {
      id: "WO2024002",
      product: "Denim Jeans - Blue",
      quantity: 300,
      status: "In Progress",
      startDate: "2024-01-12",
      targetDate: "2024-01-28",
      assignedTo: "Production Team B",
      progress: 45,
    },
    {
      id: "WO2024003",
      product: "Polo Shirt - Black",
      quantity: 400,
      status: "Pending",
      startDate: "2024-01-15",
      targetDate: "2024-01-30",
      assignedTo: "Production Team A",
      progress: 0,
    },
    {
      id: "WO2024004",
      product: "Summer Dress - Floral",
      quantity: 250,
      status: "Completed",
      startDate: "2024-01-05",
      targetDate: "2024-01-20",
      assignedTo: "Production Team C",
      progress: 100,
    },
    {
      id: "WO2024005",
      product: "Formal Shirt - White",
      quantity: 600,
      status: "In Progress",
      startDate: "2024-01-08",
      targetDate: "2024-01-22",
      assignedTo: "Production Team A",
      progress: 80,
    },
    {
      id: "WO2024006",
      product: "Cargo Pants - Khaki",
      quantity: 350,
      status: "Delayed",
      startDate: "2024-01-03",
      targetDate: "2024-01-18",
      assignedTo: "Production Team B",
      progress: 55,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700"
      case "In Progress":
        return "bg-blue-100 text-blue-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Delayed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="grid gap-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-slate-900">{order.id}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-slate-900 font-medium mb-2">{order.product}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Quantity</p>
                  <p className="text-slate-900 font-medium">{order.quantity} pcs</p>
                </div>
                <div>
                  <p className="text-slate-500">Start Date</p>
                  <p className="text-slate-900 font-medium">{order.startDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Target Date</p>
                  <p className="text-slate-900 font-medium">{order.targetDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p className="text-slate-900 font-medium">{order.assignedTo}</p>
                </div>
              </div>
              {order.status === "In Progress" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-slate-900 font-medium">{order.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 font-medium">
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
