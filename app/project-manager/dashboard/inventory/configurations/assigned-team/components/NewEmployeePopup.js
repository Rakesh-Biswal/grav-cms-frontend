"use client"

import { useState, useEffect, useRef } from "react"
import { X, User, Briefcase, Clock, Hash, Award, MapPin, DollarSign, Calendar, Mail, Phone } from "lucide-react"

export default function NewEmployeePopup({ 
  isOpen, 
  onClose, 
  onSubmit, 
  departments,
  designations,
  shifts,
  employeeToEdit 
}) {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    department: "",
    designation: "",
    assignedMachine: "",
    shift: "",
    experience: "",
    skills: "",
    salary: "",
    dateOfJoining: "",
    email: "",
    phone: ""
  })
  const [errors, setErrors] = useState({})
  const popupRef = useRef(null)

  // Initialize form with employee data if editing
  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name,
        employeeId: employeeToEdit.employeeId,
        department: employeeToEdit.department,
        designation: employeeToEdit.designation,
        assignedMachine: employeeToEdit.assignedMachine,
        shift: employeeToEdit.shift,
        experience: employeeToEdit.experience,
        skills: employeeToEdit.skills.join(", "),
        salary: employeeToEdit.salary || "",
        dateOfJoining: employeeToEdit.dateOfJoining || "",
        email: employeeToEdit.email || "",
        phone: employeeToEdit.phone || ""
      })
    } else {
      // Generate employee ID
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const today = new Date().toISOString().split('T')[0]
      
      setFormData({
        name: "",
        employeeId: `EMP-${year}-${randomNum}`,
        department: "",
        designation: "",
        assignedMachine: "",
        shift: "Morning (8AM-4PM)",
        experience: "",
        skills: "",
        salary: "",
        dateOfJoining: today,
        email: "",
        phone: ""
      })
    }
    setErrors({})
  }, [employeeToEdit])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Employee name is required"
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = "Please enter full name"
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required"
    }
    
    if (!formData.department) {
      newErrors.department = "Department is required"
    }
    
    if (!formData.designation) {
      newErrors.designation = "Designation is required"
    }
    
    if (!formData.shift) {
      newErrors.shift = "Shift is required"
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required"
    }
    
    if (formData.salary && isNaN(formData.salary.replace(/,/g, ''))) {
      newErrors.salary = "Please enter a valid salary amount"
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        department: formData.department,
        designation: formData.designation,
        assignedMachine: formData.assignedMachine.trim() || "-",
        shift: formData.shift,
        experience: formData.experience.trim(),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
        salary: formData.salary.trim() || "-",
        dateOfJoining: formData.dateOfJoining.trim() || "-",
        email: formData.email.trim() || "-",
        phone: formData.phone.trim() || "-"
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Format salary input
    if (name === "salary") {
      const numericValue = value.replace(/[^0-9]/g, '')
      const formattedValue = numericValue ? new Intl.NumberFormat('en-IN').format(numericValue) : ''
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }

    // Auto-generate employee ID from name if not editing
    if (name === "name" && !employeeToEdit && formData.name.trim().split(' ').length >= 2) {
      const names = formData.name.trim().split(' ')
      const initials = names.map(n => n[0].toUpperCase()).join('')
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({
        ...prev,
        employeeId: `EMP-${year}-${randomNum}`
      }))
    }
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
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employeeToEdit ? "Edit Employee" : "Add New Employee"}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., Rajesh Kumar"
                      autoFocus
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.employeeId ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., EMP-2023-001"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
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
                      placeholder="e.g., rajesh.kumar@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
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
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., +91 9876543210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.department ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.designation ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                  )}
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary/Month (In-hand)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.salary ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 25,000"
                    />
                  </div>
                  {errors.salary && (
                    <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Net take-home salary per month
                  </p>
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Employee's joining date
                  </p>
                </div>

                {/* Assigned Machine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Machine
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="assignedMachine"
                      value={formData.assignedMachine}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., JUKI DDL-8700 (Leave empty if not assigned)"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Machine this employee is trained to operate
                  </p>
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.shift ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Shift</option>
                      {shifts.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                  {errors.shift && (
                    <p className="mt-1 text-sm text-red-600">{errors.shift}</p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience *
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.experience ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 5 years, 6 months"
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Total experience in clothing manufacturing
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Stitching, Quality Check, Machine Setup (comma separated)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate skills with commas
                  </p>
                </div>
              </div>

              {/* Example */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Example for clothing production employee:</span>
                  <br />
                  • Name: <span className="font-mono">Rajesh Kumar</span>
                  <br />
                  • Employee ID: <span className="font-mono">EMP-2023-001</span>
                  <br />
                  • Email: <span className="font-mono">rajesh.kumar@company.com</span>
                  <br />
                  • Phone: <span className="font-mono">+91 9876543210</span>
                  <br />
                  • Department: <span className="font-mono">Sewing</span>
                  <br />
                  • Designation: <span className="font-mono">Senior Tailor</span>
                  <br />
                  • Salary/Month: <span className="font-mono">₹25,000</span>
                  <br />
                  • Date of Joining: <span className="font-mono">2023-01-15</span>
                  <br />
                  • Assigned Machine: <span className="font-mono">JUKI DDL-8700</span>
                  <br />
                  • Shift: <span className="font-mono">Morning (8AM-4PM)</span>
                  <br />
                  • Experience: <span className="font-mono">5 years</span>
                  <br />
                  • Skills: <span className="font-mono">Stitching, Quality Check, Machine Setup</span>
                </p>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white pt-4 border-t">
                <div className="flex justify-end gap-3">
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
                    {employeeToEdit ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}