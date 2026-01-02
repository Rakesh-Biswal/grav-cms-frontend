// /project-manager/dashboard/inventory/products/raw-items/raw-items-view/[id]/page.js

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import {
  ArrowLeft,
  Package,
  Tag,
  Layers,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Edit,
  Hash,
  Building,
  QrCode,
  Plus,
  Minus,
  History,
  TrendingUp,
  TrendingDown,
  Users,
  Percent,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Trash2,
  FileText,
  Truck,
  ExternalLink
} from "lucide-react"
import QRCode from "qrcode"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RawItemViewPage() {
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [stockHistory, setStockHistory] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [expandedVendor, setExpandedVendor] = useState(null)
  const [expandedDiscount, setExpandedDiscount] = useState(null)
  const qrCanvasRef = useRef(null)

  // Fetch raw item data from backend
  const fetchRawItemData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}`, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setItem(result.rawItem)
        fetchStockTransactions()
        fetchPurchaseOrders()
      } else {
        toast.error(result.message || "Failed to fetch raw item data")
        router.push("/project-manager/dashboard/inventory/products/raw-items")
      }
    } catch (error) {
      console.error("Error fetching raw item:", error)
      toast.error("Failed to fetch raw item data")
      router.push("/project-manager/dashboard/inventory/products/raw-items")
    } finally {
      setLoading(false)
    }
  }

  // Fetch stock transactions history
  const fetchStockTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}/transactions`, {
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        setStockHistory(result.transactions || [])
      }
    } catch (error) {
      console.error("Error fetching stock transactions:", error)
    }
  }

  // Fetch purchase orders for this raw item
  // Fetch purchase orders for this raw item
  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}/purchase-orders`, {
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        setPurchaseOrders(result.purchaseOrders || []);
        // You can also save stats if needed
        console.log("Purchase order stats:", result.stats);
      } else {
        console.error("Error fetching purchase orders:", result.message);
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setPurchaseOrders([]);
    }
  };


  useEffect(() => {
    if (params.id) {
      fetchRawItemData()
    }
  }, [params.id])

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800"
      case "Low Stock": return "bg-yellow-100 text-yellow-800"
      case "Out of Stock": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStockPercentage = (item) => {
    if (!item) return 0
    const percentage = (item.quantity / item.maxStock) * 100
    if (percentage > 100) return 100
    if (percentage < 0) return 0
    return percentage
  }

  const getStockColor = (item) => {
    const percentage = getStockPercentage(item)
    if (percentage < 25) return "bg-red-500"
    if (percentage < 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Get recent vendor cost from transactions
  const getRecentVendorCost = () => {
    if (!stockHistory || stockHistory.length === 0) return 0

    const recentTransaction = stockHistory
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

    return recentTransaction?.unitPrice || 0
  }

  // Get average vendor cost from transactions
  const getAverageVendorCost = () => {
    if (!stockHistory || stockHistory.length === 0) return 0

    const purchaseTransactions = stockHistory
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")

    if (purchaseTransactions.length === 0) return 0

    const total = purchaseTransactions.reduce((sum, tx) => sum + (tx.unitPrice || 0), 0)
    return total / purchaseTransactions.length
  }


  // Get unique vendors from transactions
  const getVendorsFromTransactions = () => {
    if (!stockHistory || stockHistory.length === 0) return []

    const vendorMap = new Map()

    stockHistory
      .filter(tx => tx.type === "ADD" || tx.type === "PURCHASE_ORDER")
      .forEach(tx => {
        if (tx.supplier && tx.supplier.trim()) {
          if (!vendorMap.has(tx.supplier)) {
            vendorMap.set(tx.supplier, {
              name: tx.supplier,
              lastPurchaseDate: tx.createdAt,
              lastCost: tx.unitPrice || 0,
              totalPurchased: 0,
              purchaseCount: 0
            })
          }

          const vendor = vendorMap.get(tx.supplier)
          vendor.purchaseCount += 1
          // For now, we can't easily get quantity from transactions without additional data
          // We'll need to enhance the transaction schema to include quantity for this calculation
        }
      })

    return Array.from(vendorMap.values())
      .sort((a, b) => new Date(b.lastPurchaseDate) - new Date(a.lastPurchaseDate))
  }

  const getDiscountPercentage = (item, discountPrice) => {
    if (!item || !item.sellingPrice || item.sellingPrice <= 0) return 0
    const discount = item.sellingPrice - discountPrice
    return Math.round((discount / item.sellingPrice) * 100)
  }

  const handleGenerateQR = async () => {
    if (!item) return

    try {
      setGeneratingQR(true)

      // Get current URL
      const currentUrl = window.location.href

      // Create a canvas element for QR code
      const canvas = qrCanvasRef.current

      // Generate QR code
      await QRCode.toCanvas(canvas, currentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Convert canvas to data URL and trigger download
      const pngUrl = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${item.sku}_QR_Code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      toast.success(`QR Code for ${item.name} downloaded successfully!`)

    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code. Please try again.")
    } finally {
      setGeneratingQR(false)
    }
  }

  const calculateInventoryValue = (item) => {
    if (!item) return 0
    const avgCost = getAverageVendorCost() > 0 ? getAverageVendorCost() : getRecentVendorCost()
    return item.quantity * avgCost
  }

  const calculatePotentialRevenue = (item) => {
    if (!item || !item.sellingPrice) return 0
    return item.quantity * item.sellingPrice
  }

  const handleDeleteItem = async () => {
    if (!confirm("Are you sure you want to delete this raw material? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/cms/raw-items/${item._id}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Raw item deleted successfully")
        router.push("/project-manager/dashboard/inventory/products/raw-items")
      } else {
        toast.error(result.message || "Failed to delete raw item")
      }
    } catch (error) {
      console.error("Error deleting raw item:", error)
      toast.error("Failed to delete raw item")
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const formatDate = (dateString) => {
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

  const getUnit = (item) => {
    return item?.customUnit || item?.unit || "unit"
  }

  const getCategory = (item) => {
    return item?.customCategory || item?.category || "Uncategorized"
  }

  // Get total quantity from purchase orders
  const getTotalOrderedQuantity = () => {
    return purchaseOrders.reduce((sum, po) => sum + (po.itemDetails?.quantity || 0), 0)
  }

  // Get total delivered quantity
  const getTotalDeliveredQuantity = () => {
    return purchaseOrders.reduce((sum, po) => sum + (po.itemDetails?.receivedQuantity || 0), 0)
  }

  // Get pending delivery quantity
  const getPendingDeliveryQuantity = () => {
    return purchaseOrders.reduce((sum, po) => sum + (po.itemDetails?.pendingQuantity || 0), 0)
  }

  // Get purchase orders by status
  const getActivePurchaseOrders = () => {
    return purchaseOrders.filter(po =>
      po.status === "ISSUED" || po.status === "PARTIALLY_RECEIVED"
    )
  }

  const handleAddStock = () => {
    // This will be implemented in a separate page
    router.push(`/project-manager/dashboard/inventory/products/raw-items/add-stock/${item._id}`)
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading raw material details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Raw Item Not Found</h3>
                <div className="mt-1 text-sm text-red-700">
                  The requested raw material could not be found.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/project-manager/dashboard/inventory/products/raw-items"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Raw Materials
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const vendors = getVendorsFromTransactions()
  const recentCost = getRecentVendorCost()
  const avgCost = getAverageVendorCost()
  const inventoryValue = calculateInventoryValue(item)
  const potentialRevenue = calculatePotentialRevenue(item)
  const totalOrderedQty = getTotalOrderedQuantity()
  const totalDeliveredQty = getTotalDeliveredQuantity()
  const pendingDeliveryQty = getPendingDeliveryQuantity()
  const activePOs = getActivePurchaseOrders()

  return (
    <DashboardLayout activeMenu="inventory">
      {/* Hidden canvas for QR code generation */}
      <canvas ref={qrCanvasRef} style={{ display: 'none' }} />

      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Raw Material Details</h1>
              <p className="text-gray-600 mt-1">Complete view and management of raw material inventory</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchRawItemData}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              href={`/project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item/${item._id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Item
            </Link>
            <button
              onClick={handleGenerateQR}
              disabled={generatingQR}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingQR ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Get QR
                </>
              )}
            </button>

            <button
              onClick={handleDeleteItem}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Item Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Item Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{item.name}</div>
                      <div className="text-gray-600 mt-1 font-mono flex items-center gap-2">
                        {item.sku}
                        <button
                          onClick={() => copyToClipboard(item.sku)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy SKU"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        {vendors.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            <Users className="w-3 h-3" />
                            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {purchaseOrders.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            <FileText className="w-3 h-3" />
                            {purchaseOrders.length} PO{purchaseOrders.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Current Stock</div>
                    <div className="text-xl font-bold text-gray-900">
                      {item.quantity.toLocaleString()} {getUnit(item)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Inventory Value</div>
                    <div className="text-lg font-bold text-green-700">
                      ₹{inventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                  {item.sellingPrice && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Potential Revenue</div>
                      <div className="text-lg font-bold text-blue-700">
                        ₹{potentialRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Stock Level</span>
                  <span>{getStockPercentage(item).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getStockColor(item)}`}
                    style={{ width: `${getStockPercentage(item)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Min: {item.minStock} {getUnit(item)}</span>
                  <span>Current: {item.quantity} {getUnit(item)}</span>
                  <span>Max: {item.maxStock} {getUnit(item)}</span>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Category</div>
                    <div className="text-base font-medium text-gray-900">{getCategory(item)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Unit of Measurement</div>
                    <div className="text-base font-medium text-gray-900">{getUnit(item)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Cost Information</div>
                    {recentCost > 0 ? (
                      <>
                        <div className="text-base font-bold text-green-700">
                          Recent: ₹{recentCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {getUnit(item)}
                        </div>
                        {avgCost > 0 && recentCost !== avgCost && (
                          <div className="text-sm text-gray-600 mt-1">
                            Average: ₹{avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {getUnit(item)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-base text-gray-500">No purchase history</div>
                    )}
                  </div>

                  {item.sellingPrice && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Selling Price per Unit</div>
                      <div className="text-base font-bold text-blue-700">
                        ₹{item.sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {getUnit(item)}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Created</div>
                    <div className="text-base text-gray-900">{formatDate(item.createdAt)}</div>
                    <div className="text-xs text-gray-500">
                      By: {item.createdBy?.name || "System"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Description</div>
                    <div className="text-base text-gray-900">{item.description || "No description provided"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Minimum Stock</div>
                    <div className="text-base font-medium text-gray-900">{item.minStock} {getUnit(item)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Maximum Stock</div>
                    <div className="text-base text-gray-900">{item.maxStock} {getUnit(item)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                    <div className="text-base text-gray-900">{formatDate(item.updatedAt)}</div>
                    <div className="text-xs text-gray-500">
                      By: {item.updatedBy?.name || item.createdBy?.name || "System"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Orders Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Orders
              </h3>

              {purchaseOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-1">Total Ordered</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {totalOrderedQty.toLocaleString()} {getUnit(item)}
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        Across {purchaseOrders.length} purchase orders
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 mb-1">Delivered</div>
                      <div className="text-2xl font-bold text-green-900">
                        {totalDeliveredQty.toLocaleString()} {getUnit(item)}
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        {totalOrderedQty > 0 ?
                          Math.round((totalDeliveredQty / totalOrderedQty) * 100) : 0}% delivered
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm font-medium text-amber-800 mb-1">Pending Delivery</div>
                      <div className="text-2xl font-bold text-amber-900">
                        {pendingDeliveryQty.toLocaleString()} {getUnit(item)}
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        {activePOs.length} active purchase orders
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {purchaseOrders.slice(0, 3).map((po) => (
                      <div key={po._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{po.poNumber}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Vendor: {po.vendorName || po.vendorCompany}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Order: {formatDate(po.orderDate)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {po.itemDetails?.pendingQuantity || 0} {getUnit(item)} pending
                            </div>
                            <div className="text-sm text-gray-600">
                              Status: {po.status ? po.status.replace("_", " ") : "Unknown"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Ordered: {po.itemDetails?.quantity || 0} •
                              Received: {po.itemDetails?.receivedQuantity || 0}
                            </span>
                            <Link
                              href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}`}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              View PO <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activePOs.length > 3 && (
                      <div className="text-center py-2">
                        <Link
                          href={`/project-manager/dashboard/inventory/operations/purchase-order?search=${item.sku}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View all {purchaseOrders.length} purchase orders
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No purchase orders found for this item</div>
                  <Link
                    href="/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Create Purchase Order
                  </Link>
                </div>
              )}
            </div>

            {/* Vendor Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Vendor Information
              </h3>

              {vendors.length > 0 ? (
                <div className="space-y-4">
                  {vendors.slice(0, 3).map((vendor, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{vendor.name}</div>
                            <div className="text-sm text-gray-600">
                              Last purchase: {vendor.lastPurchaseDate ? formatDate(vendor.lastPurchaseDate) : "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{vendor.lastCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-600">
                            Recent price per unit
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>Purchases: {vendor.purchaseCount}</span>
                          {item.primaryVendor && index === 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Primary Vendor
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {vendors.length > 3 && (
                    <div className="text-center py-2">
                      <button
                        onClick={() => {/* Show all vendors modal */ }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View all {vendors.length} vendors
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Primary Vendor</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {vendors[0]?.name || "Not assigned"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Average Cost</div>
                        <div className="text-lg font-semibold text-green-700">
                          ₹{avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {getUnit(item)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No vendor purchases recorded yet</div>
                  <p className="text-sm text-gray-600">
                    Vendors will appear here once you receive stock from purchase orders
                  </p>
                </div>
              )}
            </div>

            {/* Bulk Discounts Card */}
            {item.discounts && item.discounts.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Bulk Discounts
                </h3>

                <div className="space-y-3">
                  {item.discounts
                    .sort((a, b) => a.minQuantity - b.minQuantity)
                    .map((discount, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={() => setExpandedDiscount(expandedDiscount === index ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Tag className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                Order {discount.minQuantity.toLocaleString()}+ {getUnit(item)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Discount: {getDiscountPercentage(item, discount.price)}% off
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-700">
                                ₹{discount.price.toLocaleString('en-IN')} / {getUnit(item)}
                              </div>
                              {item.sellingPrice && (
                                <div className="text-sm text-gray-600 line-through">
                                  Regular: ₹{item.sellingPrice.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                            {expandedDiscount === index ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {expandedDiscount === index && item.sellingPrice && (
                          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Discount Details</div>
                                <div className="text-sm text-gray-600">
                                  <div>Minimum Quantity: {discount.minQuantity.toLocaleString()} {getUnit(item)}</div>
                                  <div>Discount Price: ₹{discount.price.toLocaleString('en-IN')} / {getUnit(item)}</div>
                                  <div>Discount: {getDiscountPercentage(item, discount.price)}% off regular price</div>
                                  <div>Savings: ₹{(item.sellingPrice - discount.price).toFixed(2)} per unit</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Example Order</div>
                                <div className="text-sm text-gray-600">
                                  <div>Order {discount.minQuantity} {getUnit(item)}:</div>
                                  <div>Total: ₹{(discount.minQuantity * discount.price).toLocaleString('en-IN')}</div>
                                  <div>Savings: ₹{(discount.minQuantity * (item.sellingPrice - discount.price)).toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Statistics</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Inventory Value</div>
                    <div className="text-xl font-bold text-green-700">
                      ₹{inventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Coverage</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.floor(item.quantity / (item.minStock || 1))}x
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reorder Point</span>
                    <span className={`text-sm font-medium ${item.quantity <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>
                      {item.quantity <= item.minStock ? 'Below Minimum' : 'Above Minimum'}
                    </span>
                  </div>

                  {item.sellingPrice && recentCost > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className="text-sm font-bold text-blue-600">
                        {recentCost > 0 && item.sellingPrice > recentCost
                          ? `${Math.round(((item.sellingPrice - recentCost) / recentCost) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Order Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Purchase Actions
              </h3>

              <div className="space-y-3">
                <Link
                  href="/project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Create New PO
                </Link>

                

                {activePOs.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">Active POs</div>
                    <div className="space-y-2">
                      {activePOs.slice(0, 2).map(po => (
                        <Link
                          key={po._id}
                          href={`/project-manager/dashboard/inventory/operations/purchase-order/${po._id}`}
                          className="block p-2 border border-gray-200 rounded hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-900">{po.poNumber}</div>
                          <div className="text-xs text-gray-600">
                            {po.itemDetails?.pendingQuantity || 0} pending • {formatDate(po.orderDate)}
                          </div>
                        </Link>
                      ))}
                      {activePOs.length > 2 && (
                        <Link
                          href={`/project-manager/dashboard/inventory/operations/purchase-order?search=${item.sku}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all {activePOs.length} active POs →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Info Card */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Information
              </h3>

              <div className="space-y-3">
                <div className="text-sm text-green-700">
                  Scan this QR code to access this raw material's details instantly.
                </div>

                <div className="text-sm">
                  <div className="font-medium text-green-900 mb-1">Usage:</div>
                  <ul className="list-disc pl-4 space-y-1 text-green-700">
                    <li>Attach to storage bins</li>
                    <li>Quick access during inventory checks</li>
                    <li>Easy tracking in warehouse</li>
                    <li>Production floor scanning</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-green-600 font-medium">Current URL:</div>
                  <div className="text-xs text-green-800 truncate">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Created On</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(item.createdAt)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(item.updatedAt)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">SKU Code</div>
                  <div className="text-sm font-medium text-gray-900 font-mono">{item.sku}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Stock Transaction History
            </h3>
            <div className="text-sm text-gray-500">
              Total Transactions: {stockHistory.length}
            </div>
          </div>

          <div className="space-y-4">
            {stockHistory.length > 0 ? (
              stockHistory.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "ADD" || transaction.type === "PURCHASE_ORDER"
                        ? "bg-green-100 text-green-600"
                        : transaction.type === "CONSUME"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                      {transaction.type === "ADD" || transaction.type === "PURCHASE_ORDER" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : transaction.type === "CONSUME" ? (
                        <Package className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.reason || `${transaction.type} Transaction`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)} •
                        {transaction.performedBy?.name ? ` By ${transaction.performedBy.name}` : ''}
                      </div>
                      {transaction.supplier && transaction.supplier !== "Mixed" && (
                        <div className="flex items-center gap-1 text-xs text-purple-700 mt-1">
                          <Building className="w-3 h-3" />
                          {transaction.supplier}
                        </div>
                      )}
                      {transaction.notes && (
                        <div className="text-xs text-gray-600 mt-1">{transaction.notes}</div>
                      )}
                      {transaction.purchaseOrder && (
                        <div className="text-xs text-blue-600 mt-1">
                          PO: {transaction.purchaseOrder}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${transaction.type === "ADD" || transaction.type === "PURCHASE_ORDER"
                        ? "text-green-600"
                        : transaction.type === "CONSUME"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}>
                      {transaction.type === "ADD" || transaction.type === "PURCHASE_ORDER" ? "+" : "-"}
                      {transaction.quantity} {getUnit(item)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.previousQuantity} → {transaction.newQuantity}
                    </div>
                    {transaction.unitPrice && (
                      <div className="text-xs text-gray-600 mt-1">
                        @ ₹{transaction.unitPrice}/{getUnit(item)}
                      </div>
                    )}
                    <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${transaction.type === "ADD" || transaction.type === "PURCHASE_ORDER"
                        ? "bg-green-100 text-green-800"
                        : transaction.type === "CONSUME"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {transaction.type.replace("_", " ")}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No stock transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {item.notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Additional Notes
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-700 whitespace-pre-line">{item.notes}</div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Need to make changes?</h4>
              <p className="text-sm text-gray-500 mt-1">Edit this raw material or manage stock.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/project-manager/dashboard/inventory/products/raw-items"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to List
              </Link>
              <Link
                href={`/project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item/${item._id}`}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Edit Material
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}