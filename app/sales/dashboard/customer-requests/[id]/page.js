// app/sales/dashboard/customer-requests/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
    ArrowLeft,
    Eye,
    FileText,
    MessageSquare,
    CheckCircle,
    Clock,
    Package,
    DollarSign,
    Users,
    MapPin,
    Phone,
    Mail,
    Calendar,
    AlertCircle,
    Edit,
    Printer,
    Send,
    Tag,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    RefreshCw,
    Download

} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import EditRequestModal from "@/components/sales/EditRequestModal"
import EditRequestHistory from "@/components/sales/EditRequestHistory"
import ApproveEditButton from "@/components/sales/ApproveEditButton"
import QuotationPopup from "../../../../../components/sales/QuotationPopup"
import QuotationInfoCard from "../../../../../components/sales/QuotationInfoCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RequestDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [request, setRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [notes, setNotes] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [showQuotationPopup, setShowQuotationPopup] = useState(false) // Add this state


    // Add this function to handle quotation creation
    const handleCreateQuotation = () => {
        setShowQuotationPopup(true)
    }

    // Add this function to handle quotation save
    const handleQuotationSave = (quotation) => {
        // Refresh request data
        fetchRequestDetails()
        setShowQuotationPopup(false)
    }

    // Add this function to handle quotation send
    const handleQuotationSend = () => {
        // Refresh request data
        fetchRequestDetails()
        setShowQuotationPopup(false)
    }

    useEffect(() => {
        if (params.id) {
            fetchRequestDetails()
        }
    }, [params.id])

    const fetchRequestDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${params.id}`, {
                credentials: "include"
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setRequest(data.request)
                }
            }
        } catch (error) {
            console.error("Error fetching request details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        try {
            setActionLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${params.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    status: newStatus,
                    notes: `Status changed to ${newStatus}`
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    fetchRequestDetails()
                }
            }
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleEditRequestSuccess = (editRequest) => {
        fetchRequestDetails() // Refresh data
        // Show success message
    }

    const handleApproveSuccess = (updatedRequest) => {
        setRequest(updatedRequest)
        // Show success message
    }

    const handleAddNote = async () => {
        if (!notes.trim()) return

        try {
            setUpdating(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${params.id}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ text: notes })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setNotes("")
                    fetchRequestDetails()
                }
            }
        } catch (error) {
            console.error("Error adding note:", error)
        } finally {
            setUpdating(false)
        }
    }

    const handleAssignToMe = async () => {
        try {
            setActionLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${params.id}/assign`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ salesPersonId: "self" })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    fetchRequestDetails()
                }
            }
        } catch (error) {
            console.error("Error assigning request:", error)
        } finally {
            setActionLoading(false)
        }
    }

    // Check if there are any pending edit approvals
    const hasPendingEditApproval = () => {
        if (!request?.editRequests || !Array.isArray(request.editRequests)) return false

        // Check for any edit request with status 'pending_approval'
        return request.editRequests.some(editReq =>
            editReq && editReq.status === 'pending_approval'
        )
    }

    // Check if edit is approved by customer but not by sales
    const isEditApprovedByCustomer = () => {
        if (!request?.editRequests || !Array.isArray(request.editRequests)) return false

        // Get the latest edit request with status 'approved'
        const approvedEditRequests = request.editRequests.filter(editReq =>
            editReq && editReq.status === 'approved'
        )

        if (approvedEditRequests.length === 0) return false

        // Get the latest approved edit request
        const latestApprovedEditRequest = approvedEditRequests.sort((a, b) =>
            new Date(b.requestedAt || b.createdAt) - new Date(a.requestedAt || a.createdAt)
        )[0]

        return latestApprovedEditRequest && request.status === 'pending_edit_approval'
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not set"
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'pending_edit_approval': return 'bg-orange-100 text-orange-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'quotation_sent': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'medium': return 'bg-blue-100 text-blue-800'
            case 'low': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />
            case 'pending_edit_approval': return <AlertCircle className="w-4 h-4" />
            case 'in_progress': return <Package className="w-4 h-4" />
            case 'completed': return <CheckCircle className="w-4 h-4" />
            case 'cancelled': return <AlertCircle className="w-4 h-4" />
            case 'quotation_sent': return <FileText className="w-4 h-4" />
            default: return null
        }
    }

    if (loading) {
        return (
            <DashboardLayout activeMenu="sales">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading request details...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!request) {
        return (
            <DashboardLayout activeMenu="sales">
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Request Not Found</h3>
                    <p className="text-gray-600 mb-6">The request you're looking for doesn't exist or you don't have access.</p>
                    <Link
                        href="/sales/dashboard/customer-requests"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Requests
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    // Calculate totals
    const totalItems = request.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)
    const totalAmount = request.items.reduce((sum, item) => sum + (item.totalEstimatedPrice || 0), 0)

    return (
        <DashboardLayout activeMenu="sales">
            <div className="space-y-6">
                {/* Edit Request Modal */}
                <EditRequestModal
                    request={request}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditRequestSuccess}
                />

                {request && (
                    <QuotationPopup
                        request={request}
                        isOpen={showQuotationPopup}
                        onClose={() => setShowQuotationPopup(false)}
                        onSave={handleQuotationSave}
                        onSend={handleQuotationSend}
                        className={'bg-grey'}
                    />
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href="/sales/dashboard/customer-requests"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Requests
                            </Link>
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 rounded text-gray-700">
                                {request.requestId}
                            </span>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900">Request Details</h1>
                        <p className="text-gray-600 mt-1">Manage customer request and communication</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRequestDetails}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Request Details (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status & Actions Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(request.status)}
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {/* Edit Request Button - Show for certain statuses */}
                                    {request.status !== 'completed' && request.status !== 'cancelled' && request.status != 'in_progress'  && (
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Request
                                        </button>
                                    )}

                                    {/* Approve Edit Button - Show only when in pending_edit_approval */}
                                    {request.status === 'pending_edit_approval' && (
                                        <ApproveEditButton
                                            requestId={request._id}
                                            onApproveSuccess={handleApproveSuccess}
                                            isDisabled={!isEditApprovedByCustomer() || hasPendingEditApproval()}
                                            isApprovedByCustomer={isEditApprovedByCustomer()}
                                        />
                                    )}

                                    {/* Regular action buttons */}
                                    {request.status === 'pending' && request.status !== 'pending_edit_approval' && !hasPendingEditApproval() && (
                                        <button
                                            onClick={() => handleStatusUpdate('in_progress')}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Start Processing
                                        </button>
                                    )}

                                    {request.status !== 'cancelled' && request.status !== 'pending_edit_approval' && request.status != 'in_progress' && !hasPendingEditApproval() && (
                                        <button
                                            onClick={() => handleStatusUpdate('cancelled')}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Cancel Request
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Section */}
                            

                            {/* Edit Request Status Banner */}

                            {request.status === 'pending_edit_approval' && (
                                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-orange-900">Edit Request Pending Approval</div>
                                            <div className="text-sm text-orange-700 mt-1">
                                                {isEditApprovedByCustomer() ?
                                                    "Customer has approved the edit request. Please click 'Approve & Move Further' to proceed with the changes." :
                                                    "This request has pending changes waiting for customer approval. Once approved, you can proceed with processing."
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>

                        <QuotationInfoCard 
                            request={request}
                            onQuotationUpdate={fetchRequestDetails}
                        />

                        {/* Edit Request History Toggle */}
                        {request.editRequests && request.editRequests.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Edit Request History</div>
                                            <div className="text-sm text-gray-600">
                                                {request.editRequests.length} edit request(s)
                                            </div>
                                        </div>
                                    </div>
                                    {showHistory ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>

                                {showHistory && (
                                    <div className="p-6 border-t border-gray-200">
                                        <EditRequestHistory requestId={request._id} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customer Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Customer Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Contact Details</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{request.customerInfo.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <a href={`mailto:${request.customerInfo.email}`} className="text-blue-600 hover:underline">
                                                    {request.customerInfo.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <a href={`tel:${request.customerInfo.phone}`} className="text-blue-600 hover:underline">
                                                    {request.customerInfo.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    Preferred: {request.customerInfo.preferredContactMethod === 'phone' ? 'Phone Call' :
                                                        request.customerInfo.preferredContactMethod === 'email' ? 'Email' : 'WhatsApp'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Delivery Address</div>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <div>{request.customerInfo.address}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {request.customerInfo.city}, {request.customerInfo.postalCode}
                                                    </div>
                                                </div>
                                            </div>
                                            {request.customerInfo.deliveryDeadline && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-700">Delivery Deadline</div>
                                                        <div className="text-gray-900">{formatDate(request.customerInfo.deliveryDeadline)}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {request.customerInfo.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Additional Notes</div>
                                    <p className="text-gray-600">{request.customerInfo.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items ({totalItems} items)
                            </h2>

                            <div className="space-y-6">
                                {request.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{item.stockItemName}</div>
                                                <div className="text-sm text-gray-600">{item.stockItemReference}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900">
                                                    {formatCurrency(item.totalEstimatedPrice || 0)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {item.totalQuantity || 0} items
                                                </div>
                                            </div>
                                        </div>

                                        {/* Variants */}
                                        <div className="space-y-3">
                                            {item.variants.map((variant, variantIndex) => (
                                                <div key={variantIndex} className="pl-4 border-l-2 border-gray-300">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm text-gray-900">
                                                                {variant.attributes.map((attr, attrIndex) => (
                                                                    <span key={attrIndex} className="mr-3">
                                                                        <span className="text-gray-600">{attr.name}:</span>
                                                                        <span className="font-medium ml-1">{attr.value}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {variant.specialInstructions?.filter(inst => inst.trim()).length > 0 && (
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    <span className="font-medium">Instructions:</span>
                                                                    {variant.specialInstructions.filter(inst => inst.trim()).map((inst, instIndex) => (
                                                                        <div key={instIndex} className="ml-2">• {inst}</div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            {variant.quantity} × {formatCurrency(variant.estimatedPrice / variant.quantity)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Order Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900">Order Total</div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {formatCurrency(totalAmount)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Notes (1/3 width) */}
                    <div className="space-y-6">
                        {/* Timeline */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Request Created</div>
                                        <div className="text-sm text-gray-600">{formatDate(request.createdAt)}</div>
                                    </div>
                                </div>

                                {request.updatedAt !== request.createdAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Last Updated</div>
                                            <div className="text-sm text-gray-600">{formatDate(request.updatedAt)}</div>
                                        </div>
                                    </div>
                                )}

                                {request.estimatedCompletion && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Estimated Completion</div>
                                            <div className="text-sm text-gray-600">{formatDate(request.estimatedCompletion)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Communication</h2>

                            {/* Add Note Form */}
                            <div className="mb-6">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add a note or update about this request..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={updating || !notes.trim()}
                                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? "Adding..." : "Add Note"}
                                </button>
                            </div>

                            {/* Existing Notes */}
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {request.notes && request.notes.length > 0 ? (
                                    [...request.notes].reverse().map((note, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {note.addedByModel === 'SalesDepartment' ? 'Sales Team' : 'Customer'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(note.createdAt)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{note.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No notes yet. Add the first note above.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link
                                    href={`/sales/dashboard/customer-requests/${params.id}/quotation`}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Create Quotation</div>
                                            <div className="text-sm text-gray-600">Generate price quotation</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                </Link>

                                <Link
                                    href={`/sales/dashboard/customer-requests/${params.id}/message`}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Send className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Send Message</div>
                                            <div className="text-sm text-gray-600">Email or SMS customer</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                                </Link>

                                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Create Invoice</div>
                                            <div className="text-sm text-gray-600">Generate payment invoice</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}