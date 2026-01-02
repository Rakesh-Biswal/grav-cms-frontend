// /project-manager/dashboard/inventory/operations/purchase-order/[id]/receive/page.js

"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  Package,
  Truck,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Save
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ReceiveDeliveryPage() {
  const router = useRouter()
  const params = useParams()
  const poId = params?.id
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    invoiceNumber: "",
    notes: "",
    items: []
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (poId) {
      fetchPurchaseOrderData()
    }
  }, [poId])

  const fetchPurchaseOrderData = async () => {
    try {
      setFetching(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const po = result.purchaseOrder
        setPurchaseOrder(po)
        
        // Initialize form items with pending quantities
        const items = po.items.map(item => ({
          itemId: item._id,
          itemName: item.itemName,
          sku: item.sku,
          unit: item.unit,
          orderedQuantity: item.quantity,
          receivedSoFar: item.receivedQuantity || 0,
          pendingQuantity: item.pendingQuantity || item.quantity,
          quantity: "",
          unitPrice: item.unitPrice
        }))
        
        setFormData(prev => ({
          ...prev,
          items
        }))
      } else {
        toast.error(result.message || "Failed to fetch purchase order")
        router.push("/project-manager/dashboard/inventory/operations/purchase-order")
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error)
      toast.error("Failed to fetch purchase order")
      router.push("/project-manager/dashboard/inventory/operations/purchase-order")
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    // Validate quantity
    if (field === "quantity") {
      const pendingQty = newItems[index].pendingQuantity
      const enteredQty = parseFloat(value) || 0
      
      if (enteredQty > pendingQty) {
        newItems[index].quantity = pendingQty.toString()
      }
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    let hasReceipts = false
    
    formData.items.forEach((item, index) => {
      const qty = parseFloat(item.quantity) || 0
      if (qty > 0) {
        hasReceipts = true
      }
      if (qty > item.pendingQuantity) {
        newErrors[`item_${index}_quantity`] = `Cannot exceed ${item.pendingQuantity} pending units`
      }
    })
    
    if (!hasReceipts) {
      newErrors.general = "Please enter quantity for at least one item"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    setLoading(true)
    
    try {
      // Filter items that have quantity > 0
      const itemsToReceive = formData.items
        .filter(item => parseFloat(item.quantity) > 0)
        .map(item => ({
          itemId: item.itemId,
          quantity: parseFloat(item.quantity)
        }))
      
      const submitData = {
        deliveryDate: formData.deliveryDate,
        items: itemsToReceive,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes
      }
      
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(submitData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Delivery received successfully!")
        router.push(`/project-manager/dashboard/inventory/operations/purchase-order/${poId}`)
      } else {
        toast.error(result.message || "Failed to receive delivery")
      }
    } catch (error) {
      console.error("Error receiving delivery:", error)
      toast.error("Failed to receive delivery")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalReceived = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)
  }

  const calculateTotalValue = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      return sum + (qty * item.unitPrice)
    }, 0)
  }

  if (fetching) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading purchase order data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!purchaseOrder) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Purchase Order Not Found</h2>
          <p className="mt-2 text-gray-600">The requested purchase order could not be found.</p>
          <Link
            href="/project-manager/dashboard/inventory/operations/purchase-order"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Orders
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href={`/project-manager/dashboard/inventory/operations/purchase-order/${poId}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Purchase Order
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Receive Delivery</h1>
            <p className="text-gray-600 mt-1">
              Record received items against purchase order {purchaseOrder.poNumber}
            </p>
            <div className="mt-2">
              <span className="px-2 py-1 text-sm font-mono bg-blue-100 text-blue-800 rounded-md">
                PO: {purchaseOrder.poNumber}
              </span>
              <span className="ml-2 px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-md">
                Vendor: {purchaseOrder.vendorName || purchaseOrder.vendor?.companyName}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Invoice number if available"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes about this delivery..."
                />
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Received Items
            </h2>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </p>
              </div>
            )}
            
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.sku} • {item.unit}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{item.orderedQuantity}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-green-600">{item.receivedSoFar}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-amber-600">{item.pendingQuantity}</div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="0"
                          max={item.pendingQuantity}
                          step="0.01"
                          className={`w-24 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`item_${index}_quantity`] ? "border-red-500" : "border-gray-300"}`}
                          placeholder="0"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{((parseFloat(item.quantity) || 0) * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-medium">{calculateTotalReceived()} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">₹{calculateTotalValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>This Delivery</span>
                      <span className="text-green-600">{calculateTotalReceived()} units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href={`/project-manager/dashboard/inventory/operations/purchase-order/${poId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchPurchaseOrderData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Receive Delivery
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}