"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useState } from "react"
import { ChevronDown, Plus, Trash2, Download, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import { jsPDF } from "jspdf"
import { toPng } from "html-to-image"
import JsBarcode from "jsbarcode"

export default function TenderRegistrationPage() {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    phone: ""
  })

  const [clothCategories, setClothCategories] = useState([
    {
      id: 1,
      categoryName: "",
      items: [
        {
          id: 1,
          color: "",
          quantity: 1,
          size: "",
          operations: [""]
        }
      ]
    }
  ])

  const [generatedBarcodes, setGeneratedBarcodes] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const router = useRouter()

  const dropdownMenus = {
    products: [
      { name: "Raw Items / Materials", action: () => router.push("/project-manager/dashboard/inventory/products/raw-items") },
      { name: "Stock Items / BOM", action: () => router.push("/project-manager/dashboard/inventory/products/stock-items") },
      { name: "Customer Order Request", action: () => router.push("/project-manager/dashboard/inventory/products/customer-order-request") },
    ],
    configurations: [
      { name: "Warehouse Management", action: () => router.push("/project-manager/dashboard/inventory/configurations/warehouse") },
      { name: "Workers / Employees", action: () => router.push("/project-manager/dashboard/inventory/configurations/assigned-team") },
      { name: "Devices / Machines", action: () => router.push("/project-manager/dashboard/inventory/configurations/devices-machines") },
      { name: "Units & Packaging", action: () => router.push("/project-manager/dashboard/inventory/configurations/units-packaging") },
    ],
    operations: [
      { name: "Receipts", action: () => console.log("Navigate to Receipts") },
      { name: "Deliveries", action: () => console.log("Deliveries") },
      { name: "Manufacturings", action: () => console.log("Manufacturings") },
    ],
    reporting: [
      { name: "Stock History", action: () => console.log("Navigate to Stock History") },
      { name: "Stock", action: () => console.log("Navigate to Stock") },
    ],
  }

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  const addClothCategory = () => {
    const newCategory = {
      id: clothCategories.length + 1,
      categoryName: "",
      items: [
        {
          id: 1,
          color: "",
          quantity: 1,
          size: "",
          operations: [""]
        }
      ]
    }
    setClothCategories([...clothCategories, newCategory])
  }

  const removeClothCategory = (categoryId) => {
    if (clothCategories.length === 1) return
    setClothCategories(clothCategories.filter(cat => cat.id !== categoryId))
  }

  const updateCategoryName = (categoryId, value) => {
    setClothCategories(clothCategories.map(cat =>
      cat.id === categoryId ? { ...cat, categoryName: value } : cat
    ))
  }

  const addItemToCategory = (categoryId) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId) {
        const newItem = {
          id: cat.items.length + 1,
          color: "",
          quantity: 1,
          size: "",
          operations: [""]
        }
        return { ...cat, items: [...cat.items, newItem] }
      }
      return cat
    }))
  }

  const removeItemFromCategory = (categoryId, itemId) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId && cat.items.length > 1) {
        return { ...cat, items: cat.items.filter(item => item.id !== itemId) }
      }
      return cat
    }))
  }

  const updateItemField = (categoryId, itemId, field, value) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        }
      }
      return cat
    }))
  }

  const addOperation = (categoryId, itemId) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, operations: [...item.operations, ""] } : item
          )
        }
      }
      return cat
    }))
  }

  const updateOperation = (categoryId, itemId, operationIndex, value) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id === itemId) {
              const newOperations = [...item.operations]
              newOperations[operationIndex] = value
              return { ...item, operations: newOperations }
            }
            return item
          })
        }
      }
      return cat
    }))
  }

  const removeOperation = (categoryId, itemId, operationIndex) => {
    setClothCategories(clothCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id === itemId && item.operations.length > 1) {
              const newOperations = item.operations.filter((_, idx) => idx !== operationIndex)
              return { ...item, operations: newOperations }
            }
            return item
          })
        }
      }
      return cat
    }))
  }

  const generateBarcodeData = () => {
    const barcodes = []
    let barcodeIndex = 1
    
    clothCategories.forEach(category => {
      category.items.forEach(item => {
        if (item.color && item.size && category.categoryName && item.quantity > 0) {
          const operationsCount = item.operations.filter(op => op.trim() !== "").length
          const totalBarcodes = item.quantity * operationsCount
          
          for (let i = 0; i < totalBarcodes; i++) {
            const barcodeNumber = `${Date.now()}-${barcodeIndex++}`
            barcodes.push({
              id: barcodeNumber,
              category: category.categoryName,
              color: item.color,
              size: item.size,
              operation: item.operations[Math.floor(i % operationsCount)],
              pieceNumber: Math.floor(i / operationsCount) + 1,
              totalPieces: item.quantity
            })
          }
        }
      })
    })
    
    setGeneratedBarcodes(barcodes)
    return barcodes
  }

  const generateBarcodes = () => {
    const barcodes = generateBarcodeData()
    
    // Render barcodes after state update
    setTimeout(() => {
      barcodes.forEach(barcode => {
        const canvas = document.getElementById(`barcode-${barcode.id}`)
        if (canvas) {
          JsBarcode(canvas, barcode.id, {
            format: "CODE128",
            displayValue: true,
            fontSize: 12,
            background: "#ffffff",
            lineColor: "#000000"
          })
        }
      })
    }, 100)
  }

  const downloadBarcodesPDF = async () => {
    if (generatedBarcodes.length === 0) {
      generateBarcodes()
      setTimeout(() => downloadBarcodesPDF(), 500)
      return
    }

    const doc = new jsPDF()
    let yPosition = 20
    const margin = 10
    const barcodeWidth = 60
    const barcodeHeight = 40
    const cols = 3
    const spacing = 5

    doc.setFontSize(16)
    doc.text("Clothing Brand - Tender Barcodes", margin, 10)
    doc.setFontSize(10)
    doc.text(`Customer: ${customerInfo.name}`, margin, 15)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 15)

    for (let i = 0; i < generatedBarcodes.length; i++) {
      const barcode = generatedBarcodes[i]
      const col = i % cols
      const row = Math.floor(i / cols)
      
      const x = margin + col * (barcodeWidth + spacing)
      yPosition = 30 + row * (barcodeHeight + 25)

      if (yPosition + barcodeHeight > 280) {
        doc.addPage()
        yPosition = 20
      }

      // Draw barcode background
      doc.setFillColor(255, 255, 255)
      doc.rect(x, yPosition, barcodeWidth, barcodeHeight, 'F')
      
      // Get barcode canvas
      const canvas = document.getElementById(`barcode-${barcode.id}`)
      if (canvas) {
        const imgData = canvas.toDataURL('image/png')
        doc.addImage(imgData, 'PNG', x + 5, yPosition + 5, barcodeWidth - 10, 20)
      }

      // Add barcode info
      doc.setFontSize(8)
      doc.text(`Category: ${barcode.category}`, x + 2, yPosition + 30)
      doc.text(`${barcode.color} | Size: ${barcode.size}`, x + 2, yPosition + 35)
      doc.text(`Piece: ${barcode.pieceNumber}/${barcode.totalPieces}`, x + 2, yPosition + 40)
      doc.text(`Op: ${barcode.operation}`, x + 2, yPosition + 45)
    }

    doc.save(`barcodes-${customerInfo.name || 'tender'}.pdf`)
  }

  const printBarcodes = () => {
    if (generatedBarcodes.length === 0) {
      generateBarcodes()
      setTimeout(() => printBarcodes(), 500)
      return
    }

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .barcode-container { 
              display: inline-block; 
              margin: 10px; 
              padding: 10px; 
              border: 1px solid #ddd;
              text-align: center;
              width: 200px;
            }
            .barcode-info { font-size: 12px; margin-top: 5px; }
            @media print {
              .no-print { display: none; }
              .barcode-container { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Clothing Brand - Tender Barcodes</h2>
            <p>Customer: ${customerInfo.name}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="barcodes-grid">
            ${generatedBarcodes.map(barcode => `
              <div class="barcode-container">
                <canvas id="print-barcode-${barcode.id}"></canvas>
                <div class="barcode-info">
                  <div>${barcode.category}</div>
                  <div>${barcode.color} | Size: ${barcode.size}</div>
                  <div>Piece: ${barcode.pieceNumber}/${barcode.totalPieces}</div>
                  <div>Operation: ${barcode.operation}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            setTimeout(() => {
              ${generatedBarcodes.map(barcode => `
                JsBarcode("#print-barcode-${barcode.id}", "${barcode.id}", {
                  format: "CODE128",
                  displayValue: true,
                  fontSize: 12
                });
              `).join('')}
            }, 100);
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tender Registration</h1>
            <p className="text-gray-600 mt-1">Register new tender for clothing brand</p>
          </div>

          {/* Dropdown buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(dropdownMenus).map((menuKey) => (
              <div key={menuKey} className="relative">
                <button
                  onClick={() => handleDropdownToggle(menuKey)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {menuKey.charAt(0).toUpperCase() + menuKey.slice(1)}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {openDropdown === menuKey && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {dropdownMenus[menuKey].map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Customer Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Description *
                </label>
                <textarea
                  name="description"
                  value={customerInfo.description}
                  onChange={handleCustomerInfoChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the order requirements"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={customerInfo.postalCode}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Cloth Categories */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cloth Categories</h2>
              <button
                onClick={addClothCategory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Cloth Category
              </button>
            </div>

            {clothCategories.map((category) => (
              <div key={category.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={category.categoryName}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., T-Shirt, Pant, Jacket"
                    />
                  </div>
                  {clothCategories.length > 1 && (
                    <button
                      onClick={() => removeClothCategory(category.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Items in Category */}
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color *
                          </label>
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => updateItemField(category.id, item.id, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., White, Black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemField(category.id, item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size *
                          </label>
                          <input
                            type="text"
                            value={item.size}
                            onChange={(e) => updateItemField(category.id, item.id, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., S, M, L, XL"
                          />
                        </div>
                        <div className="flex items-end">
                          {category.items.length > 1 ? (
                            <button
                              onClick={() => removeItemFromCategory(category.id, item.id)}
                              className="w-full p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            >
                              Remove Item
                            </button>
                          ) : (
                            <button
                              onClick={() => addItemToCategory(category.id)}
                              className="w-full flex items-center justify-center gap-2 p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                            >
                              <Plus className="w-4 h-4" />
                              Add Variation
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Operations */}
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Operations
                        </label>
                        <div className="space-y-2">
                          {item.operations.map((operation, opIndex) => (
                            <div key={opIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={operation}
                                onChange={(e) => updateOperation(category.id, item.id, opIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Cutting, Stitching, Printing"
                              />
                              <button
                                onClick={() => removeOperation(category.id, item.id, opIndex)}
                                disabled={item.operations.length === 1}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addOperation(category.id, item.id)}
                          className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Operation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={generateBarcodes}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Barcodes
            </button>
            <button
              onClick={downloadBarcodesPDF}
              disabled={generatedBarcodes.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={printBarcodes}
              disabled={generatedBarcodes.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Generated Barcodes Display */}
          {generatedBarcodes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generated Barcodes ({generatedBarcodes.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {generatedBarcodes.map((barcode) => (
                  <div key={barcode.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                    <canvas id={`barcode-${barcode.id}`} className="w-full" />
                    <div className="mt-2 text-xs text-center">
                      <div className="font-medium">{barcode.category}</div>
                      <div>{barcode.color} | {barcode.size}</div>
                      <div>Piece {barcode.pieceNumber}/{barcode.totalPieces}</div>
                      <div className="text-gray-600 truncate">{barcode.operation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}