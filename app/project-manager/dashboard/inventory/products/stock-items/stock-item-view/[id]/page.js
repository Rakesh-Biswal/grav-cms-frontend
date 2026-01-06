"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  ShoppingBag,
  Tag,
  Hash,
  Palette,
  DollarSign,
  Percent,
  Barcode,
  Package,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Receipt,
  Calculator,
  Cpu,
  Clock,
  Settings,
  Edit,
  Printer,
  Download,
  Share2,
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  Package2,
  Scissors,
  Truck,
  Clock4,
  Star,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  Copy,
  Trash2
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import toast from "react-hot-toast"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function StockItemViewPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [stockItem, setStockItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [inventoryHistory, setInventoryHistory] = useState([])
  const [salesHistory, setSalesHistory] = useState([])

  // Fetch stock item data
  const fetchStockItemData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/stock-items/${params.id}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStockItem(result.stockItem)
        generateMockHistory(result.stockItem)
      } else {
        toast.error(result.message || "Failed to fetch stock item data")
        router.push("/project-manager/dashboard/inventory/products/stock-items")
      }
    } catch (error) {
      console.error("Error fetching stock item:", error)
      toast.error("Failed to fetch stock item data")
      router.push("/project-manager/dashboard/inventory/products/stock-items")
    } finally {
      setLoading(false)
    }
  }

  // Generate mock history data (in production, fetch from API)
  const generateMockHistory = (item) => {
    // Generate inventory history
    const inventoryHistoryData = [
      { date: new Date().toISOString(), type: "Purchase", quantity: 50, balance: item.quantityOnHand, user: "Admin" },
      { date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), type: "Sale", quantity: -25, balance: item.quantityOnHand - 50, user: "Sales Dept" },
      { date: new Date(Date.now() - 10*24*60*60*1000).toISOString(), type: "Purchase", quantity: 100, balance: item.quantityOnHand - 25, user: "Admin" },
      { date: new Date(Date.now() - 15*24*60*60*1000).toISOString(), type: "Adjustment", quantity: 25, balance: item.quantityOnHand - 125, user: "Inventory" }
    ]
    setInventoryHistory(inventoryHistoryData)

    // Generate sales history
    const salesHistoryData = [
      { date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), quantity: 10, amount: 10 * (item.salesPrice || 0), customer: "Retail Customer" },
      { date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), quantity: 15, amount: 15 * (item.salesPrice || 0), customer: "Bulk Order - FashionHub" },
      { date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), quantity: 5, amount: 5 * (item.salesPrice || 0), customer: "Retail Customer" },
      { date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), quantity: 8, amount: 8 * (item.salesPrice || 0), customer: "Online Store" }
    ]
    setSalesHistory(salesHistoryData)
  }

  useEffect(() => {
    if (params.id) {
      fetchStockItemData()
    }
  }, [params.id])

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this stock item? This action cannot be undone.")) {
      return
    }
    
    try {
      setDeleting(true)
      const response = await fetch(`${API_URL}/api/cms/stock-items/${params.id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Stock item deleted successfully")
        router.push("/project-manager/dashboard/inventory/products/stock-items")
      } else {
        toast.error(result.message || "Failed to delete stock item")
      }
    } catch (error) {
      console.error("Error deleting stock item:", error)
      toast.error("Failed to delete stock item")
    } finally {
      setDeleting(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  // Calculate statistics
  const getStockPercentage = (item) => {
    if (!item) return 0
    const percentage = (item.quantityOnHand / item.maxStock) * 100
    return Math.min(100, Math.max(0, percentage))
  }
  
  const getStockColor = (item) => {
    const percentage = getStockPercentage(item)
    if (percentage < 25) return "text-red-600"
    if (percentage < 50) return "text-yellow-600"
    return "text-green-600"
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case "In Stock": return "bg-green-100 text-green-800"
      case "Low Stock": return "bg-yellow-100 text-yellow-800"
      case "Out of Stock": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  
  const getTotalOperationsDuration = () => {
    if (!stockItem || !stockItem.operations) return 0
    return stockItem.operations.reduce((total, op) => {
      const minutes = op.minutes || 0
      const seconds = op.seconds || 0
      return total + (minutes * 60) + seconds
    }, 0)
  }
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate profit margin
  const calculateProfitMargin = () => {
    if (!stockItem || !stockItem.salesPrice || !stockItem.totalCost || stockItem.totalCost === 0) return 0
    return ((stockItem.salesPrice - stockItem.totalCost) / stockItem.totalCost) * 100
  }

  // Get image URL
  const getImageUrl = (images) => {
    if (images && images.length > 0) {
      return images[0]
    }
    return null
  }

  // Calculate sales tax
  const calculateSalesTax = () => {
    if (!stockItem || !stockItem.salesPrice) return 0
    const taxRate = parseFloat(stockItem.salesTax?.replace('% GST S', '') || 5)
    return (stockItem.salesPrice * taxRate) / 100
  }

  // Calculate tax included price
  const calculateTaxIncludedPrice = () => {
    if (!stockItem || !stockItem.salesPrice) return 0
    const taxRate = parseFloat(stockItem.salesTax?.replace('% GST S', '') || 5)
    return stockItem.salesPrice * (1 + (taxRate / 100))
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!stockItem) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Stock Item Not Found</h3>
                <div className="mt-1 text-sm text-red-700">
                  The requested stock item could not be found.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/project-manager/dashboard/inventory/products/stock-items"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stock Items
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const profitMargin = calculateProfitMargin()
  const taxAmount = calculateSalesTax()
  const taxIncludedPrice = calculateTaxIncludedPrice()
  const totalOperationsDuration = getTotalOperationsDuration()

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/project-manager/dashboard/inventory/products/stock-items"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{stockItem.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-sm text-gray-600 font-mono flex items-center gap-2">
                  {stockItem.reference}
                  <button
                    onClick={() => copyToClipboard(stockItem.reference)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Copy Reference"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stockItem.status)}`}>
                  {stockItem.status}
                </span>
                <div className="text-sm text-gray-500">
                  Updated: {formatDate(stockItem.updatedAt)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStockItemData}
              className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href={`/project-manager/dashboard/inventory/products/stock-items/new-stock-item/${params.id}`}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Current Stock</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {stockItem.quantityOnHand} {stockItem.unit}
                </div>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStockColor(stockItem).replace('text-', 'bg-')}`}
                  style={{ width: `${getStockPercentage(stockItem)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {stockItem.minStock}</span>
                <span>Max: {stockItem.maxStock}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  ₹{stockItem.totalCost?.toLocaleString('en-IN') || "0.00"}
                </div>
              </div>
              <Calculator className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Raw: ₹{stockItem.totalRawItemsCost?.toLocaleString('en-IN') || "0.00"} + Ops: ₹{stockItem.totalOperationsCost?.toLocaleString('en-IN') || "0.00"}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Selling Price</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  ₹{stockItem.salesPrice?.toLocaleString('en-IN') || "0.00"}
                </div>
              </div>
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
            <div className={`text-xs ${profitMargin >= 50 ? 'text-green-600' : profitMargin >= 25 ? 'text-yellow-600' : 'text-red-600'} mt-2`}>
              Margin: {profitMargin.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Operations</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {stockItem.operations?.length || 0}
                </div>
              </div>
              <Cpu className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Duration: {formatDuration(totalOperationsDuration)}
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                "overview",
                "general",
                "attributes",
                "rawItems",
                "operations",
                "pricing",
                "inventory",
                "sales"
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "general" && "General Info"}
                  {tab === "attributes" && "Attributes"}
                  {tab === "rawItems" && "Raw Items"}
                  {tab === "operations" && "Operations"}
                  {tab === "pricing" && "Pricing"}
                  {tab === "inventory" && "Inventory History"}
                  {tab === "sales" && "Sales History"}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Product Images */}
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Product Images</h3>
                  {stockItem.images && stockItem.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {stockItem.images.map((image, index) => (
                        <div key={index} className="border border-gray-300 rounded-md overflow-hidden">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-300 rounded-md">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>
                
                {/* Quick Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Product Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{stockItem.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Product Type:</span>
                          <span className="font-medium">{stockItem.productType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Unit:</span>
                          <span className="font-medium">{stockItem.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">HSN Code:</span>
                          <span className="font-medium">{stockItem.hsnCode || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Attributes Preview */}
                    {stockItem.attributes && stockItem.attributes.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-800 mb-3">Attributes</h4>
                        <div className="space-y-3">
                          {stockItem.attributes.slice(0, 3).map((attr, index) => (
                            <div key={index}>
                              <div className="text-xs text-gray-600 mb-1 capitalize">{attr.name}</div>
                              <div className="flex flex-wrap gap-1">
                                {attr.values.slice(0, 3).map((value, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                                  >
                                    {value}
                                  </span>
                                ))}
                                {attr.values.length > 3 && (
                                  <span className="px-2 py-1 text-xs text-gray-500">
                                    +{attr.values.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {stockItem.attributes.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{stockItem.attributes.length - 3} more attributes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Pricing Summary */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Pricing Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="font-medium">₹{stockItem.totalCost?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Selling Price:</span>
                          <span className="font-medium text-green-700">₹{stockItem.salesPrice?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profit Margin:</span>
                          <span className={`font-medium ${
                            profitMargin >= 50 ? 'text-green-700' :
                            profitMargin >= 25 ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {profitMargin.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax Included:</span>
                          <span className="font-medium text-blue-700">₹{taxIncludedPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Stock Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-medium">{stockItem.quantityOnHand} {stockItem.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Stock:</span>
                          <span className="font-medium">{stockItem.minStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Max Stock:</span>
                          <span className="font-medium">{stockItem.maxStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inventory Value:</span>
                          <span className="font-medium text-green-700">
                            ₹{(stockItem.quantityOnHand * (stockItem.totalCost || 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* General Information Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.name}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Type
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.productType}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoicing Policy
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.invoicingPolicy}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.category}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono flex justify-between items-center">
                        {stockItem.reference}
                        <button
                          onClick={() => copyToClipboard(stockItem.reference)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy Reference"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barcode
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono flex justify-between items-center">
                        {stockItem.barcode || "Not generated"}
                        {stockItem.barcode && (
                          <button
                            onClick={() => copyToClipboard(stockItem.barcode)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Copy Barcode"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Track Inventory
                      </label>
                      <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.trackInventory ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        <span>{stockItem.trackInventory ? "Yes - Inventory tracking enabled" : "No - Inventory tracking disabled"}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSN/SAC Code
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {stockItem.hsnCode || "Not specified"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Internal Notes
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md min-h-[100px] whitespace-pre-wrap">
                        {stockItem.internalNotes || "No internal notes"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created Date
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {formatDateTime(stockItem.createdAt)}
                      </div>
                      {stockItem.createdBy && (
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          By: {stockItem.createdBy.name}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {formatDateTime(stockItem.updatedAt)}
                      </div>
                      {stockItem.updatedBy && (
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          By: {stockItem.updatedBy.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attributes & Variants Tab */}
            {activeTab === "attributes" && (
              <div className="space-y-6">
                {stockItem.attributes && stockItem.attributes.length > 0 ? (
                  <div className="space-y-4">
                    {stockItem.attributes.map((attr, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{attr.name}</span>
                            <span className="ml-2 text-xs text-gray-500">({attr.values.length} values)</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {attr.values.map((value, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 border border-gray-300 rounded text-center text-sm bg-white hover:bg-gray-50"
                            >
                              {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No attributes defined for this product.</p>
                  </div>
                )}
                
                {/* Variants Section */}
                {stockItem.variants && stockItem.variants.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-800 mb-4">Product Variants</h3>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Variant SKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attributes
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockItem.variants.map((variant, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                {variant.sku}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {variant.attributes.map((attr, idx) => (
                                    <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                      {attr.name}: {attr.value}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {variant.quantityOnHand} {stockItem.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₹{variant.cost?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                ₹{variant.salesPrice?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw Items Tab */}
            {activeTab === "rawItems" && (
              <div className="space-y-6">
                {stockItem.rawItems && stockItem.rawItems.length > 0 ? (
                  <div>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Raw Item
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Cost
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockItem.rawItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                {item.sku}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₹{item.unitCost?.toFixed(2) || "0.00"}/{item.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                ₹{item.totalCost?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                              Total Raw Materials Cost:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-green-700">
                              ₹{stockItem.totalRawItemsCost?.toFixed(2) || "0.00"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {/* Raw Materials Summary */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Raw Materials Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Number of Raw Items</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {stockItem.rawItems.length}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Average Cost per Item</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            ₹{(stockItem.totalRawItemsCost / stockItem.rawItems.length).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Percentage of Total Cost</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {((stockItem.totalRawItemsCost / stockItem.totalCost) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No raw items defined for this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* Operations Tab */}
            {activeTab === "operations" && (
              <div className="space-y-6">
                {stockItem.operations && stockItem.operations.length > 0 ? (
                  <div>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Operation Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Machine
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Operator Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockItem.operations.map((op, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Cpu className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">{op.type}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Settings className="w-4 h-4 text-gray-400" />
                                  {op.machineType || "N/A"}
                                  
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  {op.minutes || 0}m {op.seconds || 0}s
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                ₹{op.operatorCost?.toFixed(2) || "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                              Total Operations Cost:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-green-700">
                              ₹{stockItem.totalOperationsCost?.toFixed(2) || "0.00"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {/* Operations Summary */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Operations Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Total Operations</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {stockItem.operations.length}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Total Duration</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {formatDuration(totalOperationsDuration)}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="text-xs text-gray-600">Percentage of Total Cost</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {((stockItem.totalOperationsCost / stockItem.totalCost) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No operations defined for this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cost Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-800">Cost Breakdown</h4>
                    
                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Cost:</span>
                        <span className="font-medium">₹{stockItem.cost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Raw Materials:</span>
                        <span className="font-medium">₹{stockItem.totalRawItemsCost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Operations:</span>
                        <span className="font-medium">₹{stockItem.totalOperationsCost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Miscellaneous:</span>
                        <span className="font-medium">₹{stockItem.totalMiscellaneousCost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700">Total Cost:</span>
                          <span className="text-green-700">₹{stockItem.totalCost?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Miscellaneous Costs */}
                    {stockItem.miscellaneousCosts && stockItem.miscellaneousCosts.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">Miscellaneous Costs</h5>
                        <div className="space-y-2">
                          {stockItem.miscellaneousCosts.map((cost, index) => (
                            <div key={index} className="flex justify-between text-sm px-3 py-2 bg-gray-50 rounded">
                              <span className="text-gray-600">{cost.name}:</span>
                              <span className="font-medium">₹{cost.amount?.toFixed(2) || "0.00"} ({cost.unit})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sales & Profit */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-800">Sales & Profit</h4>
                    
                    <div className="bg-gray-50 p-4 rounded-md space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sales Price:</span>
                        <span className="font-medium text-green-700">₹{stockItem.salesPrice?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sales Tax ({stockItem.salesTax || "5% GST S"}):</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price with Tax:</span>
                        <span className="font-medium text-blue-700">₹{taxIncludedPrice.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700">Profit per Unit:</span>
                          <span className="text-green-700">
                            ₹{(stockItem.salesPrice - stockItem.totalCost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profit Margin */}
                    <div className={`p-4 rounded-md ${
                      profitMargin >= 50 ? 'bg-green-50 border border-green-200' :
                      profitMargin >= 25 ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="text-xs text-gray-600">Profit Margin</div>
                      <div className={`text-2xl font-semibold mt-1 ${
                        profitMargin >= 50 ? 'text-green-800' :
                        profitMargin >= 25 ? 'text-yellow-800' :
                        'text-red-800'
                      }`}>
                        {profitMargin.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        {profitMargin >= 50 ? 'Excellent Margin' :
                         profitMargin >= 25 ? 'Good Margin' :
                         'Low Margin - Consider reviewing pricing'}
                      </div>
                    </div>
                    
                    {/* Inventory Value */}
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <div className="text-xs text-blue-600">Current Inventory Value</div>
                      <div className="text-lg font-semibold text-blue-800 mt-1">
                        ₹{(stockItem.quantityOnHand * stockItem.totalCost).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-blue-700 mt-2">
                        Potential Revenue: ₹{(stockItem.quantityOnHand * stockItem.salesPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory History Tab */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === 'Purchase' ? 'bg-green-100 text-green-800' :
                              item.type === 'Sale' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            item.quantity > 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.balance}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.user}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Inventory Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="text-xs text-blue-600">Total Purchases</div>
                    <div className="text-lg font-semibold text-blue-800 mt-1">
                      {inventoryHistory.filter(item => item.type === 'Purchase').length}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="text-xs text-green-600">Total Sales</div>
                    <div className="text-lg font-semibold text-green-800 mt-1">
                      {inventoryHistory.filter(item => item.type === 'Sale').length}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                    <div className="text-xs text-purple-600">Current Stock Value</div>
                    <div className="text-lg font-semibold text-purple-800 mt-1">
                      ₹{(stockItem.quantityOnHand * stockItem.salesPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales History Tab */}
            {activeTab === "sales" && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-700">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.customer}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {salesHistory.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700">
                          ₹{salesHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Sales Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="text-xs text-green-600">Total Quantity Sold</div>
                    <div className="text-lg font-semibold text-green-800 mt-1">
                      {salesHistory.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="text-xs text-blue-600">Total Revenue</div>
                    <div className="text-lg font-semibold text-blue-800 mt-1">
                      ₹{salesHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                    <div className="text-xs text-purple-600">Average Order Size</div>
                    <div className="text-lg font-semibold text-purple-800 mt-1">
                      {(salesHistory.reduce((sum, item) => sum + item.quantity, 0) / salesHistory.length).toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                    <div className="text-xs text-orange-600">Profit from Sales</div>
                    <div className="text-lg font-semibold text-orange-800 mt-1">
                      ₹{(salesHistory.reduce((sum, item) => sum + item.amount, 0) - (salesHistory.reduce((sum, item) => sum + item.quantity, 0) * stockItem.totalCost)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}