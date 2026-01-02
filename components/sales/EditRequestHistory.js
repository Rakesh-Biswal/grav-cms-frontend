// components/sales/EditRequestHistory.js

"use client"

import { useState, useEffect } from "react"
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    ChevronDown,
    ChevronUp,
    Calendar,
    MessageSquare
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function EditRequestHistory({ requestId }) {
    const [editRequests, setEditRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedRequest, setExpandedRequest] = useState(null)

    useEffect(() => {
        fetchEditRequests()
    }, [requestId])

    const fetchEditRequests = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/${requestId}/edit-requests`, {
                credentials: "include"
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setEditRequests(data.editRequests)
                }
            }
        } catch (error) {
            console.error("Error fetching edit requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'cancelled': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_approval': return <Clock className="w-4 h-4" />
            case 'approved': return <CheckCircle className="w-4 h-4" />
            case 'rejected': return <XCircle className="w-4 h-4" />
            default: return <AlertCircle className="w-4 h-4" />
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
        if (field === 'deliveryDeadline' && value) {
            return formatDate(value)
        }
        return value || "Not set"
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading edit history...</p>
            </div>
        )
    }

    if (editRequests.length === 0) {
        return (
            <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No edit requests found</p>
                <p className="text-sm text-gray-500 mt-1">Edit requests will appear here when created</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Request History</h3>
            
            {editRequests.map((editRequest) => (
                <div key={editRequest._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(editRequest.status)}`}>
                                    {getStatusIcon(editRequest.status)}
                                    {editRequest.status.replace('_', ' ')}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    Request #{editRequest.requestId}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {formatDate(editRequest.requestedAt)}
                            </div>
                        </div>
                        {editRequest.reason && (
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {editRequest.reason}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <button
                            onClick={() => setExpandedRequest(expandedRequest === editRequest._id ? null : editRequest._id)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                    {editRequest.changes.length} change(s)
                                </span>
                                {expandedRequest === editRequest._id ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>Requested by Sales</span>
                            </div>
                        </button>

                        {/* Expanded Details */}
                        {expandedRequest === editRequest._id && (
                            <div className="mt-4 space-y-4">
                                {/* Changes List */}
                                <div className="space-y-3">
                                    {editRequest.changes.map((change, index) => (
                                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                            <div className="font-medium text-gray-900 mb-2">
                                                {getFieldLabel(change.field)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Original Value</div>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {formatValue(change.field, change.oldValue)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Proposed Change</div>
                                                    <div className="text-sm font-medium text-green-700">
                                                        {formatValue(change.field, change.newValue)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Status Information */}
                                {editRequest.status !== 'pending_approval' && (
                                    <div className={`p-3 rounded-lg ${editRequest.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {editRequest.status === 'approved' ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className="font-medium">
                                                {editRequest.status === 'approved' ? 'Approved' : 'Rejected'} by Customer
                                            </span>
                                        </div>
                                        {editRequest.reviewNotes && (
                                            <p className="text-sm text-gray-600">
                                                {editRequest.reviewNotes}
                                            </p>
                                        )}
                                        {editRequest.reviewedAt && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(editRequest.reviewedAt)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}