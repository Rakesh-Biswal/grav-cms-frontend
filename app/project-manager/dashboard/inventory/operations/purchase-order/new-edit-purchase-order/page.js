// /project-manager/dashboard/inventory/operations/purchase-order/new-edit-purchase-order/page.js

"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Package,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Percent,
  Truck,
  Tag,
  AlertCircle,
  RefreshCw,
  Save,
  Send,
  Download,
  Printer,
  Eye
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function NewEditReceiptPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const poId = params?.id
  const isEditMode = !!poId
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [rawItems, setRawItems] = useState([])
  const [vendors, setVendors] = useState([])
  const [searchRawItem, setSearchRawItem] = useState("")
  const [searchVendor, setSearchVendor] = useState("")
  const [showItemSearch, setShowItemSearch] = useState(false)
  
  const [formData, setFormData] = useState({
    // Basic Information
    poNumber: "",
    vendor: "",
    vendorName: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    
    // Items
    items: [{
      rawItem: "",
      itemName: "",
      sku: "",
      unit: "",
      quantity: "",
      unitPrice: "",
      totalPrice: 0
    }],
    
    // Pricing
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    shippingCharges: 0,
    discount: 0,
    totalAmount: 0,
    
    // Additional Info
    notes: "",
    termsConditions: "",
    paymentTerms: "",
    
    // Status
    status: "DRAFT"
  })
  
  const [errors, setErrors] = useState({})
  const [filteredItems, setFilteredItems] = useState([])

  // Fetch data on component mount
  useEffect(() => {
    fetchRawItems()
    fetchVendors()
    
    if (isEditMode && poId) {
      fetchPurchaseOrderData()
    }
  }, [isEditMode, poId])

  // Filter items based on search
  useEffect(() => {
    if (searchRawItem) {
      const filtered = rawItems.filter(item =>
        item.name.toLowerCase().includes(searchRawItem.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchRawItem.toLowerCase()) ||
        item.category.toLowerCase().includes(searchRawItem.toLowerCase())
      )
      setFilteredItems(filtered.slice(0, 10))
    } else {
      setFilteredItems([])
    }
  }, [searchRawItem, rawItems])

  const fetchRawItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/data/raw-items`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRawItems(result.rawItems)
      }
    } catch (error) {
      console.error("Error fetching raw items:", error)
      toast.error("Failed to fetch raw items")
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/data/vendors`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setVendors(result.vendors)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast.error("Failed to fetch vendors")
    }
  }

  const fetchPurchaseOrderData = async () => {
    try {
      setFetching(true)
      const response = await fetch(`${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const po = result.purchaseOrder
        
        setFormData({
          poNumber: po.poNumber || "",
          vendor: po.vendor?._id || po.vendor || "",
          vendorName: po.vendorName || po.vendor?.companyName || "",
          orderDate: po.orderDate ? new Date(po.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString().split('T')[0] : "",
          items: po.items.map(item => ({
            rawItem: item.rawItem?._id || item.rawItem || "",
            itemName: item.itemName || "",
            sku: item.sku || "",
            unit: item.unit || "",
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice || 0
          })),
          subtotal: po.subtotal || 0,
          taxRate: po.taxRate || 0,
          taxAmount: po.taxAmount || 0,
          shippingCharges: po.shippingCharges || 0,
          discount: po.discount || 0,
          totalAmount: po.totalAmount || 0,
          notes: po.notes || "",
          termsConditions: po.termsConditions || "",
          paymentTerms: po.paymentTerms || "",
          status: po.status || "DRAFT"
        })
      } else {
        toast.error(result.message || "Failed to fetch purchase order data")
        router.push("/project-manager/dashboard/inventory/operations/purchase-order")
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error)
      toast.error("Failed to fetch purchase order data")
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
    
    // Recalculate totals when pricing fields change
    if (['taxRate', 'shippingCharges', 'discount'].includes(name)) {
      setTimeout(() => calculateTotals(), 0)
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleVendorChange = (e) => {
    const vendorId = e.target.value
    const selectedVendor = vendors.find(v => v.id === vendorId)
    
    setFormData(prev => ({
      ...prev,
      vendor: vendorId,
      vendorName: selectedVendor?.name || "",
      paymentTerms: selectedVendor?.paymentTerms || prev.paymentTerms
    }))
  }

  // Item Management
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        rawItem: "",
        itemName: "",
        sku: "",
        unit: "",
        quantity: "",
        unitPrice: "",
        totalPrice: 0
      }]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        items: newItems
      }))
      calculateTotals()
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    // If raw item is selected, populate item details
    if (field === "rawItem" && value) {
      const selectedItem = rawItems.find(item => item.id === value)
      if (selectedItem) {
        newItems[index].itemName = selectedItem.name
        newItems[index].sku = selectedItem.sku
        newItems[index].unit = selectedItem.unit
        // Suggest unit price based on selling price or recent purchases
        newItems[index].unitPrice = selectedItem.sellingPrice ? (selectedItem.sellingPrice * 0.8).toFixed(2) : ""
      }
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
    
    // Calculate item total
    if (field === "quantity" || field === "unitPrice") {
      setTimeout(() => calculateItemTotal(index), 0)
    }
  }

  const calculateItemTotal = (index) => {
    const newItems = [...formData.items]
    const quantity = parseFloat(newItems[index].quantity) || 0
    const unitPrice = parseFloat(newItems[index].unitPrice) || 0
    newItems[index].totalPrice = quantity * unitPrice
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
    
    calculateTotals()
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    const taxRate = parseFloat(formData.taxRate) || 0
    const taxAmount = (subtotal * taxRate) / 100
    const shippingCharges = parseFloat(formData.shippingCharges) || 0
    const discount = parseFloat(formData.discount) || 0
    const totalAmount = subtotal + taxAmount + shippingCharges - discount
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.vendor) {
      newErrors.vendor = "Vendor is required"
    }
    
    if (!formData.orderDate) {
      newErrors.orderDate = "Order date is required"
    }
    
    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.rawItem) {
        newErrors[`item_${index}_rawItem`] = "Item is required"
      }
      if (!item.quantity || isNaN(item.quantity) || parseFloat(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = "Valid quantity is required"
      }
      if (!item.unitPrice || isNaN(item.unitPrice) || parseFloat(item.unitPrice) <= 0) {
        newErrors[`item_${index}_unitPrice`] = "Valid unit price is required"
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e, status = "DRAFT") => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    setLoading(true)
    
    try {
      const submitData = {
        vendor: formData.vendor,
        vendorName: formData.vendorName,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        items: formData.items.map(item => ({
          rawItem: item.rawItem,
          itemName: item.itemName,
          sku: item.sku,
          unit: item.unit,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        })),
        taxRate: parseFloat(formData.taxRate) || 0,
        shippingCharges: parseFloat(formData.shippingCharges) || 0,
        discount: parseFloat(formData.discount) || 0,
        notes: formData.notes,
        termsConditions: formData.termsConditions,
        paymentTerms: formData.paymentTerms,
        status: status
      }
      
      const url = isEditMode
        ? `${API_URL}/api/cms/inventory/operations/purchase-orders/${poId}`
        : `${API_URL}/api/cms/inventory/operations/purchase-orders`
      
      const method = isEditMode ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(submitData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        const action = status === "ISSUED" ? "issued" : isEditMode ? "updated" : "created"
        toast.success(`Purchase order ${action} successfully!`)
        
        if (status === "DRAFT") {
          router.push(`/project-manager/dashboard/inventory/operations/purchase-order/${result.purchaseOrder._id}`)
        } else {
          router.push("/project-manager/dashboard/inventory/operations/purchase-order")
        }
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} purchase order`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} purchase order:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} purchase order`)
    } finally {
      setLoading(false)
    }
  }

  const quickAddItem = (item) => {
    const newItems = [...formData.items]
    
    // Check if item already exists
    const existingIndex = newItems.findIndex(i => i.rawItem === item.id)
    if (existingIndex >= 0) {
      // Increase quantity if already exists
      const currentQty = parseFloat(newItems[existingIndex].quantity) || 0
      newItems[existingIndex].quantity = (currentQty + 1).toString()
      calculateItemTotal(existingIndex)
    } else {
      // Add new item
      newItems.push({
        rawItem: item.id,
        itemName: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: "1",
        unitPrice: item.sellingPrice ? (item.sellingPrice * 0.8).toFixed(2) : "",
        totalPrice: 0
      })
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
    
    setShowItemSearch(false)
    setSearchRawItem("")
    setTimeout(() => calculateTotals(), 0)
  }

  const clearForm = () => {
    if (confirm("Clear all fields and start over?")) {
      setFormData({
        poNumber: "",
        vendor: "",
        vendorName: "",
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: "",
        items: [{
          rawItem: "",
          itemName: "",
          sku: "",
          unit: "",
          quantity: "",
          unitPrice: "",
          totalPrice: 0
        }],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        shippingCharges: 0,
        discount: 0,
        totalAmount: 0,
        notes: "",
        termsConditions: "",
        paymentTerms: "",
        status: "DRAFT"
      })
      setErrors({})
    }
  }

  const printPO = () => {
    // TODO: Implement print functionality
    toast.success("Print functionality coming soon!")
  }

  const downloadPO = () => {
    // TODO: Implement download functionality
    toast.success("Download functionality coming soon!")
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

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/project-manager/dashboard/inventory/operations/purchase-order"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Purchase Orders
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Edit Purchase Order" : "Create New Purchase Order"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? "Update purchase order details" : "Create new purchase order for raw materials"}
            </p>
            {isEditMode && formData.poNumber && (
              <div className="mt-2">
                <span className="px-2 py-1 text-sm font-mono bg-gray-100 text-gray-800 rounded-md">
                  PO: {formData.poNumber}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isEditMode && formData.status === "ISSUED" && (
              <Link
                href={`/project-manager/dashboard/inventory/operations/purchase-order/${poId}/receive`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Truck className="w-4 h-4" />
                Receive Delivery
              </Link>
            )}
            
            <button
              onClick={clearForm}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
            
            {isEditMode && (
              <>
                <button
                  onClick={downloadPO}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={printPO}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </>
            )}
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, formData.status)} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.vendor}
                    onChange={handleVendorChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vendor ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} - {vendor.contactPerson} ({vendor.vendorType})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.vendor && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendor}</p>
                )}
                {formData.vendor && vendors.find(v => v.id === formData.vendor) && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div>Contact: {vendors.find(v => v.id === formData.vendor)?.contactPerson}</div>
                    <div>Email: {vendors.find(v => v.id === formData.vendor)?.email}</div>
                    <div>Payment Terms: {vendors.find(v => v.id === formData.vendor)?.paymentTerms || "Not specified"}</div>
                  </div>
                )}
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.orderDate ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>
                {errors.orderDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.orderDate}</p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    min={formData.orderDate}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Net 30, 50% Advance"
                />
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              
              <div className="flex items-center gap-2">
                {/* Quick Add Search */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowItemSearch(!showItemSearch)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                  >
                    <Search className="w-4 h-4" />
                    Quick Add Item
                  </button>
                  
                  {showItemSearch && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchRawItem}
                          onChange={(e) => setSearchRawItem(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                          filteredItems.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => quickAddItem(item)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {item.sku} • {item.unit} • Stock: {item.currentStock}
                              </div>
                            </button>
                          ))
                        ) : searchRawItem ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No items found</div>
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">Start typing to search items</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="min-w-[200px]">
                          <select
                            value={item.rawItem}
                            onChange={(e) => handleItemChange(index, 'rawItem', e.target.value)}
                            className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`item_${index}_rawItem`] ? "border-red-500" : "border-gray-300"}`}
                          >
                            <option value="">Select Item</option>
                            {rawItems.map(rawItem => (
                              <option key={rawItem.id} value={rawItem.id}>
                                {rawItem.name} ({rawItem.sku}) - Stock: {rawItem.currentStock}
                              </option>
                            ))}
                          </select>
                          {errors[`item_${index}_rawItem`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_rawItem`]}</p>
                          )}
                          {item.itemName && (
                            <div className="mt-1 text-xs text-gray-500">{item.itemName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-mono text-gray-900">{item.sku || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{item.unit || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          className={`w-24 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`item_${index}_quantity`] ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Qty"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            min="0.01"
                            step="0.01"
                            className={`w-32 pl-7 pr-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`item_${index}_unitPrice`] ? "border-red-500" : "border-gray-300"}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors[`item_${index}_unitPrice`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_unitPrice`]}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Items Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{formData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                    <span className="font-medium">₹{formData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Charges:</span>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <input
                        type="number"
                        name="shippingCharges"
                        value={formData.shippingCharges}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">₹{formData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tax Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 18"
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
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {/* Terms & Conditions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  name="termsConditions"
                  value={formData.termsConditions}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment terms, delivery conditions, quality standards..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Link
                href="/project-manager/dashboard/inventory/operations/purchase-order"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              
              {isEditMode && formData.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "ISSUED")}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <Send className="w-4 h-4" />
                  Issue Purchase Order
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? "Save Changes" : "Save as Draft"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              {/* Order Status */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Order Status</div>
                <div className={`px-3 py-1.5 text-sm font-medium rounded-full inline-block ${formData.status === "DRAFT" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"}`}>
                  {formData.status === "DRAFT" ? "Draft" : "Issued"}
                </div>
              </div>
              
              {/* Item Count */}
              <div>
                <div className="text-sm font-medium text-gray-700">Items</div>
                <div className="text-2xl font-semibold text-gray-900">{formData.items.length}</div>
              </div>
              
              {/* Total Items */}
              <div>
                <div className="text-sm font-medium text-gray-700">Total Quantity</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)} units
                </div>
              </div>
              
              {/* Amount Summary */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{formData.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{formData.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{formData.shippingCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">₹{formData.discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">₹{formData.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vendor Info */}
              {formData.vendor && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Vendor</div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{formData.vendorName}</div>
                    {vendors.find(v => v.id === formData.vendor) && (
                      <>
                        <div className="mt-1">{vendors.find(v => v.id === formData.vendor)?.contactPerson}</div>
                        <div className="mt-1">{vendors.find(v => v.id === formData.vendor)?.email}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowItemSearch(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md"
                  >
                    <Search className="w-4 h-4" />
                    Add More Items
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md"
                  >
                    <Printer className="w-4 h-4" />
                    Print Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}