"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  ArrowLeft,
  FileText,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Edit,
  ExternalLink,
  Hash,
  Briefcase,
  Globe,
  PhoneCall,
  MessageCircle,
  QrCode
} from "lucide-react"

// Import QRCode component
import QRCode from "qrcode"

// Mock data - in real app, you would fetch this based on ID
const mockCustomerRequests = [
  { 
    id: 1, 
    requestId: "REQ-2024-001",
    organization: "Fashion Retail Ltd.",
    organizationAddress: "123 Mall Road, Connaught Place, Delhi - 110001",
    contactPerson: "Rahul Verma",
    designation: "Purchase Manager",
    email: "rahul@fashionretail.com",
    primaryPhone: "+91 9876543210",
    secondaryPhone: "+91 9876543211",
    website: "www.fashionretail.com",
    date: "2024-01-15",
    products: [
      { name: "Men's Polo T-Shirt", description: "Premium cotton polo with collar, embroidered logo on left chest", size: "M", color: "Navy Blue", quantity: 500, unit: "Pieces", unitPrice: 450, priceUnit: "Per Piece", total: 225000 },
      { name: "Women's Slim Fit Jeans", description: "Stretch denim jeans with branded buttons", size: "30", color: "Dark Blue", quantity: 250, unit: "Pieces", unitPrice: 850, priceUnit: "Per Piece", total: 212500 },
      { name: "Custom Hoodies", description: "Fleece hoodies with kangaroo pocket", size: "L", color: "Black", quantity: 100, unit: "Pieces", unitPrice: 650, priceUnit: "Per Piece", total: 65000 }
    ],
    totalAmount: 502500,
    status: "New",
    priority: "High",
    expectedDelivery: "2024-02-28",
    notes: "Urgent delivery required for summer collection launch. Need fabric samples approved before production. Logo embroidery required on polo t-shirts. All items must be packed individually with polybags.",
    source: "Website Inquiry",
    createdAt: "2024-01-15 10:30 AM",
    lastUpdated: "2024-01-15 10:30 AM"
  },
  { 
    id: 2, 
    requestId: "REQ-2024-002",
    organization: "School Uniforms Inc.",
    organizationAddress: "45 Education Lane, Sector 15, Chandigarh - 160101",
    contactPerson: "Priya Sharma",
    designation: "Procurement Head",
    email: "priya@schooluniforms.in",
    primaryPhone: "+91 9876543211",
    secondaryPhone: "+91 9876543212",
    website: "www.schooluniforms.in",
    date: "2024-01-18",
    products: [
      { name: "School Shirts", description: "White cotton shirts with school logo embroidered", size: "12", color: "White", quantity: 1000, unit: "Pieces", unitPrice: 320, priceUnit: "Per Piece", total: 320000 },
      { name: "School Pants", description: "Navy blue polyester trousers", size: "12", color: "Navy Blue", quantity: 1000, unit: "Pieces", unitPrice: 380, priceUnit: "Per Piece", total: 380000 },
      { name: "School Skirts", description: "Pleated skirts with elastic waist", size: "12", color: "Navy Blue", quantity: 500, unit: "Pieces", unitPrice: 350, priceUnit: "Per Piece", total: 175000 },
      { name: "School Ties", description: "Striped polyester ties", size: "Standard", color: "Navy/White", quantity: 1500, unit: "Pieces", unitPrice: 120, priceUnit: "Per Piece", total: 180000 }
    ],
    totalAmount: 1055000,
    status: "Under Review",
    priority: "Medium",
    expectedDelivery: "2024-03-15",
    notes: "For new academic year starting in April. Need to submit fabric swatches for approval. School logo artwork will be provided separately. Delivery required before March 20th.",
    source: "Email Inquiry",
    createdAt: "2024-01-18 02:15 PM",
    lastUpdated: "2024-01-20 11:00 AM"
  },
]

export default function CustomerOrderRequestViewPage() {
  const router = useRouter()
  const params = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingQR, setGeneratingQR] = useState(false)
  const qrCanvasRef = useRef(null)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const requestId = parseInt(params.id)
      const foundRequest = mockCustomerRequests.find(r => r.id === requestId)
      setRequest(foundRequest)
      setLoading(false)
    }, 500)
  }, [params.id])

  const getStatusColor = (status) => {
    switch(status) {
      case "New": return "bg-blue-100 text-blue-800"
      case "Under Review": return "bg-yellow-100 text-yellow-800"
      case "Pending Measurement": return "bg-purple-100 text-purple-800"
      case "Approved": return "bg-green-100 text-green-800"
      case "In Production": return "bg-indigo-100 text-indigo-800"
      case "Completed": return "bg-gray-100 text-gray-800"
      case "Cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Low": return "bg-gray-100 text-gray-800"
      case "Medium": return "bg-blue-100 text-blue-800"
      case "High": return "bg-orange-100 text-orange-800"
      case "Urgent": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateQR = async () => {
    if (!request) return
    
    try {
      setGeneratingQR(true)
      
      // Get current URL
      const currentUrl = window.location.href
      
      // Create a canvas element for QR code
      const canvas = qrCanvasRef.current
      
      // Generate QR code
      await QRCode.toCanvas(canvas, currentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Convert canvas to data URL and trigger download
      const pngUrl = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${request.requestId}_QR_Code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      // Optional: Show success message
      alert(`QR Code downloaded successfully!\n\nURL encoded: ${currentUrl}`)
      
    } catch (error) {
      console.error("Error generating QR code:", error)
      alert("Failed to generate QR code. Please try again.")
    } finally {
      setGeneratingQR(false)
    }
  }

  // Function to update status
  const handleUpdateStatus = (newStatus) => {
    if (!request) return
    
    // In a real app, you would make an API call here
    alert(`Status would be updated to: ${newStatus}\n\nIn production, this would trigger an API call to update the order status.`)
    
    // For demo purposes, update local state
    setRequest(prev => ({
      ...prev,
      status: newStatus,
      lastUpdated: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }))
  }

  // Function to handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (!request) return
    
    // Format the message
    const message = `Hello ${request.contactPerson},\n\nRegarding your order ${request.requestId} from ${request.organization}.\n\nStatus: ${request.status}\nTotal Amount: ₹${request.totalAmount.toLocaleString('en-IN')}\n\nHow can we assist you further?`
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${request.primaryPhone.replace(/\D/g, '')}?text=${encodedMessage}`
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading request details...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Request Not Found</h3>
                <div className="mt-1 text-sm text-red-700">
                  The requested customer order could not be found.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/inventory/configurations/customer-products-quotation"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requests
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      {/* Hidden canvas for QR code generation */}
      <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
      
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Customer Request Details</h1>
              <p className="text-gray-600 mt-1">Complete view of customer order requirements</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleGenerateQR}
              disabled={generatingQR}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingQR ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Get QR
                </>
              )}
            </button>
            <Link
              href={`/dashboard/inventory/products/customer-order-request`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Request Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 font-mono">{request.requestId}</div>
                      <div className="text-gray-600 mt-1">Customer Order Request</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Priority</div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="text-lg font-bold text-green-700">
                      ₹{request.totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Organization Name</div>
                    <div className="text-base font-medium text-gray-900">{request.organization}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </div>
                    <div className="text-base text-gray-900 whitespace-pre-line">{request.organizationAddress}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Website
                    </div>
                    <div className="text-base text-gray-900">{request.website}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Contact Person</div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-base font-medium text-gray-900">{request.contactPerson}</div>
                        {request.designation && (
                          <div className="text-sm text-gray-600">{request.designation}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    <div className="text-base text-gray-900">{request.email}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Primary Phone
                      </div>
                      <div className="text-base text-gray-900">{request.primaryPhone}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <PhoneCall className="w-4 h-4" />
                        Secondary Phone
                      </div>
                      <div className="text-base text-gray-900">{request.secondaryPhone || "Not provided"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Requirements ({request.products.length} items)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specifications</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {request.products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-1">{product.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              Size: <span className="font-medium">{product.size}</span>
                            </div>
                            <div className="text-sm text-gray-900">
                              Color: <span className="font-medium">{product.color}</span>
                            </div>
                            <div className="text-sm text-gray-900">
                              Unit: <span className="font-medium">{product.unit}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-base font-medium text-gray-900">
                            {product.quantity.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{product.unitPrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.priceUnit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-base font-bold text-green-700">
                            ₹{product.total.toLocaleString('en-IN')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        Total Amount:
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xl font-bold text-green-700">
                          ₹{request.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes Card */}
            {request.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Notes & Requirements
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="text-gray-700 whitespace-pre-line">{request.notes}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Request Date</div>
                    <div className="text-base font-medium text-gray-900">{request.date}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Expected Delivery</div>
                    <div className="text-base font-medium text-gray-900">{request.expectedDelivery}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const deliveryDate = new Date(request.expectedDelivery)
                        const today = new Date()
                        const diffTime = deliveryDate - today
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays > 0 ? `${diffDays} days remaining` : "Past due"
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Request Source</div>
                    <div className="text-base font-medium text-gray-900">{request.source}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleUpdateStatus("Approved")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Approved
                </button>
                
                <button 
                  onClick={() => handleUpdateStatus("In Production")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Mark as In Production
                </button>
                
                <button 
                  onClick={() => handleUpdateStatus("Completed")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
                
                <button 
                  onClick={() => handleUpdateStatus("Cancelled")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Mark as Cancelled
                </button>
                
                <button 
                  onClick={handleWhatsAppContact}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#128C7E] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact on WhatsApp
                </button>
              </div>
            </div>

            {/* QR Info Card */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Information
              </h3>
              
              <div className="space-y-3">
                <div className="text-sm text-green-700">
                  The QR code will contain the current page URL. When scanned, it will open this exact order details page.
                </div>
                
                <div className="text-sm">
                  <div className="font-medium text-green-900 mb-1">Benefits:</div>
                  <ul className="list-disc pl-4 space-y-1 text-green-700">
                    <li>Attach to physical products</li>
                    <li>Quick access to order details</li>
                    <li>Easy identification of product owner</li>
                    <li>Scan to view complete order information</li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <div className="text-xs text-green-600 font-medium">Current URL:</div>
                  <div className="text-xs text-green-800 truncate" title={typeof window !== 'undefined' ? window.location.href : ''}>
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* System Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="text-sm font-medium text-gray-900">{request.createdAt}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">{request.lastUpdated}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Request ID</div>
                  <div className="text-sm font-medium text-gray-900 font-mono">{request.requestId}</div>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Products</span>
                  <span className="text-sm font-medium text-blue-900">{request.products.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Quantity</span>
                  <span className="text-sm font-medium text-blue-900">
                    {request.products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()} units
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Average Price</span>
                  <span className="text-sm font-medium text-blue-900">
                    ₹{(request.totalAmount / request.products.reduce((sum, p) => sum + p.quantity, 0)).toFixed(2)}/unit
                  </span>
                </div>
                
                <div className="pt-3 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-blue-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-900">
                      ₹{request.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Need to make changes?</h4>
              <p className="text-sm text-gray-500 mt-1">Edit this request or create a new quotation.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/inventory/products/customer-order-request"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to List
              </Link>
              <Link
                href={`/dashboard/inventory/products/customer-order-request`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}