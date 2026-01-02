// components/sales/EditRequestModal.js

"use client"

import { useState, useEffect } from "react"
import {
    X,
    Edit2,
    Send,
    AlertCircle,
    CheckCircle,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    MessageSquare,
    ChevronDown,
    ChevronUp,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function EditRequestModal({ request, isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showChanges, setShowChanges] = useState(false)
    const [originalRequest, setOriginalRequest] = useState(null)
    const [editRequestId, setEditRequestId] = useState(null)
    const [editRequestSuccess, setEditRequestSuccess] = useState(false)

    const [formData, setFormData] = useState({
        customerInfo: {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            description: "",
            deliveryDeadline: "",
            preferredContactMethod: "phone"
        },
        reason: "",
        changes: []
    })

    // Initialize form with request data
    useEffect(() => {
        if (request && isOpen) {
            setOriginalRequest(JSON.parse(JSON.stringify(request)))
            setEditRequestId(null)
            setEditRequestSuccess(false)
            
            setFormData({
                customerInfo: {
                    name: request.customerInfo.name || "",
                    email: request.customerInfo.email || "",
                    phone: request.customerInfo.phone || "",
                    address: request.customerInfo.address || "",
                    city: request.customerInfo.city || "",
                    postalCode: request.customerInfo.postalCode || "",
                    description: request.customerInfo.description || "",
                    deliveryDeadline: request.customerInfo.deliveryDeadline || "",
                    preferredContactMethod: request.customerInfo.preferredContactMethod || "phone"
                },
                reason: "",
                changes: []
            })
        }
    }, [request, isOpen])

    const handleInputChange = (field, value) => {
        const oldValue = originalRequest?.customerInfo[field]
        
        setFormData(prev => {
            const newData = {
                ...prev,
                customerInfo: {
                    ...prev.customerInfo,
                    [field]: value
                }
            }

            // Track changes
            const existingChangeIndex = prev.changes.findIndex(change => change.field === field)
            
            if (oldValue !== value) {
                const newChange = {
                    field,
                    oldValue,
                    newValue: value,
                    changeType: 'modified'
                }

                if (existingChangeIndex >= 0) {
                    const newChanges = [...prev.changes]
                    newChanges[existingChangeIndex] = newChange
                    newData.changes = newChanges
                } else {
                    newData.changes = [...prev.changes, newChange]
                }
            } else if (existingChangeIndex >= 0) {
                // Remove change if values are now the same
                const newChanges = prev.changes.filter((_, index) => index !== existingChangeIndex)
                newData.changes = newChanges
            }

            return newData
        })
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.customerInfo.name.trim()) {
            newErrors.name = 'Customer name is required'
        }
        if (!formData.customerInfo.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^\S+@\S+\.\S+$/.test(formData.customerInfo.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!formData.customerInfo.phone.trim()) {
            newErrors.phone = 'Phone is required'
        }
        if (!formData.customerInfo.address.trim()) {
            newErrors.address = 'Address is required'
        }
        if (!formData.customerInfo.city.trim()) {
            newErrors.city = 'City is required'
        }
        if (!formData.customerInfo.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required'
        }
        if (!formData.reason.trim()) {
            newErrors.reason = 'Reason for edit is required'
        }
        if (formData.changes.length === 0) {
            newErrors.general = 'No changes made to send'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            setLoading(true)
            
            const response = await fetch(`${API_URL}/api/cms/sales/${request._id}/edit-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    customerInfo: formData.customerInfo,
                    reason: formData.reason,
                    changes: formData.changes
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setEditRequestId(data.editRequest._id)
                    setEditRequestSuccess(true)
                    onSuccess(data.editRequest)
                }
            } else {
                const errorData = await response.json()
                setErrors({ submit: errorData.message || "Failed to send edit request" })
            }
        } catch (error) {
            console.error("Error sending edit request:", error)
            setErrors({ submit: "Failed to send edit request" })
        } finally {
            setLoading(false)
        }
    }

    // Function to send WhatsApp message with edit request link
    const handleSendWhatsApp = () => {
        if (!editRequestId) return
        
        // Format phone number (remove any spaces, dashes, etc.)
        const phoneNumber = request.customerInfo.phone.replace(/[^\d+]/g, '')
        
        // Create WhatsApp message with edit request link
        const message = `Dear ${request.customerInfo.name},

We have requested some changes to your order #${request.requestId}.

Please review and approve the changes at:
${window.location.origin}/app/approval-request-for-edit-functionality/${editRequestId}

Thank you,
Sales Team`

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message)
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank')
    }

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
    }

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "Not set"
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getFieldLabel = (field) => {
        const labels = {
            name: "Customer Name",
            email: "Email Address",
            phone: "Phone Number",
            address: "Delivery Address",
            city: "City",
            postalCode: "Postal Code",
            description: "Additional Notes",
            deliveryDeadline: "Delivery Deadline",
            preferredContactMethod: "Preferred Contact Method"
        }
        return labels[field] || field
    }

    const formatValue = (field, value) => {
        if (field === 'preferredContactMethod') {
            return value === 'phone' ? 'Phone Call' : 
                   value === 'email' ? 'Email' : 'WhatsApp'
        }
        if (field === 'deliveryDeadline') {
            return formatDateDisplay(value)
        }
        return value || "Not set"
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Edit2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editRequestSuccess ? "Edit Request Sent Successfully!" : "Edit Request Details"}
                                </h2>
                                <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {!editRequestSuccess ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Note: This edit request will be sent to the customer for approval.</p>
                                    <p className="mt-1">The request status will change to "Pending Edit Approval" until the customer responds.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-green-800">
                                    <p className="font-medium">Edit request sent successfully!</p>
                                    <p className="mt-1">You can now send the approval link to the customer via WhatsApp.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {editRequestSuccess ? (
                        <div className="space-y-6">
                            {/* Success Message */}
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Edit Request Created</h3>
                                <p className="text-gray-600">
                                    The edit request has been created and is waiting for customer approval.
                                </p>
                            </div>

                            {/* WhatsApp Action */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Whatsapp className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Send WhatsApp Notification</div>
                                        <div className="text-sm text-gray-600">
                                            Send the approval link directly to the customer via WhatsApp
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleSendWhatsApp}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Whatsapp className="w-4 h-4" />
                                    Send WhatsApp Message to {request.customerInfo.name}
                                </button>
                                
                                <div className="mt-3 text-xs text-gray-500">
                                    This will open WhatsApp with a pre-filled message containing the approval link.
                                </div>
                            </div>

                            {/* Edit Request Details */}
                            {formData.changes.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Changes Summary</h4>
                                    <div className="space-y-2">
                                        {formData.changes.map((change, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 mb-1">
                                                        {getFieldLabel(change.field)}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <div className="text-gray-600 mb-1">Original:</div>
                                                            <div className="font-medium text-gray-700">
                                                                {formatValue(change.field, change.oldValue)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-600 mb-1">New:</div>
                                                            <div className="font-medium text-green-700">
                                                                {formatValue(change.field, change.newValue)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Changes Summary */}
                            {formData.changes.length > 0 && (
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowChanges(!showChanges)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                Changes ({formData.changes.length})
                                            </span>
                                            {showChanges ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {showChanges ? "Hide" : "Show"} details
                                        </span>
                                    </button>
                                    
                                    {showChanges && (
                                        <div className="mt-3 space-y-2">
                                            {formData.changes.map((change, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 mb-1">
                                                            {getFieldLabel(change.field)}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <div className="text-gray-600 mb-1">Original:</div>
                                                                <div className="font-medium text-gray-700">
                                                                    {formatValue(change.field, change.oldValue)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-600 mb-1">New:</div>
                                                                <div className="font-medium text-green-700">
                                                                    {formatValue(change.field, change.newValue)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit Form */}
                            <div className="space-y-6">
                                {/* Customer Information Fields */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-500" />
                                        Customer Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={formData.customerInfo.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Enter customer name"
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="email"
                                                    value={formData.customerInfo.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="customer@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="tel"
                                                    value={formData.customerInfo.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="+91 9876543210"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.customerInfo.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter city"
                                            />
                                            {errors.city && (
                                                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Postal Code *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.customerInfo.postalCode}
                                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter postal code"
                                            />
                                            {errors.postalCode && (
                                                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Delivery Deadline
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="date"
                                                    value={formatDateForInput(formData.customerInfo.deliveryDeadline)}
                                                    onChange={(e) => handleInputChange('deliveryDeadline', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Preferred Contact Method
                                            </label>
                                            <select
                                                value={formData.customerInfo.preferredContactMethod}
                                                onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="phone">Phone Call</option>
                                                <option value="email">Email</option>
                                                <option value="whatsapp">WhatsApp</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address *
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                                <textarea
                                                    value={formData.customerInfo.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    rows={2}
                                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Enter complete delivery address"
                                                />
                                            </div>
                                            {errors.address && (
                                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Additional Notes
                                            </label>
                                            <textarea
                                                value={formData.customerInfo.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Any additional notes or special instructions..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reason for Edit */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-gray-500" />
                                        Reason for Edit *
                                    </h3>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                        <textarea
                                            value={formData.reason}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            rows={3}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Explain why these changes are needed (e.g., incorrect address, updated delivery date, contact information change, etc.)"
                                        />
                                    </div>
                                    {errors.reason && (
                                        <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                                    )}
                                </div>
                            </div>

                            {/* Error Messages */}
                            {errors.general && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.general}
                                    </p>
                                </div>
                            )}
                            
                            {errors.submit && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {editRequestSuccess ? (
                                "Edit request has been sent successfully"
                            ) : (
                                `${formData.changes.length} change(s) made`
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {editRequestSuccess ? (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleSendWhatsApp}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Whatsapp className="w-4 h-4" />
                                        Send WhatsApp
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || formData.changes.length === 0}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Edit Request
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}