// /project-manager/dashboard/inventory/vendors-buyer/vendors/components/VendorForm.js

"use client"

import { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  Check, 
  X, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  CreditCard,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Common vendor suggestions for clothing industry
const VENDOR_SUGGESTIONS = [
  {
    companyName: "Textile Traders Ltd.",
    vendorType: "Fabric Supplier",
    contactPerson: "Rahul Sharma",
    email: "rahul@textiletraders.com",
    phone: "+91 9876543210",
    products: ["Cotton Fabric", "Polyester Fabric", "Silk Fabric"],
    city: "Mumbai",
    state: "Maharashtra",
    gstNumber: "27AABCT1234M1Z5"
  },
  {
    companyName: "Accessories World",
    vendorType: "Accessories Supplier",
    contactPerson: "Priya Patel",
    email: "info@accessoriesworld.com",
    phone: "+91 9876543211",
    products: ["Zippers", "Buttons", "Threads", "Labels"],
    city: "Surat",
    state: "Gujarat",
    gstNumber: "24AABCT5678M1Z6"
  },
  {
    companyName: "Packaging Solutions",
    vendorType: "Packaging Supplier",
    contactPerson: "Amit Kumar",
    email: "amit@packagingsolutions.com",
    phone: "+91 9876543212",
    products: ["Packaging Boxes", "Polybags", "Hangers", "Tags"],
    city: "Delhi",
    state: "Delhi",
    gstNumber: "07AABCT9012M1Z7"
  },
  {
    companyName: "Sewing Machine Mart",
    vendorType: "Equipment Supplier",
    contactPerson: "Rajesh Singh",
    email: "sales@sewingmachinemart.com",
    phone: "+91 9876543213",
    products: ["Sewing Machines", "Cutting Machines", "Embroidery Machines"],
    city: "Ludhiana",
    state: "Punjab",
    gstNumber: "03AABCT3456M1Z8"
  }
];

export default function VendorForm({ isEditMode = false, vendorId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [vendorTypes, setVendorTypes] = useState([])
  const [commonProducts, setCommonProducts] = useState([])
  const [showCustomType, setShowCustomType] = useState(false)
  const [productInput, setProductInput] = useState("")
  
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: "",
    vendorType: "Raw Material Supplier",
    customType: "",
    
    // Contact Information
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    
    // Address Information
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    
    // Business Information
    gstNumber: "",
    panNumber: "",
    
    // Products
    primaryProducts: [],
    
    // Bank Details
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branch: ""
    },
    
    // Additional Info
    notes: "",
    rating: 3,
    status: "Active"
  })
  
  const [errors, setErrors] = useState({})

  // Fetch data on component mount
  useEffect(() => {
    fetchVendorTypes()
    fetchCommonProducts()
    
    if (isEditMode && vendorId) {
      fetchVendorData()
    }
  }, [isEditMode, vendorId])

  const fetchVendorTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/types`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setVendorTypes(result.types)
      }
    } catch (error) {
      console.error("Error fetching vendor types:", error)
    }
  }

  const fetchCommonProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/vendors/common-products`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCommonProducts(result.products)
      }
    } catch (error) {
      console.error("Error fetching common products:", error)
    }
  }

  const fetchVendorData = async () => {
    try {
      setFetching(true)
      const response = await fetch(`${API_URL}/api/cms/vendors/${vendorId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const vendor = result.vendor
        
        // Check if type is in predefined list
        const isTypeInList = vendorTypes.includes(vendor.vendorType)
        if (!isTypeInList) {
          setShowCustomType(true)
        }
        
        setFormData({
          companyName: vendor.companyName || "",
          vendorType: isTypeInList ? vendor.vendorType : "",
          customType: !isTypeInList ? vendor.vendorType : "",
          contactPerson: vendor.contactPerson || "",
          email: vendor.email || "",
          phone: vendor.phone || "",
          alternatePhone: vendor.alternatePhone || "",
          address: {
            street: vendor.address?.street || "",
            city: vendor.address?.city || "",
            state: vendor.address?.state || "",
            pincode: vendor.address?.pincode || "",
            country: vendor.address?.country || "India"
          },
          gstNumber: vendor.gstNumber || "",
          panNumber: vendor.panNumber || "",
          primaryProducts: vendor.primaryProducts || [],
          bankDetails: {
            accountName: vendor.bankDetails?.accountName || "",
            accountNumber: vendor.bankDetails?.accountNumber || "",
            bankName: vendor.bankDetails?.bankName || "",
            ifscCode: vendor.bankDetails?.ifscCode || "",
            branch: vendor.bankDetails?.branch || ""
          },
          notes: vendor.notes || "",
          rating: vendor.rating || 3,
          status: vendor.status || "Active"
        })
      } else {
        toast.error(result.message || "Failed to fetch vendor data")
        router.push("/project-manager/dashboard/vendors-buyer/vendor")
      }
    } catch (error) {
      console.error("Error fetching vendor:", error)
      toast.error("Failed to fetch vendor data")
      router.push("/project-manager/dashboard/vendors-buyer/vendor")
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Handle adding a product
  const handleAddProduct = () => {
    if (productInput.trim() === "") return
    
    setFormData(prev => ({
      ...prev,
      primaryProducts: [...prev.primaryProducts, productInput.trim()]
    }))
    setProductInput("")
  }

  // Handle removing a product
  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      primaryProducts: prev.primaryProducts.filter((_, i) => i !== index)
    }))
  }

  // Handle selecting from common products
  const handleSelectProduct = (product) => {
    if (!formData.primaryProducts.includes(product)) {
      setFormData(prev => ({
        ...prev,
        primaryProducts: [...prev.primaryProducts, product]
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }
    
    // Only company name is mandatory, everything else is optional
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const finalVendorType = showCustomType ? formData.customType.trim() : formData.vendorType
      
      const submitData = {
        companyName: formData.companyName.trim(),
        vendorType: finalVendorType,
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim(),
          country: formData.address.country.trim()
        },
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        primaryProducts: formData.primaryProducts,
        bankDetails: {
          accountName: formData.bankDetails.accountName.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          bankName: formData.bankDetails.bankName.trim(),
          ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
          branch: formData.bankDetails.branch.trim()
        },
        notes: formData.notes.trim(),
        rating: formData.rating,
        status: formData.status
      }
      
      const url = isEditMode 
        ? `${API_URL}/api/cms/vendors/${vendorId}`
        : `${API_URL}/api/cms/vendors`
      
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
        toast.success(isEditMode ? "Vendor updated successfully!" : "Vendor registered successfully!")
        router.push("/project-manager/dashboard/inventory/vendors-buyer/vendors")
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'register'} vendor`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} vendor:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'register'} vendor`)
    } finally {
      setLoading(false)
    }
  }

  const fillSuggestion = (vendor) => {
    const isTypeInList = vendorTypes.includes(vendor.vendorType)
    
    setFormData({
      ...formData,
      companyName: vendor.companyName,
      vendorType: isTypeInList ? vendor.vendorType : "",
      customType: !isTypeInList ? vendor.vendorType : "",
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: {
        ...formData.address,
        city: vendor.city,
        state: vendor.state
      },
      gstNumber: vendor.gstNumber,
      primaryProducts: vendor.products || []
    })
    
    setShowCustomType(!isTypeInList)
  }

  if (fetching) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading vendor data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/project-manager/dashboard/inventory/vendors-buyer/vendors"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Vendors
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Vendor" : "Register New Vendor"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Update vendor information" : "Register new supplier/vendor for your clothing business"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name - Only Mandatory Field */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.companyName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., Textile Traders Ltd."
                        autoFocus
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                      )}
                    </div>

                    {/* Vendor Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Type
                      </label>
                      {showCustomType ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="customType"
                              value={formData.customType}
                              onChange={handleChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter custom vendor type"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCustomType(false)}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              name="vendorType"
                              value={formData.vendorType}
                              onChange={handleChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {vendorTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomType(true)
                                setFormData(prev => ({ ...prev, vendorType: "" }))
                              }}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Custom
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Rahul Sharma"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., contact@company.com"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., +91 9876543210"
                        />
                      </div>
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="alternatePhone"
                          value={formData.alternatePhone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., +91 9876543211"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 123 Textile Street"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mumbai"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Maharashtra"
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 400001"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., India"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GST Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="e.g., 27AABCT1234M1Z5"
                      />
                    </div>

                    {/* PAN Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="e.g., AABCT1234M"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Products */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Products/Services
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Product Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddProduct())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a product or service"
                      />
                      <button
                        type="button"
                        onClick={handleAddProduct}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selected Products */}
                    <div className="flex flex-wrap gap-2">
                      {formData.primaryProducts.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {product}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Select Products */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Quick select common products:</p>
                      <div className="flex flex-wrap gap-2">
                        {commonProducts.slice(0, 8).map((product, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {product}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Bank Details (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountName"
                        value={formData.bankDetails.accountName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Textile Traders Ltd."
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 123456789012"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={formData.bankDetails.bankName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., State Bank of India"
                      />
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="bankDetails.ifscCode"
                        value={formData.bankDetails.ifscCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        placeholder="e.g., SBIN0001234"
                      />
                    </div>

                    {/* Branch */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        name="bankDetails.branch"
                        value={formData.bankDetails.branch}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Andheri West, Mumbai"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Additional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any additional information or comments about this vendor..."
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className={`p-1 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400' : ''}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Status (for edit mode) */}
                    {isEditMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Blacklisted">Blacklisted</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link
                    href="/project-manager/dashboard/inventory/vendors-buyer/vendors"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEditMode ? "Updating..." : "Registering..."}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {isEditMode ? "Update Vendor" : "Register Vendor"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vendor Suggestions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Quick Suggestions</h3>
              <div className="space-y-3">
                {VENDOR_SUGGESTIONS.map((vendor, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => fillSuggestion(vendor)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.companyName}</div>
                        <div className="text-xs text-gray-500 mt-1">{vendor.vendorType}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {vendor.city}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {vendor.contactPerson}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {vendor.phone}
                      </div>
                    </div>
                    {vendor.products && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">Products:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vendor.products.slice(0, 2).map((product, idx) => (
                            <span key={idx} className="px-1 py-0.5 text-xs bg-gray-100 rounded">
                              {product}
                            </span>
                          ))}
                          {vendor.products.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{vendor.products.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Help Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Vendor Registration Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Only Company Name is mandatory</strong> - Fill other fields as available</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>GST Number:</strong> Should be unique if provided</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Products:</strong> Add at least main products/services</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Bank Details:</strong> Optional but helpful for payments</span>
                </li>
              </ul>
            </div>

            {/* Available Vendor Types */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Vendor Types</h3>
              <div className="space-y-2">
                {vendorTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm text-gray-700">{type}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomType(false)
                        setFormData(prev => ({ ...prev, vendorType: type }))
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}