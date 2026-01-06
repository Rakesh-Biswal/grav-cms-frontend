// components/sales/QuotationPopup.js - UPDATED (Removed shipping, show charges directly)
import { useState, useEffect } from "react"
import {
  X, FileText, Download, Printer, Send, Edit, Save, Plus, Trash2,
  DollarSign, Percent, Calendar, Clock, ChevronDown, ChevronUp,
  Package, AlertCircle, CheckCircle, XCircle, MoreVertical
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Helper function to separate GST from price
const separateGSTFromPrice = (priceIncludingGST, gstPercentage) => {
  if (!gstPercentage || gstPercentage === 0) {
    return {
      priceBeforeGST: priceIncludingGST,
      gstAmount: 0
    };
  }

  const priceBeforeGST = (priceIncludingGST * 100) / (100 + gstPercentage);
  const gstAmount = priceIncludingGST - priceBeforeGST;

  return {
    priceBeforeGST: parseFloat(priceBeforeGST.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2))
  };
};

export default function QuotationPopup({ request, quotation, isOpen, onClose, onSave, onSend }) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(true)
  const [stockItemsData, setStockItemsData] = useState({})

  // Check if we're editing an existing quotation
  const isEditingQuotation = !!quotation;

  // Quotation form state - UPDATED: removed shippingCharges field
  const [formData, setFormData] = useState({
    quotationNumber: `QT-${request?.requestId || ''}-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotalBeforeGST: 0,
    totalDiscount: 0,
    totalGST: 0,
    customAdditionalCharges: [], // Custom charges only, no shipping
    grandTotal: 0,
    paymentSchedule: [],
    notes: '',
    termsAndConditions: `1. Prices are valid for 24 Hours from quotation date.\n2. Payment terms: 60% advance, 40% before delivery.\n3. Delivery within 30 days after order confirmation.\n4. GST applicable as per product rates.\n5. Colors may vary slightly from displayed samples.\n6. Minimum order quantity applies.`
  })

  const [newItem, setNewItem] = useState({
    stockItemId: '',
    itemName: '',
    itemCode: '',
    hsnCode: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
    gstPercentage: 18,
    priceBeforeGST: 0,
    gstAmount: 0,
    priceIncludingGST: 0
  })

  // ADDED: New custom charge state
  const [newCustomCharge, setNewCustomCharge] = useState({
    name: '',
    amount: 0,
    description: ''
  })

  const [newPaymentStep, setNewPaymentStep] = useState({
    name: '',
    percentage: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  // Fetch stock item details
  const fetchStockItemDetails = async (itemId) => {
    try {
      const id = itemId?._id ? itemId._id : itemId;
      const response = await fetch(`${API_URL}/api/cms/stock-items/${id}`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return data.stockItem
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching stock item:", error)
      return null
    }
  }

  // Initialize with request items and fetch stock data
  useEffect(() => {
    const initializeQuotation = async () => {
      if (isEditingQuotation && quotation) {
        // If editing an existing quotation, populate form with its data
        setFormData({
          ...quotation,
          date: new Date(quotation.date).toISOString().split('T')[0],
          validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
          // Ensure payment schedule dates are formatted correctly
          paymentSchedule: quotation.paymentSchedule.map(payment => ({
            ...payment,
            dueDate: new Date(payment.dueDate).toISOString().split('T')[0]
          })),
          // ADDED: Ensure customAdditionalCharges exists
          customAdditionalCharges: quotation.customAdditionalCharges || []
        });

        // If quotation has items, fetch updated stock info
        if (quotation.items && quotation.items.length > 0) {
          const stockData = {};
          for (const item of quotation.items) {
            if (item.stockItemId) {
              const stockItem = await fetchStockItemDetails(item.stockItemId);
              if (stockItem) {
                stockData[item.stockItemId] = stockItem;
              }
            }
          }
          setStockItemsData(stockData);
        }
      } else if (request?.items && request.items.length > 0) {
        // NEW: Check if request already has a quotation
        if (request.quotations && request.quotations.length > 0) {
          // Edit existing quotation instead of creating new
          const existingQuotation = request.quotations[0];
          setFormData({
            ...existingQuotation,
            date: new Date(existingQuotation.date).toISOString().split('T')[0],
            validUntil: new Date(existingQuotation.validUntil).toISOString().split('T')[0],
            paymentSchedule: existingQuotation.paymentSchedule.map(payment => ({
              ...payment,
              dueDate: new Date(payment.dueDate).toISOString().split('T')[0]
            })),
            customAdditionalCharges: existingQuotation.customAdditionalCharges || []
          });

          // Fetch stock info for existing items
          const stockData = {};
          if (existingQuotation.items && existingQuotation.items.length > 0) {
            for (const item of existingQuotation.items) {
              if (item.stockItemId) {
                const stockItem = await fetchStockItemDetails(item.stockItemId);
                if (stockItem) {
                  stockData[item.stockItemId] = stockItem;
                }
              }
            }
          }
          setStockItemsData(stockData);
        } else {
          // Create new quotation from request items (only if no existing quotation)
          const initialItems = []
          const stockData = {}

          for (const item of request.items) {
            const stockItem = await fetchStockItemDetails(item.stockItemId)
            if (stockItem) {
              stockData[item.stockItemId] = stockItem

              // Extract GST from salesTax (e.g., "5% GST S" → 5)
              const gstPercentage = parseInt(stockItem.salesTax?.match(/(\d+)%/)?.[1] || 18)

              // For each variant
              item.variants.forEach((variant, variantIndex) => {
                const priceIncludingGST = variant.estimatedPrice || 0
                const { priceBeforeGST, gstAmount } = separateGSTFromPrice(priceIncludingGST, gstPercentage)

                initialItems.push({
                  stockItemId: item.stockItemId,
                  itemName: `${item.stockItemName} - ${variant.attributes.map(a => a.value).join(', ')}`,
                  itemCode: item.stockItemReference,
                  hsnCode: stockItem.hsnCode || '',
                  description: item.stockItemName,
                  quantity: variant.quantity,
                  unitPrice: priceIncludingGST / variant.quantity,
                  discountPercentage: 0,
                  gstPercentage: gstPercentage,
                  priceBeforeGST: priceBeforeGST,
                  gstAmount: gstAmount,
                  priceIncludingGST: priceIncludingGST,
                  discountAmount: 0,
                  attributes: variant.attributes,
                  stockInfo: {
                    quantityOnHand: stockItem.quantityOnHand,
                    status: stockItem.status
                  }
                })
              })
            }
          }

          // Calculate totals with custom charges only
          const subtotalBeforeGST = initialItems.reduce((sum, item) => sum + item.priceBeforeGST, 0)
          const totalGST = initialItems.reduce((sum, item) => sum + item.gstAmount, 0)
          const totalCustomCharges = (quotation?.customAdditionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0)
          const grandTotal = subtotalBeforeGST + totalGST + totalCustomCharges

          // Default payment schedule (60% advance, 40% final)
          const defaultPaymentSchedule = [
            {
              stepNumber: 1,
              name: 'Advance Payment',
              percentage: 60,
              amount: (grandTotal * 60) / 100,
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'pending'
            },
            {
              stepNumber: 2,
              name: 'Final Payment',
              percentage: 40,
              amount: (grandTotal * 40) / 100,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'pending'
            }
          ]

          setStockItemsData(stockData)
          setFormData(prev => ({
            ...prev,
            items: initialItems,
            subtotalBeforeGST: parseFloat(subtotalBeforeGST.toFixed(2)),
            totalGST: parseFloat(totalGST.toFixed(2)),
            customAdditionalCharges: quotation?.customAdditionalCharges || [],
            grandTotal: parseFloat(grandTotal.toFixed(2)),
            paymentSchedule: defaultPaymentSchedule
          }))
        }
      }
    }

    if (isOpen) {
      initializeQuotation()
    }
  }, [isOpen, request, quotation, isEditingQuotation])

  // Calculate item totals when newItem changes
  useEffect(() => {
    const quantity = parseFloat(newItem.quantity) || 0
    const unitPrice = parseFloat(newItem.unitPrice) || 0
    const discountPercentage = parseFloat(newItem.discountPercentage) || 0
    const gstPercentage = parseFloat(newItem.gstPercentage) || 18

    const priceIncludingGST = quantity * unitPrice
    const { priceBeforeGST, gstAmount } = separateGSTFromPrice(priceIncludingGST, gstPercentage)
    const discountAmount = priceIncludingGST * (discountPercentage / 100)
    const priceAfterDiscount = priceIncludingGST - discountAmount
    const discountedBreakdown = separateGSTFromPrice(priceAfterDiscount, gstPercentage)

    setNewItem(prev => ({
      ...prev,
      priceBeforeGST: discountedBreakdown.priceBeforeGST,
      gstAmount: discountedBreakdown.gstAmount,
      priceIncludingGST: priceAfterDiscount,
      discountAmount: discountAmount
    }))
  }, [newItem.quantity, newItem.unitPrice, newItem.discountPercentage, newItem.gstPercentage])

  // Calculate form totals when items or custom charges change
  useEffect(() => {
    const subtotalBeforeGST = formData.items.reduce((sum, item) => sum + (item.priceBeforeGST || 0), 0)
    const totalDiscount = formData.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
    const totalGST = formData.items.reduce((sum, item) => sum + (item.gstAmount || 0), 0)
    const totalCustomCharges = formData.customAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0)

    const grandTotal = subtotalBeforeGST + totalGST + totalCustomCharges

    // Update payment schedule amounts
    const updatedPaymentSchedule = formData.paymentSchedule.map(payment => ({
      ...payment,
      amount: (grandTotal * payment.percentage) / 100
    }))

    setFormData(prev => ({
      ...prev,
      subtotalBeforeGST: parseFloat(subtotalBeforeGST.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      totalGST: parseFloat(totalGST.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      paymentSchedule: updatedPaymentSchedule
    }))
  }, [formData.items, formData.customAdditionalCharges])

  // ADDED: Handle add custom charge
  const handleAddCustomCharge = () => {
    if (!newCustomCharge.name || newCustomCharge.amount <= 0) {
      alert("Please enter charge name and amount")
      return
    }

    setFormData(prev => ({
      ...prev,
      customAdditionalCharges: [...prev.customAdditionalCharges, { ...newCustomCharge }]
    }))

    // Reset form
    setNewCustomCharge({
      name: '',
      amount: 0,
      description: ''
    })
  }

  // ADDED: Handle remove custom charge
  const handleRemoveCustomCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      customAdditionalCharges: prev.customAdditionalCharges.filter((_, i) => i !== index)
    }))
  }

  const handleAddItem = () => {
    if (!newItem.itemName || !newItem.itemCode || newItem.unitPrice <= 0) {
      alert("Please fill in item name, code, and unit price")
      return
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }))

    // Reset new item form
    setNewItem({
      stockItemId: '',
      itemName: '',
      itemCode: '',
      hsnCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      gstPercentage: 18,
      priceBeforeGST: 0,
      gstAmount: 0,
      priceIncludingGST: 0
    })
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...formData.items]
    const item = updatedItems[index]

    // Update the field
    item[field] = value

    // Recalculate if quantity, price, discount, or GST changes
    if (['quantity', 'unitPrice', 'discountPercentage', 'gstPercentage'].includes(field)) {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unitPrice) || 0
      const discountPercentage = parseFloat(item.discountPercentage) || 0
      const gstPercentage = parseFloat(item.gstPercentage) || 18

      const priceIncludingGST = quantity * unitPrice
      const { priceBeforeGST, gstAmount } = separateGSTFromPrice(priceIncludingGST, gstPercentage)
      const discountAmount = priceIncludingGST * (discountPercentage / 100)
      const priceAfterDiscount = priceIncludingGST - discountAmount
      const discountedBreakdown = separateGSTFromPrice(priceAfterDiscount, gstPercentage)

      item.priceBeforeGST = discountedBreakdown.priceBeforeGST
      item.gstAmount = discountedBreakdown.gstAmount
      item.priceIncludingGST = priceAfterDiscount
      item.discountAmount = discountAmount
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }))
  }

  const handleAddPaymentStep = () => {
    if (!newPaymentStep.name || newPaymentStep.percentage <= 0) {
      alert("Please enter payment step name and percentage")
      return
    }

    // Check if total percentage exceeds 100
    const currentTotal = formData.paymentSchedule.reduce((sum, payment) => sum + payment.percentage, 0)
    if (currentTotal + newPaymentStep.percentage > 100) {
      alert("Total payment percentage cannot exceed 100%")
      return
    }

    const newStep = {
      stepNumber: formData.paymentSchedule.length + 1,
      name: newPaymentStep.name,
      percentage: newPaymentStep.percentage,
      amount: (formData.grandTotal * newPaymentStep.percentage) / 100,
      dueDate: newPaymentStep.dueDate,
      status: 'pending'
    }

    setFormData(prev => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newStep]
    }))

    // Reset form
    setNewPaymentStep({
      name: '',
      percentage: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
  }

  const handleRemovePaymentStep = (index) => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter((_, i) => i !== index)
    }))
  }

  // UPDATED: Save/Update quotation (only one quotation per request)
  const handleSaveQuotation = async () => {
    try {
      setLoading(true)

      // Always use PUT for update since we only allow one quotation
      const method = 'POST';
      const url = `${API_URL}/api/cms/sales/requests/${request._id}/quotation`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          customerInfo: request.customerInfo,
          status: isEditingQuotation ? formData.status : 'draft' // Keep existing status when editing
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(isEditingQuotation ? "Quotation updated successfully!" : "Quotation saved successfully!");
          if (onSave) onSave(data.quotation)
        }
      }
    } catch (error) {
      console.error("Error saving quotation:", error)
      alert(isEditingQuotation ? "Failed to update quotation" : "Failed to save quotation")
    } finally {
      setLoading(false)
    }
  }

  const handleSendQuotation = async () => {
    if (!confirm("Are you sure you want to send this quotation to the customer?")) return

    try {
      setSending(true)

      // Send the quotation
      const response = await fetch(`${API_URL}/api/cms/sales/requests/${request._id}/quotation/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          quotation: {
            ...formData,
            status: 'sent_to_customer'
          },
          customerInfo: request.customerInfo
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert("Quotation sent successfully!")
          if (onSend) onSend()
        }
      }
    } catch (error) {
      console.error("Error sending quotation:", error)
      alert("Failed to send quotation")
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditingQuotation ? `Edit Quotation: ${quotation?.quotationNumber || formData.quotationNumber}` :
                  formData.quotationNumber ? `Edit Quotation: ${formData.quotationNumber}` : 'Create Quotation'}
              </h2>
              <p className="text-sm text-gray-600">
                For Request: {request?.requestId} | Customer: {request?.customerInfo?.name}
              </p>
              
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Company & Quotation Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-blue-900 mb-2">Grav Clothing</div>
              <div className="text-sm text-blue-700">123 Fashion Street, Mumbai</div>
              <div className="text-sm text-blue-700">Maharashtra, India - 400001</div>
              <div className="text-sm text-blue-700">GSTIN: 27AABCU9603R1ZM</div>
              <div className="text-sm text-blue-700">Phone: +91 22 1234 5678</div>
              <div className="text-sm text-blue-700">Email: sales@gravclothing.com</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-700">Quotation #</div>
                <div className="text-lg font-bold text-gray-900">{formData.quotationNumber}</div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-600">Date</div>
                <div className="text-sm font-medium text-gray-900">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-600">Valid Until</div>
                <div className="text-sm font-medium text-gray-900">
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Customer Name</div>
                <div className="text-gray-900">{request?.customerInfo?.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Email</div>
                <div className="text-gray-900">{request?.customerInfo?.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Phone</div>
                <div className="text-gray-900">{request?.customerInfo?.phone}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Address</div>
                <div className="text-gray-900">{request?.customerInfo?.address}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                onClick={() => setEditing(!editing)}
                disabled={isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                title={isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status) ? 'Only draft or sent quotations can be edited' : ''}
              >
                <Edit className="w-4 h-4" />
                {editing ? 'Done Editing' : 'Edit Items'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disc %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    {editing && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>}
                    {editing && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editing ? (
                          <div>
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => handleUpdateItem(index, 'itemName', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {item.attributes.map((attr, idx) => (
                                <span key={idx} className="mr-2">
                                  {attr.name}: {attr.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{item.itemName}</div>
                            <div className="text-sm text-gray-600">Code: {item.itemCode}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.attributes.map((attr, idx) => (
                                <span key={idx} className="mr-2">
                                  {attr.name}: {attr.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">{item.hsnCode || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                            min="1"
                          />
                        ) : (
                          <div className="text-gray-900">{item.quantity}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 border rounded px-2 py-1 text-sm"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-gray-900">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            value={item.discountPercentage}
                            onChange={(e) => handleUpdateItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                            min="0"
                            max="100"
                          />
                        ) : (
                          <div className="text-gray-900">{item.discountPercentage}%</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            value={item.gstPercentage}
                            onChange={(e) => handleUpdateItem(index, 'gstPercentage', parseFloat(e.target.value) || 18)}
                            className="w-20 border rounded px-2 py-1 text-sm"
                            min="0"
                            max="100"
                          />
                        ) : (
                          <div className="text-gray-900">{item.gstPercentage}%</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">₹{(item.priceIncludingGST || 0).toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-600">
                          Base: ₹{(item.priceBeforeGST || 0).toLocaleString('en-IN')} +
                          GST: ₹{(item.gstAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      {editing && (
                        <td className="px-4 py-3">
                          {item.stockInfo && (
                            <div className="text-xs">
                              <div className={`px-2 py-1 rounded ${item.stockInfo.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                                item.stockInfo.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {item.stockInfo.quantityOnHand || 0} units
                              </div>
                            </div>
                          )}
                        </td>
                      )}
                      {editing && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Item Form (only in edit mode) */}
            
          </div>

          {/* Custom Additional Charges Section - ALWAYS VISIBLE */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Charges</h3>
              {/* NO EDIT BUTTON NEEDED - Form is always visible */}
            </div>

            {/* Display existing charges */}
            {formData.customAdditionalCharges.length > 0 ? (
              <div className="space-y-3 mb-6">
                {formData.customAdditionalCharges.map((charge, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{charge.name}</div>
                      {charge.description && (
                        <div className="text-sm text-gray-600 mt-1">{charge.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{(charge.amount || 0).toLocaleString('en-IN')}</div>
                    </div>
                    {/* Remove button (always visible when editing) */}
                    {editing && (
                      <button
                        onClick={() => handleRemoveCustomCharge(index)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg mb-6">
                No additional charges added
              </div>
            )}

            {/* Add Custom Charge Form - ALWAYS VISIBLE WHEN EDITING */}
            {editing && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <h4 className="font-medium text-gray-900 mb-3">Add New Charge</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Charge Name</label>
                    <input
                      type="text"
                      value={newCustomCharge.name}
                      onChange={(e) => setNewCustomCharge(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="e.g., Shipping, Handling, Tax, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={newCustomCharge.amount}
                      onChange={(e) => setNewCustomCharge(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newCustomCharge.description}
                      onChange={(e) => setNewCustomCharge(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Charges will be added to the grand total
                  </span>
                  <button
                    onClick={handleAddCustomCharge}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Charge
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Schedule Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowPaymentSchedule(!showPaymentSchedule)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Payment Schedule</div>
                  <div className="text-sm text-gray-600">
                    {formData.paymentSchedule.length} payment step(s) configured
                  </div>
                </div>
              </div>
              {showPaymentSchedule ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showPaymentSchedule && (
              <div className="mt-4 space-y-4">
                {/* Payment Steps List */}
                {formData.paymentSchedule.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {payment.stepNumber}. {payment.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Due: {payment.dueDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{(payment.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.percentage}%
                      </div>
                    </div>
                    {editing && (
                      <button
                        onClick={() => handleRemovePaymentStep(index)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Payment Step Form */}
                {editing && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                    <h4 className="font-medium text-gray-900 mb-3">Add Payment Step</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Step Name</label>
                        <input
                          type="text"
                          value={newPaymentStep.name}
                          onChange={(e) => setNewPaymentStep(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="e.g., Advance, Final, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage %</label>
                        <input
                          type="number"
                          value={newPaymentStep.percentage}
                          onChange={(e) => setNewPaymentStep(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={newPaymentStep.dueDate}
                          onChange={(e) => setNewPaymentStep(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAddPaymentStep}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Step
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Current total: {formData.paymentSchedule.reduce((sum, p) => sum + p.percentage, 0)}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals Section - UPDATED: Removed shipping charges */}
          <div className="mb-8">
            <div className="max-w-md ml-auto">
              <div className="space-y-3 bg-gray-50 p-6 rounded-lg border border-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (before GST):</span>
                  <span className="font-medium">₹{formData.subtotalBeforeGST.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-medium text-red-600">-₹{formData.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total GST:</span>
                  <span className="font-medium">₹{formData.totalGST.toLocaleString('en-IN')}</span>
                </div>
                
                {/* Custom Additional Charges */}
                {formData.customAdditionalCharges.length > 0 && (
                  <div className="border-t pt-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Additional Charges:</div>
                    {formData.customAdditionalCharges.map((charge, index) => (
                      <div key={index} className="flex justify-between mb-1">
                        <span className="text-gray-600">{charge.name}:</span>
                        <span className="font-medium">₹{(charge.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>₹{formData.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    (Base: ₹{formData.subtotalBeforeGST.toLocaleString('en-IN')} +
                    GST: ₹{formData.totalGST.toLocaleString('en-IN')} +
                    Additional: ₹{formData.customAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString('en-IN')})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border rounded px-3 py-2 h-32"
                placeholder="Any additional notes for the customer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                className="w-full border rounded px-3 py-2 h-32"
                placeholder="Terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Quotation Total</div>
              <div className="text-2xl font-bold text-gray-900">₹{formData.grandTotal.toLocaleString('en-IN')}</div>
              <div className="text-sm text-gray-600 mt-1">
                Payment Steps: {formData.paymentSchedule.length} •
                Total: {formData.paymentSchedule.reduce((sum, p) => sum + p.percentage, 0)}%
                {formData.customAdditionalCharges.length > 0 && (
                  <span className="ml-2">
                    • Additional Charges: {formData.customAdditionalCharges.length}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuotation}
                disabled={loading || (isEditingQuotation && formData.status !== 'draft')}
                className={`flex items-center gap-2 px-6 py-2 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${isEditingQuotation && formData.status !== 'draft' ? 'bg-gray-500' : 'bg-blue-600'
                  }`}
                title={isEditingQuotation && formData.status !== 'draft' ? 'Only draft quotations can be edited' : ''}
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditingQuotation ? 'Update Quotation' : 'Save Draft'}
                  </>
                )}
              </button>
              <button
                onClick={handleSendQuotation}
                disabled={sending || (isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status))}
                className={`flex items-center gap-2 px-6 py-2 text-white rounded-md hover:bg-green-700 disabled:opacity-50 ${isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status) ? 'bg-gray-500' : 'bg-green-600'
                  }`}
                title={isEditingQuotation && !['draft', 'sent_to_customer'].includes(formData.status) ? 'Only draft or sent quotations can be re-sent' : ''}
              >
                {sending ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4" />
                    {isEditingQuotation && formData.status === 'sent_to_customer' ? 'Resend to Customer' : 'Send to Customer'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}