import { MoreVertical } from "lucide-react"

export default function InventoryTable({ filters }) {
  const inventoryData = [
    {
      id: "INV001",
      name: "Cotton Fabric - White",
      category: "Fabric",
      quantity: 450,
      unit: "meters",
      status: "In Stock",
      location: "Warehouse A",
      lastUpdated: "2024-01-15",
    },
    {
      id: "INV002",
      name: "Polyester Thread - Black",
      category: "Thread",
      quantity: 25,
      unit: "rolls",
      status: "Low Stock",
      location: "Warehouse B",
      lastUpdated: "2024-01-14",
    },
    {
      id: "INV003",
      name: "Denim Fabric - Blue",
      category: "Fabric",
      quantity: 320,
      unit: "meters",
      status: "In Stock",
      location: "Warehouse A",
      lastUpdated: "2024-01-15",
    },
    {
      id: "INV004",
      name: "Metal Buttons - Silver",
      category: "Accessories",
      quantity: 0,
      unit: "pieces",
      status: "Out of Stock",
      location: "Warehouse C",
      lastUpdated: "2024-01-10",
    },
    {
      id: "INV005",
      name: "Silk Fabric - Red",
      category: "Fabric",
      quantity: 180,
      unit: "meters",
      status: "In Stock",
      location: "Warehouse A",
      lastUpdated: "2024-01-15",
    },
    {
      id: "INV006",
      name: "Elastic Band - 2cm",
      category: "Accessories",
      quantity: 15,
      unit: "rolls",
      status: "Low Stock",
      location: "Warehouse B",
      lastUpdated: "2024-01-13",
    },
    {
      id: "INV007",
      name: "Linen Fabric - Beige",
      category: "Fabric",
      quantity: 275,
      unit: "meters",
      status: "In Stock",
      location: "Warehouse A",
      lastUpdated: "2024-01-15",
    },
    {
      id: "INV008",
      name: "Zipper - 20cm Black",
      category: "Accessories",
      quantity: 340,
      unit: "pieces",
      status: "In Stock",
      location: "Warehouse C",
      lastUpdated: "2024-01-14",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-100 text-emerald-700"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-700"
      case "Out of Stock":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inventoryData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.lastUpdated}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
