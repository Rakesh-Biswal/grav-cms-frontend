// /project-manager/dashboard/inventory/configurations/warehouse/components/WarehouseForm.js

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, X, MapPin, Building, User, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Common warehouse suggestions
const WAREHOUSE_SUGGESTIONS = [
    { name: "Main Production Warehouse", shortName: "WH-MAIN", address: "123 Industrial Area, Sector 5, Delhi - 110001", type: "Main Warehouse" },
    { name: "Raw Material Storage", shortName: "WH-RAW", address: "45 Material Park, Industrial Estate, Mumbai - 400072", type: "Raw Material Storage" },
    { name: "Finished Goods Warehouse", shortName: "WH-FIN", address: "67 Export Zone, Gandhidham, Gujarat - 370201", type: "Finished Goods Warehouse" },
    { name: "North Zone Distribution Center", shortName: "WH-NORTH", address: "78 Business Park, Chandigarh Road - 160101", type: "Distribution Center" },
    { name: "Cold Storage Unit", shortName: "WH-COLD", address: "12 Freezing Zone, Food Park, Pune - 411045", type: "Cold Storage" },
    { name: "South Zone Warehouse", shortName: "WH-SOUTH", address: "89 Tech Park, Bannerghatta Road, Bangalore - 560076", type: "Regional Warehouse" },
];

export default function WarehouseForm({ isEditMode = false, warehouseId = null }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditMode)
    const [capacityUnits, setCapacityUnits] = useState([])
    const [warehouseTypes, setWarehouseTypes] = useState([])
    const [showCustomUnit, setShowCustomUnit] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        shortName: "",
        address: "",
        capacity: "",
        capacityValue: "",
        capacityUnit: "sq ft",
        customUnit: "",
        description: "",
        contactPerson: {
            name: "",
            phone: "",
            email: ""
        },
        status: "Active"
    })

    const [errors, setErrors] = useState({})

    // Fetch data on component mount
    useEffect(() => {
        fetchCapacityUnits()
        fetchWarehouseTypes()

        if (isEditMode && warehouseId) {
            fetchWarehouseData()
        }
    }, [isEditMode, warehouseId])

    const fetchCapacityUnits = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cms/warehouses/capacity/units`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                setCapacityUnits(result.units)
            }
        } catch (error) {
            console.error("Error fetching capacity units:", error)
        }
    }

    const fetchWarehouseTypes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cms/warehouses/types/suggestions`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                setWarehouseTypes(result.types)
            }
        } catch (error) {
            console.error("Error fetching warehouse types:", error)
        }
    }

    const fetchWarehouseData = async () => {
        try {
            setFetching(true)
            const response = await fetch(`${API_URL}/api/cms/warehouses/${warehouseId}`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                const warehouse = result.warehouse

                // Parse capacity value and unit
                let capacityValue = "0"
                let capacityUnit = "sq ft"
                let customUnit = ""

                if (warehouse.capacity && warehouse.capacity !== "0 sq ft") {
                    const parts = warehouse.capacity.split(" ")
                    if (parts.length >= 2) {
                        capacityValue = parts[0]
                        const unit = parts.slice(1).join(" ")
                        if (capacityUnits.includes(unit)) {
                            capacityUnit = unit
                        } else {
                            capacityUnit = "custom"
                            customUnit = unit
                            setShowCustomUnit(true)
                        }
                    }
                }

                setFormData({
                    name: warehouse.name,
                    shortName: warehouse.shortName,
                    address: warehouse.address,
                    capacity: warehouse.capacity,
                    capacityValue: capacityValue,
                    capacityUnit: capacityUnit,
                    customUnit: customUnit,
                    description: warehouse.description || "",
                    contactPerson: warehouse.contactPerson || { name: "", phone: "", email: "" },
                    status: warehouse.status
                })
            } else {
                toast.error(result.message || "Failed to fetch warehouse data")
                router.push("/project-manager/dashboard/inventory/configurations/warehouse")
            }
        } catch (error) {
            console.error("Error fetching warehouse:", error)
            toast.error("Failed to fetch warehouse data")
            router.push("/project-manager/dashboard/inventory/configurations/warehouse")
        } finally {
            setFetching(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name.startsWith("contactPerson.")) {
            const field = name.split(".")[1]
            setFormData(prev => ({
                ...prev,
                contactPerson: {
                    ...prev.contactPerson,
                    [field]: value
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

        // Auto-generate short name from first letters of name
        if (name === "name" && !isEditMode && !formData.shortName) {
            const words = value.trim().split(" ")
            if (words.length > 1 && words.every(w => w.length > 0)) {
                const shortName = words.map(w => w[0].toUpperCase()).join("")
                if (shortName.length >= 2) {
                    setFormData(prev => ({
                        ...prev,
                        shortName: `WH-${shortName}`
                    }))
                }
            }
        }

        // Update full capacity string when value or unit changes
        if (name === "capacityValue" || name === "capacityUnit" || (name === "customUnit" && showCustomUnit)) {
            const unit = formData.capacityUnit === "custom" && showCustomUnit
                ? formData.customUnit
                : formData.capacityUnit

            const capacityValue = name === "capacityValue" ? value : formData.capacityValue
            const finalUnit = name === "capacityUnit" && value === "custom"
                ? formData.customUnit || ""
                : unit

            setFormData(prev => ({
                ...prev,
                capacity: capacityValue && finalUnit ? `${capacityValue} ${finalUnit}` : "0 sq ft"
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Warehouse name is required"
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Warehouse name must be at least 3 characters"
        }

        if (!formData.shortName.trim()) {
            newErrors.shortName = "Short name is required"
        } else if (formData.shortName.trim().length < 2) {
            newErrors.shortName = "Short name must be at least 2 characters"
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required"
        } else if (formData.address.trim().length < 10) {
            newErrors.address = "Please provide a complete address"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            // Prepare capacity
            const finalCapacity = formData.capacity || "0 sq ft"

            // Prepare contact person (only include if any field is filled)
            const contactPerson = formData.contactPerson.name || formData.contactPerson.phone || formData.contactPerson.email
                ? formData.contactPerson
                : null

            const submitData = {
                name: formData.name.trim(),
                shortName: formData.shortName.trim().toUpperCase(),
                address: formData.address.trim(),
                capacity: finalCapacity,
                description: formData.description?.trim() || "",
                contactPerson: contactPerson
            }

            if (isEditMode) {
                submitData.status = formData.status
            }

            const url = isEditMode
                ? `${API_URL}/api/cms/warehouses/${warehouseId}`
                : `${API_URL}/api/cms/warehouses`

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
                toast.success(isEditMode ? "Warehouse updated successfully!" : "Warehouse created successfully!")
                router.push("/project-manager/dashboard/inventory/configurations/warehouse")
            } else {
                toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} warehouse`)
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} warehouse:`, error)
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} warehouse`)
        } finally {
            setLoading(false)
        }
    }

    const fillSuggestion = (warehouse) => {
        setFormData({
            ...formData,
            name: warehouse.name,
            shortName: warehouse.shortName,
            address: warehouse.address,
            description: `Type: ${warehouse.type}`
        })
    }

    if (fetching) {
        return (
            <DashboardLayout activeMenu="inventory">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading warehouse data...</p>
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
                        href="/project-manager/dashboard/inventory/configurations/warehouse"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Warehouses
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditMode ? "Edit Warehouse" : "Add New Warehouse"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditMode ? "Update warehouse information" : "Register new storage facility"}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Warehouse Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Warehouse Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="e.g., Main Warehouse, North Zone Storage"
                                            autoFocus
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Descriptive name for the warehouse location
                                        </p>
                                    </div>

                                    {/* Short Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Short Name / Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="shortName"
                                            value={formData.shortName}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${errors.shortName ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="e.g., WH-MAIN, WH-NORTH"
                                        />
                                        {errors.shortName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.shortName}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Short code for easy reference (auto-generates from name)
                                        </p>
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address *
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Enter complete address including city, state, and PIN code"
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Full physical address for logistics and delivery purposes
                                        </p>
                                    </div>

                                    {/* Capacity */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Storage Capacity
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                name="capacityValue"
                                                value={formData.capacityValue}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 10000"
                                            />
                                            {showCustomUnit ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        name="customUnit"
                                                        value={formData.customUnit}
                                                        onChange={handleChange}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Custom unit"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCustomUnit(false)}
                                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        name="capacityUnit"
                                                        value={formData.capacityUnit}
                                                        onChange={(e) => {
                                                            if (e.target.value === "custom") {
                                                                setShowCustomUnit(true)
                                                            }
                                                            handleChange(e)
                                                        }}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="sq ft">sq ft</option>
                                                        <option value="sq m">sq m</option>
                                                        <option value="sq yards">sq yards</option>
                                                        <option value="cubic ft">cubic ft</option>
                                                        <option value="cubic m">cubic m</option>
                                                        <option value="pallets">pallets</option>
                                                        <option value="racks">racks</option>
                                                        <option value="shelves">shelves</option>
                                                        <option value="custom">Custom Unit</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Current capacity: <span className="font-medium">{formData.capacity}</span>
                                        </p>
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
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional details about the warehouse, special features, storage conditions, etc."
                                    />
                                </div>

                                {/* Contact Person */}
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Person (Optional)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                <User className="inline w-3 h-3 mr-1" />
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="contactPerson.name"
                                                value={formData.contactPerson.name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Contact person name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                <Phone className="inline w-3 h-3 mr-1" />
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="contactPerson.phone"
                                                value={formData.contactPerson.phone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                <Mail className="inline w-3 h-3 mr-1" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="contactPerson.email"
                                                value={formData.contactPerson.email}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Example */}
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Example:</p>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p>• Name: <span className="font-mono">Main Production Warehouse</span></p>
                                        <p>• Short Name: <span className="font-mono">WH-MAIN</span></p>
                                        <p>• Address: <span className="font-mono">123 Industrial Area, Sector 5, Delhi - 110001</span></p>
                                        <p>• Capacity: <span className="font-mono">10000 sq ft</span></p>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Link
                                        href="/project-manager/dashboard/inventory/configurations/warehouse"
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
                                                {isEditMode ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {isEditMode ? "Update Warehouse" : "Create Warehouse"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Warehouse Suggestions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-800 mb-4">Quick Suggestions</h3>
                            <div className="space-y-3">
                                {WAREHOUSE_SUGGESTIONS.map((warehouse, index) => (
                                    <div
                                        key={index}
                                        className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => fillSuggestion(warehouse)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-gray-900">{warehouse.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-1">{warehouse.shortName}</div>
                                            </div>
                                            <Building className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                                            {warehouse.address}
                                        </div>
                                        <div className="mt-1 text-xs text-blue-600 font-medium">
                                            {warehouse.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Help Info */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Warehouse Setup Tips</h3>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start">
                                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span><strong>Short Name:</strong> Auto-generates from name. Use WH- prefix for consistency</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span><strong>Address:</strong> Include full details for logistics and deliveries</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span><strong>Capacity:</strong> Use standard units or enter custom measurements</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span><strong>Contact Person:</strong> Optional but helpful for communication</span>
                                </li>
                            </ul>
                        </div>

                        
                        
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}