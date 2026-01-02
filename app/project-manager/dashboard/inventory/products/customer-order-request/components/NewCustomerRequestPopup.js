"use client"

import { useState, useEffect, useRef } from "react"
import { 
  X, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Package,
  MapPin,
  PhoneCall,
  Globe,
  Briefcase,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Hash
} from "lucide-react"

export default function NewCustomerRequestPopup({ 
  isOpen, 
  onClose, 
  onSubmit, 
  statusOptions,
  priorityOptions,
  unitOptions,
  sourceOptions,
  requestToEdit 
}) {
  const [formData, setFormData] = useState({
    organization: "",
    organizationAddress: "",
    contactPerson: "",
    designation: "",
    email: "",
    primaryPhone: "",
    secondaryPhone: "",
    website: "",
    date: "",
    status: "New",
    priority: "Medium",
    source: "Website Inquiry",
    expectedDelivery: "",
    notes: "",
    products: [{ 
      id: Date.now(), 
      name: "", 
      description: "", 
      size: "", 
      color: "", 
      quantity: 1, 
      unit: "Pieces", 
      unitPrice: 0,
      priceUnit: "Per Piece",
      isManualEntry: false 
    }]
  })
  const [errors, setErrors] = useState({})
  const [manualEntryMode, setManualEntryMode] = useState(false)
  const popupRef = useRef(null)

  // Sample products for dropdown (optional)
  const sampleProducts = [
    { id: 1, name: "Men's Polo T-Shirt", category: "T-Shirts" },
    { id: 2, name: "Women's Jeans", category: "Jeans" },
    { id: 3, name: "Formal Shirts", category: "Shirts" },
    { id: 4, name: "School Uniforms", category: "Uniforms" },
    { id: 5, name: "Track Pants", category: "Sportswear" },
    { id: 6, name: "Kurti", category: "Ethnic Wear" },
    { id: 7, name: "Leggings", category: "Bottoms" },
    { id: 8, name: "Hoodie", category: "Sweatshirts" },
    { id: 9, name: "Jacket", category: "Outerwear" },
    { id: 10, name: "Kids T-Shirt", category: "Kids Wear" },
  ]

  // Unit options for products
  const productUnits = ["Pieces", "Sets", "Dozen", "Metres", "Kilograms", "Square Metres", "Litres", "Boxes", "Packs", "Pairs"]

  // Common sizes
  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"]

  // Common colors
  const commonColors = ["White", "Black", "Navy Blue", "Dark Blue", "Red", "Blue", "Grey", "Green", "Pink", "Yellow", "Multicolor"]

  // Initialize form with request data if editing
  useEffect(() => {
    if (requestToEdit) {
      setFormData({
        requestId: requestToEdit.requestId,
        organization: requestToEdit.organization,
        organizationAddress: requestToEdit.organizationAddress,
        contactPerson: requestToEdit.contactPerson,
        designation: requestToEdit.designation,
        email: requestToEdit.email,
        primaryPhone: requestToEdit.primaryPhone,
        secondaryPhone: requestToEdit.secondaryPhone,
        website: requestToEdit.website,
        date: requestToEdit.date,
        status: requestToEdit.status,
        priority: requestToEdit.priority,
        source: requestToEdit.source,
        expectedDelivery: requestToEdit.expectedDelivery,
        notes: requestToEdit.notes,
        products: requestToEdit.products.map((product, index) => ({
          id: index + 1,
          name: product.name,
          description: product.description || "",
          size: product.size,
          color: product.color,
          quantity: product.quantity,
          unit: product.unit,
          unitPrice: product.unitPrice,
          priceUnit: product.priceUnit,
          isManualEntry: true // All existing products are treated as manual
        }))
      })
    } else {
      // Set default dates
      const today = new Date().toISOString().split('T')[0]
      const oneMonthLater = new Date()
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
      const expectedDate = oneMonthLater.toISOString().split('T')[0]
      
      // Generate request ID
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      
      setFormData({
        requestId: `REQ-${year}${month}-${randomNum}`,
        organization: "",
        organizationAddress: "",
        contactPerson: "",
        designation: "",
        email: "",
        primaryPhone: "",
        secondaryPhone: "",
        website: "",
        date: today,
        status: "New",
        priority: "Medium",
        source: "Website Inquiry",
        expectedDelivery: expectedDate,
        notes: "",
        products: [{ 
          id: Date.now(), 
          name: "", 
          description: "", 
          size: "", 
          color: "", 
          quantity: 1, 
          unit: "Pieces", 
          unitPrice: 0,
          priceUnit: "Per Piece",
          isManualEntry: false 
        }]
      })
    }
    setErrors({})
    setManualEntryMode(false)
  }, [requestToEdit])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.organization.trim()) {
      newErrors.organization = "Organization name is required"
    }
    
    if (!formData.organizationAddress.trim()) {
      newErrors.organizationAddress = "Organization address is required"
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email is required"
    }
    
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Primary phone number is required"
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required"
    }
    
    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = "Expected delivery date is required"
    }
    
    // Validate products
    let hasProductErrors = false
    formData.products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_${index}_name`] = "Product name is required"
        hasProductErrors = true
      }
      if (product.quantity <= 0 || isNaN(product.quantity)) {
        newErrors[`product_${index}_quantity`] = "Valid quantity is required"
        hasProductErrors = true
      }
      if (!product.unit) {
        newErrors[`product_${index}_unit`] = "Unit is required"
        hasProductErrors = true
      }
      if (product.unitPrice < 0 || isNaN(product.unitPrice)) {
        newErrors[`product_${index}_unitPrice`] = "Valid unit price is required"
        hasProductErrors = true
      }
      if (!product.priceUnit) {
        newErrors[`product_${index}_priceUnit`] = "Price unit is required"
        hasProductErrors = true
      }
    })
    
    if (hasProductErrors) {
      newErrors.products = "Please fix product errors"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const totalAmount = formData.products.reduce((sum, product) => 
        sum + (product.quantity * product.unitPrice), 0
      )
      
      onSubmit({
        requestId: formData.requestId,
        organization: formData.organization.trim(),
        organizationAddress: formData.organizationAddress.trim(),
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        primaryPhone: formData.primaryPhone.trim(),
        secondaryPhone: formData.secondaryPhone.trim(),
        website: formData.website.trim(),
        date: formData.date,
        products: formData.products.map(product => ({
          name: product.name.trim(),
          description: product.description.trim(),
          size: product.size || "Free Size",
          color: product.color || "White",
          quantity: parseInt(product.quantity),
          unit: product.unit,
          unitPrice: parseFloat(product.unitPrice),
          priceUnit: product.priceUnit
        })),
        totalAmount: totalAmount,
        status: formData.status,
        priority: formData.priority,
        source: formData.source,
        expectedDelivery: formData.expectedDelivery,
        notes: formData.notes.trim()
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }))
    
    // Clear product errors
    if (errors[`product_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`product_${index}_${field}`]
        return newErrors
      })
    }
  }

  const toggleManualEntry = (index) => {
    const updatedProducts = [...formData.products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      isManualEntry: !updatedProducts[index].isManualEntry,
      name: !updatedProducts[index].isManualEntry ? "" : updatedProducts[index].name
    }
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }))
    setManualEntryMode(!manualEntryMode)
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { 
          id: Date.now() + Math.random(), 
          name: "", 
          description: "", 
          size: "", 
          color: "", 
          quantity: 1, 
          unit: "Pieces", 
          unitPrice: 0,
          priceUnit: "Per Piece",
          isManualEntry: false 
        }
      ]
    }))
  }

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotal = () => {
    return formData.products.reduce((sum, product) => 
      sum + (product.quantity * product.unitPrice), 0
    )
  }

  // Close popup when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
        aria-hidden="true"
      />
      
      {/* Popup Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Popup Content */}
        <div 
          ref={popupRef}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {requestToEdit ? "Edit Customer Request" : "Add New Customer Request"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form - Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Request ID */}
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Request ID: <span className="font-mono">{formData.requestId}</span>
                  </span>
                </div>
              </div>

              {/* Organization Details */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Organization Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.organization ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Fashion Retail Ltd."
                        autoFocus
                      />
                    </div>
                    {errors.organization && (
                      <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        name="organizationAddress"
                        value={formData.organizationAddress}
                        onChange={handleChange}
                        rows="2"
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.organizationAddress ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Full address including city, state, and PIN code"
                      />
                    </div>
                    {errors.organizationAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.organizationAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.contactPerson ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Rahul Verma"
                      />
                    </div>
                    {errors.contactPerson && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="e.g., Purchase Manager"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., rahul@company.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="primaryPhone"
                        value={formData.primaryPhone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.primaryPhone ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., +91 9876543210"
                      />
                    </div>
                    {errors.primaryPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.primaryPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Phone
                    </label>
                    <div className="relative">
                      <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="secondaryPhone"
                        value={formData.secondaryPhone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="e.g., +91 9876543211"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="e.g., www.company.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Request Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.date ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Delivery *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="expectedDelivery"
                        value={formData.expectedDelivery}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.expectedDelivery ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.expectedDelivery && (
                      <p className="mt-1 text-sm text-red-600">{errors.expectedDelivery}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Source
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {sourceOptions.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Requirements */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Product Requirements *
                  </h4>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
                
                {errors.products && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.products}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <div key={product.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Product #{index + 1}</span>
                        {formData.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Product Name Selection */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Product Name *
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleManualEntry(index)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {product.isManualEntry ? "← Select from list" : "Enter manually →"}
                          </button>
                        </div>
                        
                        {product.isManualEntry ? (
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors[`product_${index}_name`] ? "border-red-300" : "border-gray-300"
                            }`}
                            placeholder="Enter product name manually"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={product.name}
                              onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                errors[`product_${index}_name`] ? "border-red-300" : "border-gray-300"
                              }`}
                            >
                              <option value="">Select from common products</option>
                              {sampleProducts.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                              ))}
                              <option value="other">Other (enter manually)</option>
                            </select>
                            {product.name === "other" && (
                              <button
                                type="button"
                                onClick={() => handleProductChange(index, 'isManualEntry', true)}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                              >
                                Enter
                              </button>
                            )}
                          </div>
                        )}
                        {errors[`product_${index}_name`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_name`]}</p>
                        )}
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Description */}
                        <div className="md:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={product.description}
                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                            rows="2"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Product description, specifications, or special requirements"
                          />
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Size
                          </label>
                          <div className="flex gap-1">
                            <select
                              value={product.size}
                              onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select size</option>
                              {commonSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={product.size === "Custom" ? product.customSize || "" : ""}
                              onChange={(e) => handleProductChange(index, 'customSize', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Custom size"
                              style={{ display: product.size === "Custom" ? "block" : "none" }}
                            />
                          </div>
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <div className="flex gap-1">
                            <select
                              value={product.color}
                              onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select color</option>
                              {commonColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={product.color === "Custom" ? product.customColor || "" : ""}
                              onChange={(e) => handleProductChange(index, 'customColor', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Custom color"
                              style={{ display: product.color === "Custom" ? "block" : "none" }}
                            />
                          </div>
                        </div>

                        {/* Quantity & Unit */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            min="1"
                            className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`product_${index}_quantity`] ? "border-red-300" : "border-gray-300"
                            }`}
                          />
                          {errors[`product_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`product_${index}_quantity`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <select
                            value={product.unit}
                            onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`product_${index}_unit`] ? "border-red-300" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select unit</option>
                            {productUnits.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                          {errors[`product_${index}_unit`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`product_${index}_unit`]}</p>
                          )}
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit Price (₹) *
                          </label>
                          <input
                            type="number"
                            value={product.unitPrice}
                            onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`product_${index}_unitPrice`] ? "border-red-300" : "border-gray-300"
                            }`}
                          />
                          {errors[`product_${index}_unitPrice`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`product_${index}_unitPrice`]}</p>
                          )}
                        </div>

                        {/* Price Unit */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price Unit *
                          </label>
                          <select
                            value={product.priceUnit}
                            onChange={(e) => handleProductChange(index, 'priceUnit', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`product_${index}_priceUnit`] ? "border-red-300" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select price unit</option>
                            {unitOptions.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                          {errors[`product_${index}_priceUnit`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`product_${index}_priceUnit`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Product Total */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Product Total:</span>
                          <span className="text-sm font-bold text-green-700">
                            ₹{(product.quantity * product.unitPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">Total Order Amount:</div>
                    <div className="text-lg font-bold text-green-700">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes & Requirements
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Any special requirements, instructions, fabric preferences, delivery instructions, or notes..."
                />
              </div>

              {/* Example */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Example:</span>
                  <br />
                  • Organization: <span className="font-mono">Fashion Retail Ltd. (123 Mall Road, Delhi)</span>
                  <br />
                  • Contact: <span className="font-mono">Rahul Verma (Purchase Manager) - rahul@fashionretail.com</span>
                  <br />
                  • Products: <span className="font-mono">500 pcs Men's Polo T-Shirt @ ₹450/Per Piece</span>
                  <br />
                  • Timeline: <span className="font-mono">Urgent delivery needed by Feb 28 for summer collection</span>
                  <br />
                  • Notes: <span className="font-mono">Need embroidery of company logo on left chest, 100% cotton fabric</span>
                </p>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {formData.products.length} product(s) | Total: ₹{calculateTotal().toLocaleString('en-IN')}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {requestToEdit ? "Update Request" : "Save Request"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}