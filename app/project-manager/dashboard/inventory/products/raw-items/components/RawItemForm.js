"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Check,
    X,
    Package,
    Tag,
    AlertCircle,
    Plus,
    Trash2,
    Percent,
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Common raw item suggestions for clothing industry
const RAW_ITEM_SUGGESTIONS = [
    {
        name: "Cotton Fabric - White",
        category: "Fabric",
        unit: "Metre",
        minStock: 100,
        maxStock: 2000,
        sellingPrice: 120,
        discounts: [
            { minQuantity: 100, price: 115 },
            { minQuantity: 500, price: 110 },
            { minQuantity: 1000, price: 105 }
        ]
    },
    {
        name: "Polyester Thread - Black",
        category: "Thread",
        unit: "kg",
        minStock: 20,
        maxStock: 100,
        sellingPrice: 380,
        discounts: [
            { minQuantity: 10, price: 360 },
            { minQuantity: 25, price: 340 }
        ]
    },
    {
        name: "Zipper - Metal 12inch",
        category: "Fasteners",
        unit: "Pieces",
        minStock: 500,
        maxStock: 2000,
        sellingPrice: 25,
        discounts: [
            { minQuantity: 100, price: 22 },
            { minQuantity: 500, price: 20 }
        ]
    }
];

export default function RawItemForm({ isEditMode = false, rawItemId = null }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditMode)
    const [categories, setCategories] = useState([])
    const [units, setUnits] = useState([])
    const [showCustomCategory, setShowCustomCategory] = useState(false)
    const [showCustomUnit, setShowCustomUnit] = useState(false)
    const [discounts, setDiscounts] = useState([{ minQuantity: "", price: "" }])

    const [formData, setFormData] = useState({
        // Basic Information
        name: "",
        category: "Fabric",
        customCategory: "",
        unit: "",
        customUnit: "",

        // Stock Information
        minStock: "",
        maxStock: "",

        // Pricing
        sellingPrice: "",

        // Additional Info
        description: "",
        notes: ""
    })

    const [errors, setErrors] = useState({})

    // Fetch data on component mount
    useEffect(() => {
        fetchCategories()
        fetchUnits()

        if (isEditMode && rawItemId) {
            fetchRawItemData()
        }
    }, [isEditMode, rawItemId])

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cms/raw-items/data/categories`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                setCategories(result.categories)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchUnits = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cms/raw-items/units`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                setUnits(result.units)
            }
        } catch (error) {
            console.error("Error fetching units:", error)
        }
    }

    const fetchRawItemData = async () => {
        try {
            setFetching(true)
            const response = await fetch(`${API_URL}/api/cms/raw-items/${rawItemId}`, {
                credentials: "include"
            })

            const result = await response.json()

            if (result.success) {
                const item = result.rawItem

                // Check if category is in predefined list
                const isCategoryInList = categories.includes(item.category)
                if (item.customCategory || !isCategoryInList) {
                    setShowCustomCategory(true)
                }

                // Check if unit is in predefined list
                const isUnitInList = units.includes(item.unit)
                if (item.customUnit || !isUnitInList) {
                    setShowCustomUnit(true)
                }

                setFormData({
                    name: item.name || "",
                    category: isCategoryInList ? item.category : "",
                    customCategory: item.customCategory || (!isCategoryInList ? item.category : ""),
                    unit: isUnitInList ? item.unit : "",
                    customUnit: item.customUnit || (!isUnitInList ? item.unit : ""),
                    minStock: item.minStock?.toString() || "",
                    maxStock: item.maxStock?.toString() || "",
                    sellingPrice: item.sellingPrice?.toString() || "",
                    description: item.description || "",
                    notes: item.notes || ""
                })

                // Set discounts (keep only this section)
                if (item.discounts && item.discounts.length > 0) {
                    setDiscounts(item.discounts.map(d => ({
                        minQuantity: d.minQuantity?.toString() || "",
                        price: d.price?.toString() || ""
                    })))
                } else {
                    setDiscounts([{ minQuantity: "", price: "" }])
                }
            } else {
                toast.error(result.message || "Failed to fetch raw item data")
                router.push("/project-manager/dashboard/inventory/products/raw-items")
            }
        } catch (error) {
            console.error("Error fetching raw item:", error)
            toast.error("Failed to fetch raw item data")
            router.push("/project-manager/dashboard/inventory/products/raw-items")
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

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }

        // Auto-calculate max stock if min stock is set
        if (name === "minStock" && value && !formData.maxStock && !isEditMode) {
            setFormData(prev => ({
                ...prev,
                maxStock: (parseFloat(value) * 5).toString()
            }))
        }
    }

    // Handle discount changes
    const handleDiscountChange = (index, field, value) => {
        const newDiscounts = [...discounts]
        newDiscounts[index][field] = value
        setDiscounts(newDiscounts)

        if (errors.discounts) {
            setErrors(prev => ({ ...prev, discounts: "" }))
        }
    }

    const addDiscount = () => {
        setDiscounts([...discounts, { minQuantity: "", price: "" }])
    }

    const removeDiscount = (index) => {
        if (discounts.length > 1) {
            const newDiscounts = discounts.filter((_, i) => i !== index)
            setDiscounts(newDiscounts)
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Material name is required"
        }

        const finalCategory = showCustomCategory ? formData.customCategory : formData.category
        if (!finalCategory?.trim()) {
            newErrors.category = "Category is required"
        }

        const finalUnit = showCustomUnit ? formData.customUnit : formData.unit
        if (!finalUnit?.trim()) {
            newErrors.unit = "Unit of measurement is required"
        }

        if (!formData.minStock || isNaN(formData.minStock) || parseFloat(formData.minStock) < 0) {
            newErrors.minStock = "Valid minimum stock is required"
        }

        if (!formData.maxStock || isNaN(formData.maxStock) || parseFloat(formData.maxStock) < 0) {
            newErrors.maxStock = "Valid maximum stock is required"
        }

        if (parseFloat(formData.minStock) >= parseFloat(formData.maxStock)) {
            newErrors.maxStock = "Maximum stock must be greater than minimum stock"
        }

        // Validate discounts if selling price is set
        if (formData.sellingPrice) {
            for (let i = 0; i < discounts.length; i++) {
                if (discounts[i].minQuantity && discounts[i].price) {
                    if (isNaN(discounts[i].minQuantity) || parseFloat(discounts[i].minQuantity) <= 0) {
                        newErrors.discounts = `Invalid minimum quantity in discount ${i + 1}`
                    }
                    if (isNaN(discounts[i].price) || parseFloat(discounts[i].price) <= 0) {
                        newErrors.discounts = `Invalid price in discount ${i + 1}`
                    }
                    if (parseFloat(discounts[i].price) > parseFloat(formData.sellingPrice || 0)) {
                        newErrors.discounts = `Discount price cannot be higher than selling price in tier ${i + 1}`
                    }
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const finalCategory = showCustomCategory ? formData.customCategory.trim() : formData.category
            const finalUnit = showCustomUnit ? formData.customUnit.trim() : formData.unit

            const submitData = {
                name: formData.name.trim(),
                category: showCustomCategory ? "" : formData.category,
                customCategory: showCustomCategory ? finalCategory : "",
                unit: showCustomUnit ? "" : formData.unit,
                customUnit: showCustomUnit ? finalUnit : "",
                minStock: parseFloat(formData.minStock),
                maxStock: parseFloat(formData.maxStock),
                sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
                discounts: discounts.filter(d =>
                    d.minQuantity && d.price && !isNaN(d.minQuantity) && !isNaN(d.price)
                ).map(d => ({
                    minQuantity: parseFloat(d.minQuantity),
                    price: parseFloat(d.price)
                })),
                description: formData.description?.trim() || "",
                notes: formData.notes?.trim() || ""
            }

            const url = isEditMode
                ? `${API_URL}/api/cms/raw-items/${rawItemId}`
                : `${API_URL}/api/cms/raw-items`

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
                toast.success(isEditMode ? "Raw item updated successfully!" : "Raw item registered successfully!")
                router.push("/project-manager/dashboard/inventory/products/raw-items")
            } else {
                toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'register'} raw item`)
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} raw item:`, error)
            toast.error(`Failed to ${isEditMode ? 'update' : 'register'} raw item`)
        } finally {
            setLoading(false)
        }
    }

    const fillSuggestion = (item) => {
        const isCategoryInList = categories.includes(item.category)
        const isUnitInList = units.includes(item.unit)

        setFormData({
            ...formData,
            name: item.name,
            category: isCategoryInList ? item.category : "",
            customCategory: !isCategoryInList ? item.category : "",
            unit: isUnitInList ? item.unit : "",
            customUnit: !isUnitInList ? item.unit : "",
            minStock: item.minStock?.toString() || "",
            maxStock: item.maxStock?.toString() || "",
            sellingPrice: item.sellingPrice?.toString() || ""
        })

        setShowCustomCategory(!isCategoryInList)
        setShowCustomUnit(!isUnitInList)

        // Set discounts only
        if (item.discounts) {
            setDiscounts(item.discounts.map(d => ({
                minQuantity: d.minQuantity?.toString() || "",
                price: d.price?.toString() || ""
            })))
        } else {
            setDiscounts([{ minQuantity: "", price: "" }])
        }
    }

    const clearForm = () => {
        setFormData({
            name: "",
            category: "Fabric",
            customCategory: "",
            unit: "",
            customUnit: "",
            minStock: "",
            maxStock: "",
            sellingPrice: "",
            description: "",
            notes: ""
        })
        setDiscounts([{ minQuantity: "", price: "" }])
        setShowCustomCategory(false)
        setShowCustomUnit(false)
        setErrors({})
    }

    if (fetching) {
        return (
            <DashboardLayout activeMenu="inventory">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading raw item data...</p>
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
                        href="/project-manager/dashboard/inventory/products/raw-items"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Raw Materials
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditMode ? "Edit Raw Material" : "Register New Raw Material"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditMode ? "Update raw material information" : "Register basic information for new raw material"}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Material Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Material Name *
                                        </label>
                                        <div className="relative">
                                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="e.g., Cotton Fabric - White"
                                                autoFocus
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        {showCustomCategory ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        name="customCategory"
                                                        value={formData.customCategory}
                                                        onChange={handleChange}
                                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border-red-500" : "border-gray-300"
                                                            }`}
                                                        placeholder="Enter custom category"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCustomCategory(false)}
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
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border-red-500" : "border-gray-300"
                                                            }`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCustomCategory(true)
                                                            setFormData(prev => ({ ...prev, category: "" }))
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Custom
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    {/* Unit of Measurement */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit of Measurement *
                                        </label>
                                        {showCustomUnit ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        name="customUnit"
                                                        value={formData.customUnit}
                                                        onChange={handleChange}
                                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.unit ? "border-red-500" : "border-gray-300"
                                                            }`}
                                                        placeholder="Enter custom unit"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCustomUnit(false)}
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
                                                        name="unit"
                                                        value={formData.unit}
                                                        onChange={handleChange}
                                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.unit ? "border-red-500" : "border-gray-300"
                                                            }`}
                                                    >
                                                        <option value="">Select Unit</option>
                                                        {units.map(unit => (
                                                            <option key={unit} value={unit}>{unit}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCustomUnit(true)
                                                            setFormData(prev => ({ ...prev, unit: "" }))
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Custom
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {errors.unit && (
                                            <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                                        )}
                                    </div>

                                    {/* Selling Price per Unit */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Selling Price per Unit (₹)
                                        </label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number"
                                                name="sellingPrice"
                                                value={formData.sellingPrice}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 120.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Minimum Stock */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Stock Level *
                                        </label>
                                        <div className="relative">
                                            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number"
                                                name="minStock"
                                                value={formData.minStock}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.minStock ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        {errors.minStock && (
                                            <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                                        )}
                                    </div>

                                    {/* Maximum Stock */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Maximum Stock Level *
                                        </label>
                                        <div className="relative">
                                            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number"
                                                name="maxStock"
                                                value={formData.maxStock}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.maxStock ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="e.g., 2000"
                                            />
                                        </div>
                                        {errors.maxStock && (
                                            <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe the material, specifications, quality, etc."
                                        />
                                    </div>
                                </div>

                                {/* Bulk Discounts Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                <Percent className="w-5 h-5" />
                                                Bulk Discounts
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Set quantity-based discounts (optional)
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Note: Vendor/supplier information will be managed through purchase orders
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addDiscount}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Discount
                                        </button>
                                    </div>

                                    {errors.discounts && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-sm text-red-600 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.discounts}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {discounts.map((discount, index) => (
                                            <div key={index} className="bg-purple-50 p-3 rounded-md border border-purple-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Percent className="w-4 h-4 text-purple-500" />
                                                        <span className="text-sm font-medium text-purple-700">
                                                            Discount Tier {index + 1}
                                                        </span>
                                                    </div>
                                                    {discounts.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDiscount(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Remove discount tier"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Minimum Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={discount.minQuantity}
                                                            onChange={(e) => handleDiscountChange(index, 'minQuantity', e.target.value)}
                                                            min="0"
                                                            step="1"
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="e.g., 100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Discounted Price (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={discount.price}
                                                            onChange={(e) => handleDiscountChange(index, 'price', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="e.g., 110.00"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Calculate discount percentage */}
                                                {formData.sellingPrice && discount.price && formData.sellingPrice > 0 && discount.price > 0 && (
                                                    <div className="mt-2 text-xs">
                                                        <span className="text-green-600 font-medium">
                                                            {(((parseFloat(formData.sellingPrice) - parseFloat(discount.price)) / parseFloat(formData.sellingPrice)) * 100).toFixed(1)}% discount
                                                        </span>
                                                        <span className="text-gray-600 ml-2">
                                                            from regular price: ₹{formData.sellingPrice}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Any additional notes, special instructions, quality specifications..."
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <Link
                                        href="/project-manager/dashboard/inventory/products/raw-items"
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const confirmed = confirm("Clear all fields and start over?")
                                                if (confirmed) {
                                                    clearForm()
                                                }
                                            }}
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
                                                    {isEditMode ? "Updating..." : "Registering..."}
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    {isEditMode ? "Update Raw Material" : "Register Raw Material"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Suggestions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Suggestions</h3>
                            <div className="space-y-3">
                                {RAW_ITEM_SUGGESTIONS.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => fillSuggestion(item)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {item.category} • {item.unit}
                                        </div>
                                        {item.discounts && item.discounts.length > 0 && (
                                            <div className="text-xs text-purple-600 mt-1">
                                                {item.discounts.length} bulk discount{item.discounts.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="text-lg font-medium text-blue-900 mb-3">About This Form</h3>
                            <ul className="space-y-3 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Register only basic raw material information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Vendor and stock quantities will be managed through purchase orders</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Bulk discounts can be set for quantity-based pricing</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Minimum and maximum stock levels will trigger alerts</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                    <strong>Note:</strong> After registering, you can create purchase orders from the Vendors dashboard to add stock from specific suppliers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}