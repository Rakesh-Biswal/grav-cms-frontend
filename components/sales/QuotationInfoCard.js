// components/sales/QuotationInfoCard.js - UPDATED with Payment Breakdown
import { useState, useEffect } from "react"
import { 
  FileText, CheckCircle, Clock, AlertCircle, Eye, Download, Send, 
  ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, DollarSign, 
  Check, X, MoreVertical, Upload, Receipt, CreditCard, Expand, 
  ChevronRight, User, Calendar, FileCheck, ShieldCheck, Banknote
} from "lucide-react"
import QuotationPopup from "./QuotationPopup"
import QuotationPDFDownload from "./QuotationPDFGenerator"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Payment Submission Status Component (unchanged)
const PaymentSubmissionStatus = ({ submission, onStatusUpdate }) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true)
      const response = await fetch(`${API_URL}/api/cms/sales/payment-submissions/${submission._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && onStatusUpdate) {
          onStatusUpdate()
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdating(false)
      setShowStatusDropdown(false)
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending'
        }
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Check className="w-4 h-4" />,
          label: 'Verified'
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <X className="w-4 h-4" />,
          label: 'Rejected'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />,
          label: 'Unknown'
        }
    }
  }

  const statusConfig = getStatusConfig(submission.status)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.color} flex items-center gap-1`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          disabled={updating}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      {showStatusDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleStatusUpdate('verified')}
              disabled={updating || submission.status === 'verified'}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Mark as Verified
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={updating || submission.status === 'rejected'}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Mark as Rejected
            </button>
            <button
              onClick={() => handleStatusUpdate('pending')}
              disabled={updating || submission.status === 'pending'}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              Mark as Pending
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// NEW: Payment Step Component
const PaymentStepCard = ({ step, paymentSubmissions, request, quotation, onRefresh }) => {
  const [expanded, setExpanded] = useState(false)
  
  // Find submissions for this payment step
  const stepSubmissions = paymentSubmissions.filter(sub => 
    sub.paymentStepNumber === step.stepNumber
  )

  const getStepStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partially_paid': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'partially_paid': return <DollarSign className="w-4 h-4" />
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'overdue': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Payment Step {step.stepNumber}: {step.description}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${getStepStatusColor(step.status)}`}>
                {getStepStatusIcon(step.status)}
                {step.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                Amount: ₹{step.amount.toLocaleString()}
                {step.paidAmount > 0 && (
                  <span className="ml-2 text-green-600">
                    (Paid: ₹{step.paidAmount.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stepSubmissions.length > 0 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {stepSubmissions.length} submission{stepSubmissions.length > 1 ? 's' : ''}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Payment Submission Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {stepSubmissions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Payment Submissions</h4>
                <span className="text-sm text-gray-600">
                  Due Date: {new Date(step.dueDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              
              {stepSubmissions.map((submission, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        Submission #{index + 1}
                      </span>
                      <PaymentSubmissionStatus 
                        submission={submission} 
                        onStatusUpdate={onRefresh}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(submission.submissionDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Submitted Amount</div>
                      <div className="font-medium text-gray-900">
                        ₹{submission.submittedAmount.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Payment Method</div>
                      <div className="font-medium text-gray-900 flex items-center gap-1">
                        {submission.paymentMethod === 'online' ? (
                          <Banknote className="w-3 h-3" />
                        ) : submission.paymentMethod === 'cash' ? (
                          <DollarSign className="w-3 h-3" />
                        ) : (
                          <CreditCard className="w-3 h-3" />
                        )}
                        {submission.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Transaction ID</div>
                      <div className="font-medium text-gray-900">
                        {submission.transactionId || 'N/A'}
                      </div>
                    </div>
                    
                    {submission.bankName && (
                      <div>
                        <div className="text-xs text-gray-500">Bank Name</div>
                        <div className="font-medium text-gray-900">
                          {submission.bankName}
                        </div>
                      </div>
                    )}
                    
                    {submission.chequeNumber && (
                      <div>
                        <div className="text-xs text-gray-500">Cheque Number</div>
                        <div className="font-medium text-gray-900">
                          {submission.chequeNumber}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs text-gray-500">UTR/Reference</div>
                      <div className="font-medium text-gray-900">
                        {submission.utrReference || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {submission.notes && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Customer Notes</div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {submission.notes}
                      </div>
                    </div>
                  )}
                  
                  {submission.verificationNotes && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Verification Notes</div>
                      <div className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {submission.verificationNotes}
                      </div>
                    </div>
                  )}
                  
                  {submission.receiptImage && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Receipt/Proof</div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={submission.receiptImage} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          <Receipt className="w-4 h-4" />
                          View Receipt
                        </a>
                        {submission.receiptImage.toLowerCase().endsWith('.pdf') ? (
                          <a 
                            href={submission.receiptImage}
                            download
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      Submitted: {new Date(submission.submissionDate).toLocaleString('en-IN')}
                    </div>
                    {submission.verifiedAt && (
                      <div>
                        Verified: {new Date(submission.verifiedAt).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="font-medium text-gray-900 mb-1">No Submissions Yet</div>
              <p className="text-sm text-gray-600">
                Customer has not submitted payment for this step yet
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Due Date: {new Date(step.dueDate).toLocaleDateString('en-IN')}
              </div>
            </div>
          )}
          
          {/* Payment Step Summary */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">Step Amount</div>
                <div className="font-bold text-lg text-gray-900">
                  ₹{step.amount.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">Amount Paid</div>
                <div className="font-bold text-lg text-green-600">
                  ₹{step.paidAmount?.toLocaleString() || '0'}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-500">Balance Due</div>
                <div className="font-bold text-lg text-orange-600">
                  ₹{((step.amount || 0) - (step.paidAmount || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuotationInfoCard({ request, onQuotationUpdate }) {
    const [showDetails, setShowDetails] = useState(false)
    const [showQuotationPopup, setShowQuotationPopup] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [paymentSubmissions, setPaymentSubmissions] = useState([])
    const [showPaymentSteps, setShowPaymentSteps] = useState(false)

    // Only one quotation allowed per request
    const quotation = request?.quotations && request.quotations.length > 0
        ? request.quotations[0]
        : null

    // Check if quotation is customer approved
    const isCustomerApproved = quotation?.status === 'customer_approved'
    // Check if payment schedule exists
    const hasPaymentSchedule = quotation?.paymentSchedule && quotation.paymentSchedule.length > 0

    // Fetch payment submissions
    const fetchPaymentSubmissions = async () => {
      if (!quotation?._id) return
      
      try {
        const response = await fetch(`${API_URL}/api/cms/sales/requests/${request._id}/quotation/${quotation._id}/payment-submissions`, {
          credentials: "include"
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPaymentSubmissions(data.submissions)
          }
        }
      } catch (error) {
        console.error("Error fetching payment submissions:", error)
      }
    }

    useEffect(() => {
      if (quotation) {
        fetchPaymentSubmissions()
      }
    }, [quotation])

    const formatDate = (dateString) => {
        if (!dateString) return "Not set"
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'draft':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <FileText className="w-4 h-4" />,
                    label: 'Draft'
                }
            case 'sent_to_customer':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Send className="w-4 h-4" />,
                    label: 'Sent to Customer'
                }
            case 'customer_approved':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <ThumbsUp className="w-4 h-4" />,
                    label: 'Customer Approved'
                }
            case 'sales_approved':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: 'Sales Approved'
                }
            case 'rejected':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <ThumbsDown className="w-4 h-4" />,
                    label: 'Rejected'
                }
            case 'expired':
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Expired'
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <FileText className="w-4 h-4" />,
                    label: 'Unknown'
                }
        }
    }

    const handleSendToCustomer = async () => {
        if (!quotation) return

        if (!confirm("Are you sure you want to send this quotation to the customer?")) return

        try {
            setActionLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${request._id}/quotation/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && onQuotationUpdate) {
                    onQuotationUpdate(data.request)
                }
            }
        } catch (error) {
            console.error("Error sending quotation:", error)
            alert("Failed to send quotation")
        } finally {
            setActionLoading(false)
        }
    }

    const handleSalesApprove = async () => {
        if (!quotation) return

        if (!confirm("Approve this quotation and proceed with order?")) return

        try {
            setActionLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${request._id}/quotation/sales-approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && onQuotationUpdate) {
                    onQuotationUpdate(data.request)
                }
            }
        } catch (error) {
            console.error("Error approving quotation:", error)
            alert("Failed to approve quotation")
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectQuotation = async () => {
        if (!quotation) return

        const reason = prompt("Please enter reason for rejection:")
        if (!reason) return

        try {
            setActionLoading(true)
            const response = await fetch(`${API_URL}/api/cms/sales/requests/${request._id}/quotation/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ reason })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success && onQuotationUpdate) {
                    onQuotationUpdate(data.request)
                }
            }
        } catch (error) {
            console.error("Error rejecting quotation:", error)
            alert("Failed to reject quotation")
        } finally {
            setActionLoading(false)
        }
    }

    // Check if sales approval is required
    const requiresSalesApproval = quotation?.status === 'customer_approved' &&
        !quotation?.salesApproval?.approved

    // Check if quotation is expired
    const isQuotationExpired = quotation?.validUntil &&
        new Date(quotation.validUntil) < new Date()

    // Calculate total additional charges
    const totalAdditionalCharges = quotation?.customAdditionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0

    // Calculate payment summary
    const paymentSummary = hasPaymentSchedule ? {
      totalAmount: quotation.paymentSchedule.reduce((sum, step) => sum + (step.amount || 0), 0),
      totalPaid: quotation.paymentSchedule.reduce((sum, step) => sum + (step.paidAmount || 0), 0),
      totalDue: quotation.paymentSchedule.reduce((sum, step) => sum + ((step.amount || 0) - (step.paidAmount || 0)), 0),
      completedSteps: quotation.paymentSchedule.filter(step => step.status === 'paid').length,
      totalSteps: quotation.paymentSchedule.length
    } : null

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Quotation Popup */}
            {request && (
                <QuotationPopup
                    request={request}
                    quotation={quotation}
                    isOpen={showQuotationPopup}
                    onClose={() => setShowQuotationPopup(false)}
                    onSave={onQuotationUpdate}
                    onSend={onQuotationUpdate}
                />
            )}

            {/* Header */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quotation ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                        <FileText className={`w-5 h-5 ${quotation ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Quotation Details</div>
                        <div className="text-sm text-gray-600">
                            {quotation ? (
                                <span>
                                  1 quotation created •
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusConfig(quotation.status).color}`}>
                                        {getStatusConfig(quotation.status).label}
                                    </span>
                                    {isCustomerApproved && hasPaymentSchedule && (
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                        Payment Plan: {paymentSummary.completedSteps}/{paymentSummary.totalSteps} steps
                                      </span>
                                    )}
                                </span>
                            ) : (
                                "No quotation created yet"
                            )}
                        </div>
                    </div>
                </div>
                {showDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {/* Expanded Content */}
            {showDetails && (
                <div className="p-6 border-t border-gray-200 space-y-6">
                    {/* No Quotation State */}
                    {!quotation && (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <div className="font-medium text-gray-900 mb-2">No Quotation Created</div>
                            <p className="text-gray-600 mb-6">Create a quotation to send to the customer</p>
                            <button
                                onClick={() => setShowQuotationPopup(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Create Quotation
                            </button>
                        </div>
                    )}

                    {/* Has Quotation State */}
                    {quotation && (
                        <>
                            {/* Quotation Header */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-blue-900 mb-1">Quotation Number</div>
                                    <div className="text-lg font-bold text-blue-900">{quotation.quotationNumber}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700 mb-1">Total Amount</div>
                                    <div className="text-lg font-bold text-gray-900">{formatCurrency(quotation.grandTotal)}</div>
                                    {totalAdditionalCharges > 0 && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        Includes ₹{formatCurrency(totalAdditionalCharges)} additional charges
                                      </div>
                                    )}
                                </div>
                                <div className={`p-4 rounded-lg ${isQuotationExpired ? 'bg-red-50' : 'bg-green-50'
                                    }`}>
                                    <div className="text-sm font-medium mb-1">
                                        {isQuotationExpired ? 'Expired On' : 'Valid Until'}
                                    </div>
                                    <div className={`text-lg font-bold ${isQuotationExpired ? 'text-red-900' : 'text-green-900'
                                        }`}>
                                        {formatDate(quotation.validUntil)}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Steps Section - Show only for customer approved quotations */}
                            {isCustomerApproved && hasPaymentSchedule && (
                              <div className="border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => setShowPaymentSteps(!showPaymentSteps)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <CreditCard className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">Payment Breakdown</div>
                                      <div className="text-sm text-gray-600">
                                        {paymentSummary.totalSteps} payment steps • 
                                        Total: {formatCurrency(paymentSummary.totalAmount)} •
                                        Paid: {formatCurrency(paymentSummary.totalPaid)} •
                                        Due: {formatCurrency(paymentSummary.totalDue)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      paymentSummary.totalDue === 0 ? 'bg-green-100 text-green-800' :
                                      paymentSummary.totalPaid === 0 ? 'bg-yellow-100 text-yellow-800' :
                                      paymentSummary.totalPaid > 0 ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {paymentSummary.totalDue === 0 ? 'Fully Paid' :
                                       paymentSummary.totalPaid === 0 ? 'Payment Pending' :
                                       'Partially Paid'}
                                    </span>
                                    {showPaymentSteps ? (
                                      <ChevronUp className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                </button>

                                {showPaymentSteps && (
                                  <div className="p-4 border-t border-gray-200 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                      <div className="bg-white p-3 border rounded-lg text-center">
                                        <div className="text-xs text-gray-500">Total Amount</div>
                                        <div className="font-bold text-lg text-gray-900">
                                          {formatCurrency(paymentSummary.totalAmount)}
                                        </div>
                                      </div>
                                      <div className="bg-white p-3 border rounded-lg text-center">
                                        <div className="text-xs text-gray-500">Amount Paid</div>
                                        <div className="font-bold text-lg text-green-600">
                                          {formatCurrency(paymentSummary.totalPaid)}
                                        </div>
                                      </div>
                                      <div className="bg-white p-3 border rounded-lg text-center">
                                        <div className="text-xs text-gray-500">Amount Due</div>
                                        <div className="font-bold text-lg text-orange-600">
                                          {formatCurrency(paymentSummary.totalDue)}
                                        </div>
                                      </div>
                                      <div className="bg-white p-3 border rounded-lg text-center">
                                        <div className="text-xs text-gray-500">Progress</div>
                                        <div className="font-bold text-lg text-blue-600">
                                          {paymentSummary.completedSteps}/{paymentSummary.totalSteps}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      {quotation.paymentSchedule.map((step, index) => (
                                        <PaymentStepCard
                                          key={index}
                                          step={step}
                                          paymentSubmissions={paymentSubmissions}
                                          request={request}
                                          quotation={quotation}
                                          onRefresh={fetchPaymentSubmissions}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Additional Charges Display */}
                            {quotation.customAdditionalCharges && quotation.customAdditionalCharges.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-3">Additional Charges</div>
                                <div className="space-y-2">
                                  {quotation.customAdditionalCharges.map((charge, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <div className="font-medium text-gray-900">{charge.name}</div>
                                        {charge.description && (
                                          <div className="text-sm text-gray-600">{charge.description}</div>
                                        )}
                                      </div>
                                      <div className="font-bold text-gray-900">{formatCurrency(charge.amount)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                {quotation.status === 'draft' && (
                                    <>
                                        <button
                                            onClick={() => setShowQuotationPopup(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View/Edit
                                        </button>
                                        <button
                                            onClick={handleSendToCustomer}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                            {actionLoading ? 'Sending...' : 'Send to Customer'}
                                        </button>
                                    </>
                                )}

                                {quotation.status === 'sent_to_customer' && (
                                    <button
                                        onClick={() => setShowQuotationPopup(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                )}

                                {requiresSalesApproval && (
                                    <>
                                        <button
                                            onClick={handleSalesApprove}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {actionLoading ? 'Approving...' : 'Approve Quotation'}
                                        </button>
                                        <button
                                            onClick={handleRejectQuotation}
                                            disabled={actionLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                            {actionLoading ? 'Rejecting...' : 'Reject Quotation'}
                                        </button>
                                    </>
                                )}

                                {quotation.status === 'sales_approved' && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                                        <CheckCircle className="w-4 h-4" />
                                        Quotation Approved - Ready for Production
                                    </div>
                                )}

                                {/* Always show download button */}
                                <QuotationPDFDownload
                                    quotation={quotation}
                                    request={request}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}