"use client"

import { useState, useEffect, useRef } from "react"
import { X, ShoppingBag, Tag, Hash, Palette, Ruler, DollarSign, Percent, Barcode } from "lucide-react"

export default function NewStockItemPopup({ 
  isOpen, 
  onClose, 
  onSubmit, 
  categories,
  sizes,
  colors,
  itemToEdit 
}) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    size: "",
    color: "",
    unit: "Pieces",
    quantity: "",
    minStock: "",
    maxStock: "",
    costPrice: "",
    sellingPrice: "",
    barcode: "",
    brand: ""
  })
  const [errors, setErrors] = useState({})
  const popupRef = useRef(null)

  // Initialize form with item data if editing
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name,
        sku: itemToEdit.sku,
        category: itemToEdit.category,
        size: itemToEdit.size,
        color: itemToEdit.color,
        unit: itemToEdit.unit,
        quantity: itemToEdit.quantity.toString(),
        minStock: itemToEdit.minStock.toString(),
        maxStock: itemToEdit.maxStock.toString(),
        costPrice: itemToEdit.costPrice.toString(),
        sellingPrice: itemToEdit.sellingPrice.toString(),
        barcode: itemToEdit.barcode,
        brand: itemToEdit.brand
      })
    } else {
      // Generate random barcode
      const generateBarcode = () => {
        const prefix = "890"
        let barcode = prefix
        for (let i = 0; i < 10; i++) {
          barcode += Math.floor(Math.random() * 10)
        }
        return barcode
      }
      
      setFormData({
        name: "",
        sku: "",
        category: "",
        size: "",
        color: "",
        unit: "Pieces",
        quantity: "0",
        minStock: "",
        maxStock: "",
        costPrice: "",
        sellingPrice: "",
        barcode: generateBarcode(),
        brand: ""
      })
    }
    setErrors({})
  }, [itemToEdit])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required"
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    
    if (!formData.size) {
      newErrors.size = "Size is required"
    }
    
    if (!formData.color) {
      newErrors.color = "Color is required"
    }
    
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = "Valid quantity is required"
    }
    
    if (!formData.minStock || isNaN(formData.minStock) || parseFloat(formData.minStock) < 0) {
      newErrors.minStock = "Valid minimum stock is required"
    }
    
    if (!formData.maxStock || isNaN(formData.maxStock) || parseFloat(formData.maxStock) < 0) {
      newErrors.maxStock = "Valid maximum stock is required"
    }
    
    if (parseFloat(formData.minStock) >= parseFloat(formData.maxStock)) {
      newErrors.maxStock = "Maximum stock must be greater than minimum stock"
    }
    
    if (!formData.costPrice || isNaN(formData.costPrice) || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = "Valid cost price is required"
    }
    
    if (!formData.sellingPrice || isNaN(formData.sellingPrice) || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Valid selling price is required"
    }
    
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
      newErrors.sellingPrice = "Selling price must be greater than cost price"
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        size: formData.size,
        color: formData.color,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        barcode: formData.barcode.trim(),
        brand: formData.brand.trim(),
        status: formData.quantity <= formData.minStock ? 
          (formData.quantity == 0 ? "Out of Stock" : "Low Stock") : 
          "In Stock"
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }

    // Auto-generate SKU from name and category
    if ((name === "name" || name === "category" || name === "size" || name === "color") && !itemToEdit) {
      if (formData.name && formData.category && formData.size && formData.color) {
        const nameWords = formData.name.trim().split(' ')
        const nameCode = nameWords.map(word => word.substring(0, 3).toUpperCase()).join('')
        const categoryCode = formData.category.substring(0, 3).toUpperCase()
        const sizeCode = formData.size.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
        const colorCode = formData.color.substring(0, 3).toUpperCase()
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        setFormData(prev => ({
          ...prev,
          sku: `STK-${categoryCode}-${sizeCode}-${colorCode}-${randomNum}`
        }))
      }
    }

    // Auto-calculate max stock if min stock is set
    if (name === "minStock" && value && !formData.maxStock && !itemToEdit) {
      setFormData(prev => ({
        ...prev,
        maxStock: (parseFloat(value) * 5).toString()
      }))
    }

    // Auto-calculate selling price with 100% markup if cost price is set
    if (name === "costPrice" && value && !formData.sellingPrice && !itemToEdit) {
      const cost = parseFloat(value)
      const selling = cost * 2 // 100% markup
      setFormData(prev => ({
        ...prev,
        sellingPrice: selling.toFixed(2)
      }))
    }
  }

  const calculateMargin = () => {
    if (formData.costPrice && formData.sellingPrice) {
      const cost = parseFloat(formData.costPrice)
      const selling = parseFloat(formData.sellingPrice)
      if (cost > 0) {
        return ((selling - cost) / cost * 100).toFixed(1)
      }
    }
    return "0"
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
          className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {itemToEdit ? "Edit Stock Item" : "Add New Stock Item"}
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
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., Men's Polo T-Shirt - Navy Blue"
                      autoFocus
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.sku ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., STK-POL-M-NVY-001"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.brand ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., StyleCraft, DenimCo"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                  )}
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.size ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Size</option>
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  {errors.size && (
                    <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color *
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.color ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Pieces"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., 8901234567890"
                    />
                  </div>
                </div>

                {/* Current Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.quantity ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 150"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.costPrice ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 250.00"
                    />
                  </div>
                  {errors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
                  )}
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.sellingPrice ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 499.00"
                    />
                  </div>
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-600">
                    <Percent className="inline w-3 h-3 mr-1" />
                    Profit Margin: {calculateMargin()}%
                  </div>
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock *
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.minStock ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 50"
                  />
                  {errors.minStock && (
                    <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                  )}
                </div>

                {/* Maximum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Stock *
                  </label>
                  <input
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.maxStock ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., 500"
                  />
                  {errors.maxStock && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>
                  )}
                </div>
              </div>

              {/* Example */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Example for clothing product:</span>
                  <br />
                  • Name: <span className="font-mono">Men's Polo T-Shirt - Navy Blue</span>
                  <br />
                  • SKU: <span className="font-mono">STK-POL-M-NVY-001</span>
                  <br />
                  • Category: <span className="font-mono">T-Shirts</span>
                  <br />
                  • Brand: <span className="font-mono">StyleCraft</span>
                  <br />
                  • Size: <span className="font-mono">M</span>
                  <br />
                  • Color: <span className="font-mono">Navy Blue</span>
                  <br />
                  • Unit: <span className="font-mono">Pieces</span>
                  <br />
                  • Quantity: <span className="font-mono">150</span>
                  <br />
                  • Cost Price: <span className="font-mono">250.00</span>
                  <br />
                  • Selling Price: <span className="font-mono">499.00</span>
                  <br />
                  • Min Stock: <span className="font-mono">50</span>
                  <br />
                  • Max Stock: <span className="font-mono">500</span>
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
                    {itemToEdit ? "Update Item" : "Add Stock Item"}
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