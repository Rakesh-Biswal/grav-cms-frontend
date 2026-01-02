// /project-manager/dashboard/inventory/products/raw-items/add-stock/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  ArrowLeft,
  Package,
  Tag,
  Layers,
  ShoppingCart,
  Building,
  FileText,
  Receipt,
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AddStockPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [item, setItem] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [allVendors, setAllVendors] = useState([])
  
  const [formData, setFormData] = useState({
    quantity: "",
    supplier: "",
    newSupplier: "",
    unitPrice: "",
    purchaseOrder: "",
    invoiceNumber: "",
    reason: "Purchase Order",
    notes: "",
    addToVendorList: false
  })
  
  const [errors, setErrors] = useState({})

  // Fetch item and supplier data
  useEffect(() => {
    if (params.id) {
      fetchItemData()
      fetchSuppliers()
    }
  }, [params.id])

  const fetchItemData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setItem(result.rawItem)
        
        // Pre-fill unit price with lowest cost
        if (result.rawItem.vendorCosts && result.rawItem.vendorCosts.length > 0) {
          const lowestCost = Math.min(...result.rawItem.vendorCosts.map(vc => vc.cost))
          setFormData(prev => ({ ...prev, unitPrice: lowestCost.toString() }))
        }
      } else {
        toast.error(result.message || "Failed to fetch item data")
        router.push("/project-manager/dashboard/inventory/products/raw-items")
      }
    } catch (error) {
      console.error("Error fetching item:", error)
      toast.error("Failed to fetch item data")
      router.push("/project-manager/dashboard/inventory/products/raw-items")
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}/suppliers`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuppliers(result.suppliers)
        setAllVendors(result.allVendors)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Valid quantity is required"
    }
    
    if (!formData.supplier && !formData.newSupplier) {
      newErrors.supplier = "Supplier is required"
    }
    
    if (!formData.unitPrice || isNaN(formData.unitPrice) || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = "Valid unit price is required"
    }
    
    if (!formData.reason || !formData.reason.trim()) {
      newErrors.reason = "Reason is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const submitData = {
        quantity: parseFloat(formData.quantity),
        supplier: formData.supplier || formData.newSupplier,
        unitPrice: parseFloat(formData.unitPrice),
        purchaseOrder: formData.purchaseOrder || "",
        invoiceNumber: formData.invoiceNumber || "",
        reason: formData.reason,
        notes: formData.notes || ""
      }
      
      const response = await fetch(`${API_URL}/api/cms/raw-items/${params.id}/add-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(submitData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`Stock added successfully! New quantity: ${result.rawItem.quantity}`)
        
        // Redirect back to view page
        router.push(`/project-manager/dashboard/inventory/products/raw-items/raw-items-view/${params.id}`)
      } else {
        toast.error(result.message || "Failed to add stock")
      }
    } catch (error) {
      console.error("Error adding stock:", error)
      toast.error("Failed to add stock")
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAdd = (quantity) => {
    setFormData(prev => ({
      ...prev,
      quantity: (parseInt(prev.quantity) || 0) + quantity
    }))
  }

  const getUnit = () => {
    return item?.customUnit || item?.unit || "unit"
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading item data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div>
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/project-manager/dashboard/inventory/products/raw-items/raw-items-view/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {item?.name}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Add Stock to Raw Material</h1>
          <p className="text-gray-600 mt-1">Add new stock to inventory with supplier details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item?.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Current Stock: <span className="font-semibold">{item?.quantity} {getUnit()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        SKU: <span className="font-mono">{item?.sku}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Stock Quantity
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity to Add *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.quantity ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={`Enter quantity in ${getUnit()}`}
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(10)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(50)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(100)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                          >
                            +100
                          </button>
                        </div>
                      </div>
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">Stock Projection</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Current Stock</div>
                          <div className="text-lg font-bold text-gray-900">
                            {item?.quantity} {getUnit()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">After Addition</div>
                          <div className="text-lg font-bold text-green-700">
                            {(item?.quantity || 0) + (parseFloat(formData.quantity) || 0)} {getUnit()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplier Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Supplier Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Supplier Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Supplier *
                      </label>
                      {suppliers.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {suppliers.map((supplier, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setFormData(prev => ({ 
                                  ...prev, 
                                  supplier,
                                  newSupplier: "" 
                                }))}
                                className={`p-3 text-left border rounded-md transition-colors ${
                                  formData.supplier === supplier
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-gray-500" />
                                  <div className="font-medium text-gray-900">{supplier}</div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Existing supplier for this item
                                </div>
                              </button>
                            ))}
                          </div>
                          
                          <div className="text-center">
                            <span className="text-sm text-gray-600">OR</span>
                          </div>
                        </div>
                      ) : null}
                      
                      {/* New Supplier Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {suppliers.length > 0 ? "Add New Supplier" : "Enter Supplier Name *"}
                        </label>
                        <input
                          type="text"
                          name="newSupplier"
                          value={formData.newSupplier}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.supplier && !formData.supplier && !formData.newSupplier 
                              ? "border-red-500" 
                              : "border-gray-300"
                          }`}
                          placeholder="Enter supplier name"
                        />
                      </div>
                      
                      {errors.supplier && (
                        <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (₹) *
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="unitPrice"
                          value={formData.unitPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.unitPrice ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter price per unit"
                        />
                      </div>
                      {errors.unitPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
                      )}
                    </div>

                    {/* Cost Calculation */}
                    {formData.quantity && formData.unitPrice && (
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <div className="text-sm font-medium text-green-800 mb-2">Cost Calculation</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600">Unit Price</div>
                            <div className="text-lg font-bold text-green-700">
                              ₹{parseFloat(formData.unitPrice).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Total Cost</div>
                            <div className="text-lg font-bold text-green-700">
                              ₹{(parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Order Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Order #
                      </label>
                      <input
                        type="text"
                        name="purchaseOrder"
                        value={formData.purchaseOrder}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., PO-2024-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., INV-2024-001"
                      />
                    </div>
                  </div>
                </div>

                {/* Reason & Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Additional Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Addition *
                      </label>
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.reason ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="Purchase Order">Purchase Order</option>
                        <option value="Return from Production">Return from Production</option>
                        <option value="Stock Transfer">Stock Transfer</option>
                        <option value="Initial Stock">Initial Stock</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.reason && (
                        <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes about this stock addition..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Link
                    href={`/project-manager/dashboard/inventory/products/raw-items/raw-items-view/${params.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Stock...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Stock to Inventory
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Current Stock Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Status</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {item?.quantity} {getUnit()}
                  </div>
                  <div className="text-sm text-gray-600">Currently in stock</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{ 
                      width: `${Math.min((item?.quantity / item?.maxStock) * 100, 100)}%` 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Min: {item?.minStock}</span>
                  <span>Max: {item?.maxStock}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Stock Levels</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Minimum Required:</span>
                      <span className="text-sm font-medium">{item?.minStock} {getUnit()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maximum Capacity:</span>
                      <span className="text-sm font-medium">{item?.maxStock} {getUnit()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining Capacity:</span>
                      <span className="text-sm font-medium text-green-600">
                        {Math.max(0, (item?.maxStock || 0) - (item?.quantity || 0))} {getUnit()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Vendors */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Vendors</h3>
              
              <div className="space-y-2">
                {allVendors.slice(0, 5).map((vendor) => (
                  <div 
                    key={vendor.id}
                    className="p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        newSupplier: vendor.name,
                        supplier: ""
                      }))
                    }}
                  >
                    <div className="font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-xs text-gray-600">{vendor.type}</div>
                  </div>
                ))}
                
                {allVendors.length > 5 && (
                  <div className="text-center pt-2">
                    <div className="text-sm text-gray-600">
                      +{allVendors.length - 5} more vendors available
                    </div>
                    <Link
                      href="/project-manager/dashboard/history-report/vendor"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View all vendors →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Important Notes
              </h3>
              
              <div className="space-y-3 text-sm text-yellow-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Stock addition will update the main inventory quantity</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Transaction will be recorded in stock history</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>New suppliers will be added to vendor list</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Stock status (In Stock/Low Stock/Out of Stock) will auto-update</span>
                </div>
              </div>
            </div>

            {/* Recent Suppliers for this Item */}
            {suppliers.length > 0 && (
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Recent Suppliers</h3>
                
                <div className="space-y-2">
                  {suppliers.slice(0, 3).map((supplier, index) => {
                    const vendor = item?.vendorCosts?.find(vc => vc.supplier === supplier)
                    return (
                      <div key={index} className="p-2 hover:bg-purple-100 rounded-md">
                        <div className="font-medium text-purple-900">{supplier}</div>
                        {vendor && (
                          <div className="text-xs text-purple-700">
                            Last Price: ₹{vendor.cost} • Stock: {vendor.quantity} {getUnit()}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}