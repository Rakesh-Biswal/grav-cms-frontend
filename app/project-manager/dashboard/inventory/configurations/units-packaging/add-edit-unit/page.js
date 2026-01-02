// /project-manager/dashboard/inventory/configurations/units-packaging/components/UnitForm.js

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// GST UQC codes for clothing industry
const GST_UQC_CODES = [
  "BAG", "BAL", "BDL", "BKL", "BOU", "BOX", "BTL", "BUN", "CAN", "CBM", 
  "CCM", "CMS", "CTN", "DOZ", "DRM", "GGK", "GMS", "GRS", "GYD", "KGS", 
  "KLR", "KME", "LTR", "MLT", "MTR", "MTS", "NOS", "OTH", "PAC", "PCS", 
  "PRS", "QTL", "ROL", "SET", "SQF", "SQM", "SQY", "TBS", "TGM", "THD", 
  "TON", "TUB", "UGS", "UNT", "YDS"
];

// Common clothing units suggestions
const CLOTHING_UNIT_SUGGESTIONS = [
  { name: "Piece", gstUqc: "PCS", quantity: "1", isBaseUnit: true, description: "Individual items" },
  { name: "Dozen", gstUqc: "DOZ", quantity: "12", baseUnit: "Piece", isBaseUnit: false, description: "12 pieces" },
  { name: "Meter", gstUqc: "MTR", quantity: "1", isBaseUnit: true, description: "Fabric length" },
  { name: "Yard", gstUqc: "YDS", quantity: "0.9144", baseUnit: "Meter", isBaseUnit: false, description: "0.9144 meters" },
  { name: "Kilogram", gstUqc: "KGS", quantity: "1", isBaseUnit: true, description: "Weight measurement" },
  { name: "Gram", gstUqc: "GRM", quantity: "1000", baseUnit: "Kilogram", isBaseUnit: false, description: "1000 grams = 1 kg" },
  { name: "Roll", gstUqc: "ROL", quantity: "1", isBaseUnit: true, description: "Fabric roll" },
  { name: "Bundle", gstUqc: "BDL", quantity: "1", isBaseUnit: true, description: "Bundle of items" },
  { name: "Set", gstUqc: "SET", quantity: "1", isBaseUnit: true, description: "Complete set" },
  { name: "Pair", gstUqc: "PRS", quantity: "2", baseUnit: "Piece", isBaseUnit: false, description: "2 pieces" },
  { name: "Centimeter", gstUqc: "CMT", quantity: "100", baseUnit: "Meter", isBaseUnit: false, description: "100 cm = 1 meter" },
  { name: "Milliliter", gstUqc: "MLT", quantity: "1000", baseUnit: "Liter", isBaseUnit: false, description: "1000 ml = 1 liter" },
];

export default function UnitForm({ isEditMode = false, unitId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [baseUnits, setBaseUnits] = useState([])
  const [gstUqcSuggestions, setGstUqcSuggestions] = useState(GST_UQC_CODES)
  const [showGstDropdown, setShowGstDropdown] = useState(false)
  const [showCustomBaseUnit, setShowCustomBaseUnit] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    gstUqc: "",
    quantity: "1",
    baseUnit: "",
    baseUnitName: "",
    isBaseUnit: true,
    status: "Active"
  })
  
  const [errors, setErrors] = useState({})

  // Fetch data on component mount
  useEffect(() => {
    fetchBaseUnits()
    
    if (isEditMode && unitId) {
      fetchUnitData()
    }
  }, [isEditMode, unitId])

  const fetchBaseUnits = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/units/base-units`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBaseUnits(result.baseUnits)
      }
    } catch (error) {
      console.error("Error fetching base units:", error)
    }
  }

  const fetchUnitData = async () => {
    try {
      setFetching(true)
      const response = await fetch(`${API_URL}/api/cms/units/${unitId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const unit = result.unit
        setFormData({
          name: unit.name,
          gstUqc: unit.gstUqc,
          quantity: unit.quantity.toString(),
          baseUnit: unit.baseUnit?._id || "",
          baseUnitName: unit.baseUnit?.name || "",
          isBaseUnit: !unit.baseUnit,
          status: unit.status
        })
        
        // If unit has a base unit but it's not in the dropdown, show custom input
        if (unit.baseUnit && !baseUnits.some(b => b._id === unit.baseUnit._id)) {
          setShowCustomBaseUnit(true)
        }
      } else {
        toast.error(result.message || "Failed to fetch unit data")
        router.push("/project-manager/dashboard/inventory/configurations/units-packaging")
      }
    } catch (error) {
      console.error("Error fetching unit:", error)
      toast.error("Failed to fetch unit data")
      router.push("/project-manager/dashboard/inventory/configurations/units-packaging")
    } finally {
      setFetching(false)
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
    
    // If isBaseUnit is checked, clear baseUnit
    if (name === "isBaseUnit" && checked) {
      setFormData(prev => ({
        ...prev,
        baseUnit: "",
        baseUnitName: ""
      }))
      setShowCustomBaseUnit(false)
    }
  }

  const handleGstUqcSelect = (code) => {
    setFormData(prev => ({
      ...prev,
      gstUqc: code
    }))
    setShowGstDropdown(false)
  }

  const handleBaseUnitSelect = (unitId, unitName) => {
    setFormData(prev => ({
      ...prev,
      baseUnit: unitId,
      baseUnitName: unitName
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Unit name is required"
    }
    
    if (!formData.gstUqc.trim()) {
      newErrors.gstUqc = "GST UQC is required"
    } else if (!/^[A-Z]{2,4}$/.test(formData.gstUqc.trim())) {
      newErrors.gstUqc = "GST UQC must be 2-4 uppercase letters"
    }
    
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a positive number"
    }
    
    if (!formData.isBaseUnit) {
      if (showCustomBaseUnit && !formData.baseUnitName.trim()) {
        newErrors.baseUnit = "Base unit name is required"
      } else if (!showCustomBaseUnit && !formData.baseUnit) {
        newErrors.baseUnit = "Please select a base unit"
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
      // Prepare base unit data
      let baseUnitData = null
      if (!formData.isBaseUnit) {
        if (showCustomBaseUnit) {
          baseUnitData = formData.baseUnitName // Send as string name
        } else {
          baseUnitData = formData.baseUnit // Send as ObjectId
        }
      }
      
      const submitData = {
        name: formData.name.trim(),
        gstUqc: formData.gstUqc.trim().toUpperCase(),
        quantity: parseFloat(formData.quantity),
        isBaseUnit: formData.isBaseUnit,
        baseUnit: baseUnitData
      }
      
      if (isEditMode) {
        submitData.status = formData.status
      }
      
      const url = isEditMode 
        ? `${API_URL}/api/cms/units/${unitId}`
        : `${API_URL}/api/cms/units`
      
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
        toast.success(isEditMode ? "Unit updated successfully!" : "Unit created successfully!")
        router.push("/project-manager/dashboard/inventory/configurations/units-packaging")
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} unit`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} unit:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} unit`)
    } finally {
      setLoading(false)
    }
  }

  const fillSuggestedUnit = (unit) => {
    setFormData({
      name: unit.name,
      gstUqc: unit.gstUqc,
      quantity: unit.quantity.toString(),
      baseUnit: unit.baseUnit || "",
      baseUnitName: unit.baseUnit || "",
      isBaseUnit: unit.isBaseUnit,
      status: "Active"
    })
    
    if (unit.baseUnit && !unit.isBaseUnit) {
      const foundBaseUnit = baseUnits.find(b => b.name === unit.baseUnit)
      if (foundBaseUnit) {
        setShowCustomBaseUnit(false)
      } else {
        setShowCustomBaseUnit(true)
      }
    } else {
      setShowCustomBaseUnit(false)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading unit data...</p>
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
            href="/project-manager/dashboard/inventory/configurations/units-packaging"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Units
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Unit" : "Create New Unit"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Update unit information" : "Add a new measurement unit for inventory management"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Kilogram, Meter, Piece"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* GST UQC with Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST UQC Code *
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="gstUqc"
                        value={formData.gstUqc}
                        onChange={handleChange}
                        onFocus={() => setShowGstDropdown(true)}
                        maxLength={4}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                          errors.gstUqc ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., KGS, MTR, PCS"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGstDropdown(!showGstDropdown)}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {showGstDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* GST UQC Dropdown */}
                    {showGstDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search GST UQC codes..."
                            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md text-sm"
                            onChange={(e) => {
                              const search = e.target.value.toUpperCase()
                              setGstUqcSuggestions(
                                GST_UQC_CODES.filter(code => 
                                  code.includes(search)
                                )
                              )
                            }}
                          />
                          <div className="space-y-1">
                            {gstUqcSuggestions.map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => handleGstUqcSelect(code)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center justify-between"
                              >
                                <span>{code}</span>
                                {formData.gstUqc === code && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 px-2">
                              Type manually or select from list
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.gstUqc && (
                    <p className="mt-1 text-sm text-red-600">{errors.gstUqc}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Standard measurement code as per Indian GST regulations (2-4 uppercase letters)
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (Conversion Value) *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., 1 for base unit, 1000 for grams to kilogram"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                {/* Base Unit Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isBaseUnit"
                      name="isBaseUnit"
                      checked={formData.isBaseUnit}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isBaseUnit" className="text-sm text-gray-700">
                      This is a base unit (no conversion needed)
                    </label>
                  </div>

                  {!formData.isBaseUnit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Unit *
                      </label>
                      
                      {showCustomBaseUnit ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="baseUnitName"
                              value={formData.baseUnitName}
                              onChange={handleChange}
                              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.baseUnit ? "border-red-500" : "border-gray-300"
                              }`}
                              placeholder="Enter base unit name"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCustomBaseUnit(false)}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Select from List
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Enter the name of an existing base unit. It will be linked automatically.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <select
                              name="baseUnit"
                              value={formData.baseUnit}
                              onChange={(e) => {
                                const selectedId = e.target.value
                                const selectedUnit = baseUnits.find(u => u._id === selectedId)
                                handleBaseUnitSelect(selectedId, selectedUnit?.name || "")
                              }}
                              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.baseUnit ? "border-red-500" : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Base Unit</option>
                              {baseUnits.map(unit => (
                                <option key={unit._id} value={unit._id}>
                                  {unit.name} ({unit.gstUqc})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomBaseUnit(true)
                                setFormData(prev => ({ ...prev, baseUnit: "" }))
                              }}
                              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Enter Manually
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Select which unit this converts to (e.g., 1000 Grams = 1 Kilogram)
                          </p>
                        </div>
                      )}
                      
                      {errors.baseUnit && (
                        <p className="mt-1 text-sm text-red-600">{errors.baseUnit}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Status (for edit mode) */}
                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Example */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Examples:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><span className="font-medium">Base Unit:</span> Name: "Kilogram", GST UQC: "KGS", Quantity: "1", Check "base unit"</p>
                    <p><span className="font-medium">Derived Unit:</span> Name: "Gram", GST UQC: "GRM", Quantity: "1000", Uncheck "base unit", Select "Kilogram"</p>
                    <p className="mt-1">Meaning: 1000 Grams = 1 Kilogram</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link
                    href="/project-manager/dashboard/inventory/configurations/units-packaging"
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
                        {isEditMode ? "Update Unit" : "Create Unit"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Suggested Units */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Quick Suggestions</h3>
              <div className="space-y-3">
                {CLOTHING_UNIT_SUGGESTIONS.map((unit, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => fillSuggestedUnit(unit)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{unit.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{unit.description}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {unit.gstUqc}
                      </span>
                    </div>
                    {unit.baseUnit && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                        {unit.quantity} {unit.name} = 1 {unit.baseUnit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Help Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">How to Configure Units</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Base Units:</strong> Primary units (e.g., Kilogram, Meter, Piece)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Derived Units:</strong> Convert to base units (e.g., 1000 Grams = 1 Kilogram)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>GST UQC:</strong> Use standard codes or enter custom ones</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Manual Entry:</strong> Type base unit names if not in dropdown</span>
                </li>
              </ul>
            </div>

            {/* Base Units List */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Available Base Units</h3>
              <div className="space-y-2">
                {baseUnits.length > 0 ? (
                  baseUnits.map(unit => (
                    <div key={unit._id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm text-gray-700">{unit.name}</span>
                      <span className="text-xs font-medium text-gray-500">{unit.gstUqc}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No base units found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}