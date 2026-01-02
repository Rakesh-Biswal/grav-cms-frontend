// /project-manager/dashboard/inventory/configurations/devices-machines/components/MachineForm.js

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, X, Settings, Tag, Zap, Calendar, MapPin, Hash, ChevronDown, ChevronUp } from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Common machine suggestions for clothing industry
const MACHINE_SUGGESTIONS = [
  { name: "JUKI DDL-8700", type: "Sewing Machine", model: "DDL-8700", power: "750W", location: "Sewing Section A", description: "High-speed straight stitch sewing machine" },
  { name: "Brother BAS-342G", type: "Embroidery Machine", model: "BAS-342G", power: "1500W", location: "Embroidery Unit", description: "Single-head embroidery machine" },
  { name: "Eastman C-45", type: "Cutting Machine", model: "C-45", power: "2200W", location: "Cutting Section", description: "Round knife cutting machine" },
  { name: "Singer 4411", type: "Heavy Duty Sewing", model: "4411", power: "1100W", location: "Sewing Section B", description: "Heavy-duty sewing machine" },
  { name: "JUKI MO-6700S", type: "Overlock Machine", model: "MO-6700S", power: "850W", location: "Finishing Section", description: "4-thread overlock machine" },
  { name: "Hashima HP-150", type: "Buttonhole Machine", model: "HP-150", power: "600W", location: "Finishing Section", description: "Buttonhole making machine" },
  { name: "Ricoma EM-1010", type: "Multi-head Embroidery", model: "EM-1010", power: "2500W", location: "Embroidery Unit", description: "10-head embroidery machine" },
  { name: "Kansai Special", type: "Bar Tack Machine", model: "KM-370B", power: "900W", location: "Quality Control", description: "Bartacking machine for reinforcements" },
];

export default function MachineForm({ isEditMode = false, machineId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditMode)
  const [machineTypes, setMachineTypes] = useState([])
  const [factoryLocations, setFactoryLocations] = useState([])
  const [showCustomType, setShowCustomType] = useState(false)
  const [showCustomLocation, setShowCustomLocation] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    customType: "",
    model: "",
    serialNumber: "",
    powerConsumption: "",
    location: "",
    customLocation: "",
    lastMaintenance: "",
    nextMaintenance: "",
    description: "",
    status: "Operational"
  })
  
  const [errors, setErrors] = useState({})

  // Fetch data on component mount
  useEffect(() => {
    fetchMachineTypes()
    fetchFactoryLocations()
    
    if (isEditMode && machineId) {
      fetchMachineData()
    } else {
      // Set default dates for new machine
      const today = new Date()
      const nextDate = new Date(today)
      nextDate.setMonth(today.getMonth() + 3)
      
      setFormData(prev => ({
        ...prev,
        lastMaintenance: formatDate(today),
        nextMaintenance: formatDate(nextDate)
      }))
    }
  }, [isEditMode, machineId])

  const fetchMachineTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/machines/types`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMachineTypes(result.types)
      }
    } catch (error) {
      console.error("Error fetching machine types:", error)
    }
  }

  const fetchFactoryLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/machines/locations`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFactoryLocations(result.locations)
      }
    } catch (error) {
      console.error("Error fetching factory locations:", error)
    }
  }

  const fetchMachineData = async () => {
    try {
      setFetching(true)
      const response = await fetch(`${API_URL}/api/cms/machines/${machineId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const machine = result.machine
        
        // Check if type is in predefined list
        const isTypeInList = machineTypes.includes(machine.type)
        if (!isTypeInList) {
          setShowCustomType(true)
        }
        
        // Check if location is in predefined list
        const isLocationInList = factoryLocations.includes(machine.location)
        if (!isLocationInList) {
          setShowCustomLocation(true)
        }
        
        setFormData({
          name: machine.name,
          type: isTypeInList ? machine.type : "",
          customType: !isTypeInList ? machine.type : "",
          model: machine.model,
          serialNumber: machine.serialNumber,
          powerConsumption: machine.powerConsumption,
          location: isLocationInList ? machine.location : "",
          customLocation: !isLocationInList ? machine.location : "",
          lastMaintenance: formatDate(new Date(machine.lastMaintenance)),
          nextMaintenance: formatDate(new Date(machine.nextMaintenance)),
          description: machine.description || "",
          status: machine.status
        })
      } else {
        toast.error(result.message || "Failed to fetch machine data")
        router.push("/project-manager/dashboard/inventory/configurations/devices-machines")
      }
    } catch (error) {
      console.error("Error fetching machine:", error)
      toast.error("Failed to fetch machine data")
      router.push("/project-manager/dashboard/inventory/configurations/devices-machines")
    } finally {
      setFetching(false)
    }
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
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
    
    // Auto-generate serial number suggestion for new machines
    if (name === "name" && !isEditMode && !formData.serialNumber) {
      const prefix = value.substring(0, 3).toUpperCase()
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({
        ...prev,
        serialNumber: `${prefix}-${year}-${randomNum}`
      }))
    }
    
    // Auto-calculate next maintenance date if last maintenance is changed
    if (name === "lastMaintenance" && value) {
      const lastDate = new Date(value)
      const nextDate = new Date(lastDate)
      nextDate.setMonth(lastDate.getMonth() + 3)
      setFormData(prev => ({
        ...prev,
        nextMaintenance: formatDate(nextDate)
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Machine name is required"
    }
    
    const finalType = showCustomType ? formData.customType : formData.type
    if (!finalType?.trim()) {
      newErrors.type = "Machine type is required"
    }
    
    if (!formData.model.trim()) {
      newErrors.model = "Model number is required"
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required"
    }
    
    if (!formData.powerConsumption.trim()) {
      newErrors.powerConsumption = "Power consumption is required"
    } else if (!/^\d+W$/.test(formData.powerConsumption.trim())) {
      newErrors.powerConsumption = "Format: Number followed by W (e.g., 750W)"
    }
    
    const finalLocation = showCustomLocation ? formData.customLocation : formData.location
    if (!finalLocation?.trim()) {
      newErrors.location = "Location is required"
    }
    
    if (!formData.lastMaintenance) {
      newErrors.lastMaintenance = "Last maintenance date is required"
    }
    
    if (!formData.nextMaintenance) {
      newErrors.nextMaintenance = "Next maintenance date is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const finalType = showCustomType ? formData.customType.trim() : formData.type
      const finalLocation = showCustomLocation ? formData.customLocation.trim() : formData.location
      
      const submitData = {
        name: formData.name.trim(),
        type: finalType,
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.toUpperCase().trim(),
        powerConsumption: formData.powerConsumption.trim(),
        location: finalLocation,
        lastMaintenance: formData.lastMaintenance,
        nextMaintenance: formData.nextMaintenance,
        description: formData.description?.trim() || ""
      }
      
      if (isEditMode) {
        submitData.status = formData.status
      }
      
      const url = isEditMode 
        ? `${API_URL}/api/cms/machines/${machineId}`
        : `${API_URL}/api/cms/machines`
      
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
        toast.success(isEditMode ? "Machine updated successfully!" : "Machine registered successfully!")
        router.push("/project-manager/dashboard/inventory/configurations/devices-machines")
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'register'} machine`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} machine:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'register'} machine`)
    } finally {
      setLoading(false)
    }
  }

  const fillSuggestion = (machine) => {
    const isTypeInList = machineTypes.includes(machine.type)
    const isLocationInList = factoryLocations.includes(machine.location)
    
    setFormData({
      ...formData,
      name: machine.name,
      type: isTypeInList ? machine.type : "",
      customType: !isTypeInList ? machine.type : "",
      model: machine.model,
      powerConsumption: machine.power,
      location: isLocationInList ? machine.location : "",
      customLocation: !isLocationInList ? machine.location : "",
      description: machine.description || ""
    })
    
    setShowCustomType(!isTypeInList)
    setShowCustomLocation(!isLocationInList)
    
    // Generate serial number if not editing
    if (!isEditMode && !formData.serialNumber) {
      const prefix = machine.name.substring(0, 3).toUpperCase()
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({
        ...prev,
        serialNumber: `${prefix}-${year}-${randomNum}`
      }))
    }
  }

  if (fetching) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading machine data...</p>
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
            href="/project-manager/dashboard/inventory/configurations/devices-machines"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Machines
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Machine" : "Register New Machine"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Update machine information" : "Register new manufacturing equipment"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Machine Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Machine Name *
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., JUKI DDL-8700"
                        autoFocus
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Machine Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Machine Type *
                    </label>
                    {showCustomType ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            name="customType"
                            value={formData.customType}
                            onChange={handleChange}
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.type ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter machine type"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCustomType(false)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Select
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter custom machine type (e.g., Specialized Cutting Machine)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.type ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Type</option>
                            {machineTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomType(true)
                              setFormData(prev => ({ ...prev, type: "" }))
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Custom
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Select from common types or enter custom
                        </p>
                      </div>
                    )}
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>

                  {/* Model Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model Number *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.model ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., DDL-8700, BAS-342G"
                      />
                    </div>
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                    )}
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                          errors.serialNumber ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., JUK-2023-001"
                      />
                    </div>
                    {errors.serialNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.serialNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Unique identification number (auto-generated from name)
                    </p>
                  </div>

                  {/* Power Consumption */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power Consumption *
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="powerConsumption"
                        value={formData.powerConsumption}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.powerConsumption ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., 750W, 1500W"
                      />
                    </div>
                    {errors.powerConsumption && (
                      <p className="mt-1 text-sm text-red-600">{errors.powerConsumption}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Enter value with W suffix (e.g., 750W)
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    {showCustomLocation ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            name="customLocation"
                            value={formData.customLocation}
                            onChange={handleChange}
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.location ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter location"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCustomLocation(false)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Select
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter custom location (e.g., Workshop Room 3)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.location ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Location</option>
                            {factoryLocations.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomLocation(true)
                              setFormData(prev => ({ ...prev, location: "" }))
                            }}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Custom
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Select common location or enter custom
                        </p>
                      </div>
                    )}
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>

                  {/* Last Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Maintenance Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="lastMaintenance"
                        value={formData.lastMaintenance}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.lastMaintenance ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.lastMaintenance && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastMaintenance}</p>
                    )}
                  </div>

                  {/* Next Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Maintenance Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="nextMaintenance"
                        value={formData.nextMaintenance}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.nextMaintenance ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.nextMaintenance && (
                      <p className="mt-1 text-sm text-red-600">{errors.nextMaintenance}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-calculated 3 months from last maintenance
                    </p>
                  </div>
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
                    placeholder="Additional details about the machine, special features, notes, etc."
                  />
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
                      <option value="Operational">Operational</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Idle">Idle</option>
                      <option value="Repair Needed">Repair Needed</option>
                    </select>
                  </div>
                )}

                {/* Example */}
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Example for clothing manufacturing:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Name: <span className="font-mono">JUKI DDL-8700</span></p>
                    <p>• Type: <span className="font-mono">Sewing Machine</span></p>
                    <p>• Model: <span className="font-mono">DDL-8700</span></p>
                    <p>• Serial: <span className="font-mono">JUK-2023-001</span></p>
                    <p>• Power: <span className="font-mono">750W</span></p>
                    <p>• Location: <span className="font-mono">Sewing Section A</span></p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link
                    href="/project-manager/dashboard/inventory/configurations/devices-machines"
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
                        {isEditMode ? "Update Machine" : "Register Machine"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Machine Suggestions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Quick Suggestions</h3>
              <div className="space-y-3">
                {MACHINE_SUGGESTIONS.map((machine, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => fillSuggestion(machine)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{machine.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{machine.type}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {machine.power}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {machine.location}
                      </div>
                      {machine.description && (
                        <p className="mt-1 text-gray-500">{machine.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for Machine Registration</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Serial Number:</strong> Must be unique. Auto-generates from name</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Maintenance:</strong> Schedule every 3 months for optimal performance</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Power:</strong> Include W suffix (e.g., 750W, 1500W)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Custom Fields:</strong> Use if type/location not in dropdown</span>
                </li>
              </ul>
            </div>

            {/* Available Types & Locations */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">Available Options</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Machine Types</h4>
                  <div className="flex flex-wrap gap-1">
                    {machineTypes.slice(0, 8).map(type => (
                      <span key={type} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">
                        {type}
                      </span>
                    ))}
                    {machineTypes.length > 8 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{machineTypes.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Factory Locations</h4>
                  <div className="flex flex-wrap gap-1">
                    {factoryLocations.slice(0, 6).map(location => (
                      <span key={location} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">
                        {location}
                      </span>
                    ))}
                    {factoryLocations.length > 6 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{factoryLocations.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}