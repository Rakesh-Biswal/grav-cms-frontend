// /project-manager/dashboard/inventory/products/stock-items/new-stock-item/[id]/page.js

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  Plus,
  X,
  Upload,
  ShoppingBag,
  Tag,
  Hash,
  Palette,
  Ruler,
  DollarSign,
  Percent,
  Barcode,
  Package,
  Layers,
  Trash2,
  Image as ImageIcon,
  Link,
  Search,
  Check,
  AlertCircle,
  FileText,
  Receipt,
  Calculator,
  Cpu,
  Clock,
  Settings,
  User,
  ArrowLeft,
  Save,
  RefreshCw
} from "lucide-react"
import toast from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function StockItemFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEditMode = !!params.id
  const stockItemId = params.id
  
  // States for different tabs
  const [activeTab, setActiveTab] = useState("general")
  
  // States for form data
  const [formData, setFormData] = useState({
    name: "",
    productType: "Goods",
    invoicingPolicy: "Ordered quantities",
    trackInventory: true,
    category: "",
    reference: "",
    barcode: "",
    hsnCode: "",
    internalNotes: "",
    salesPrice: "",
    salesTax: "5% GST S",
    cost: "",
    quantityOnHand: "0",
    purchaseTax: "5% GST P",
    unit: "Units",
    minStock: "",
    maxStock: ""
  })

  // States for attribute variants
  const [attributes, setAttributes] = useState([])
  const [newAttribute, setNewAttribute] = useState("")
  const [newValue, setNewValue] = useState("")
  const [selectedAttribute, setSelectedAttribute] = useState(null)
  const [attributeSuggestions, setAttributeSuggestions] = useState([])
  const [valueSuggestions, setValueSuggestions] = useState([])

  // States for raw items
  const [selectedRawItems, setSelectedRawItems] = useState([])
  const [rawItemSearch, setRawItemSearch] = useState("")
  const [rawItemSuggestions, setRawItemSuggestions] = useState([])
  const [showRawItemSuggestions, setShowRawItemSuggestions] = useState(false)
  const [allRawItems, setAllRawItems] = useState([])

  // States for operations
  const [operations, setOperations] = useState([])
  const [newOperation, setNewOperation] = useState({
    type: "",
    machine: "",
    machineType: "",
    minutes: "",
    seconds: "",
    operatorSalary: ""
  })
  const [operationTypeSuggestions, setOperationTypeSuggestions] = useState([])
  const [machineSuggestions, setMachineSuggestions] = useState([])

  // States for image upload
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // States for pricing
  const [miscellaneousCosts, setMiscellaneousCosts] = useState([
    { id: 1, name: "Labor Cost", amount: "", unit: "Fixed" },
    { id: 2, name: "Packaging", amount: "", unit: "Fixed" },
    { id: 3, name: "Transportation", amount: "", unit: "Fixed" }
  ])

  // States for data fetching
  const [data, setData] = useState({
    categories: [],
    attributes: [],
    operationTypes: [],
    rawItems: [],
    machines: [],
    averageOperatorSalary: 0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Refs for suggestion boxes
  const rawItemSearchRef = useRef(null)

  // Constants for salary calculation
  const WORK_DAYS_PER_MONTH = 26
  const HOURS_PER_DAY = 8
  const MINUTES_PER_DAY = HOURS_PER_DAY * 60
  const MINUTES_PER_MONTH = MINUTES_PER_DAY * WORK_DAYS_PER_MONTH

  // Fetch data on component mount
  useEffect(() => {
    fetchCreateData()
    
    if (isEditMode && stockItemId) {
      fetchStockItemData()
    }
  }, [isEditMode, stockItemId])

  // Fetch data for creating stock item
  const fetchCreateData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/stock-items/data/create`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        // Set initial raw items suggestions (5-6 items)
        if (result.data.rawItems && result.data.rawItems.length > 0) {
          setRawItemSuggestions(result.data.rawItems.slice(0, 6))
          setAllRawItems(result.data.rawItems)
        }
      } else {
        toast.error(result.message || "Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching create data:", error)
      toast.error("Failed to fetch required data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch stock item data for editing
  const fetchStockItemData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/cms/stock-items/${stockItemId}`, {
        credentials: "include"
      })
      
      const result = await response.json()
      
      if (result.success) {
        const item = result.stockItem
        
        // Set form data
        setFormData({
          name: item.name || "",
          productType: item.productType || "Goods",
          invoicingPolicy: item.invoicingPolicy || "Ordered quantities",
          trackInventory: item.trackInventory !== undefined ? item.trackInventory : true,
          category: item.category || "",
          reference: item.reference || "",
          barcode: item.barcode || "",
          hsnCode: item.hsnCode || "",
          internalNotes: item.internalNotes || "",
          salesPrice: item.salesPrice?.toString() || "",
          salesTax: item.salesTax || "5% GST S",
          cost: item.cost?.toString() || "",
          quantityOnHand: item.quantityOnHand?.toString() || "0",
          purchaseTax: item.purchaseTax || "5% GST P",
          unit: item.unit || "Units",
          minStock: item.minStock?.toString() || "",
          maxStock: item.maxStock?.toString() || ""
        })
        
        // Set attributes
        if (item.attributes && Array.isArray(item.attributes)) {
          setAttributes(item.attributes.map(attr => ({
            id: Date.now() + Math.random(), // Generate unique ID
            name: attr.name,
            values: attr.values || []
          })))
        }
        
        // Set raw items
        if (item.rawItems && Array.isArray(item.rawItems)) {
          setSelectedRawItems(item.rawItems.map(rawItem => ({
            id: rawItem.rawItemId,
            name: rawItem.name,
            sku: rawItem.sku,
            quantity: rawItem.quantity,
            unit: rawItem.unit,
            cost: rawItem.unitCost,
            totalCost: rawItem.totalCost
          })))
        }
        
        // Set operations
        if (item.operations && Array.isArray(item.operations)) {
          setOperations(item.operations.map(op => ({
            id: Date.now() + Math.random(), // Generate unique ID
            type: op.type,
            machine: op.machine,
            machineType: op.machineType,
            minutes: op.minutes?.toString() || "0",
            seconds: op.seconds?.toString() || "0",
            operatorSalary: op.operatorSalary?.toString() || "",
            operatorCost: op.operatorCost?.toString() || "0"
          })))
        }
        
        // Set miscellaneous costs
        if (item.miscellaneousCosts && Array.isArray(item.miscellaneousCosts)) {
          setMiscellaneousCosts(item.miscellaneousCosts.map((cost, index) => ({
            id: index + 1,
            name: cost.name,
            amount: cost.amount?.toString() || "",
            unit: cost.unit || "Fixed"
          })))
        }
        
        // Set images
        if (item.images && Array.isArray(item.images)) {
          setImages(item.images)
          setImagePreviews(item.images)
        }
        
      } else {
        toast.error(result.message || "Failed to fetch stock item data")
        router.push("/project-manager/dashboard/inventory/products/stock-items")
      }
    } catch (error) {
      console.error("Error fetching stock item:", error)
      toast.error("Failed to fetch stock item data")
      router.push("/project-manager/dashboard/inventory/products/stock-items")
    } finally {
      setLoading(false)
    }
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = parseFloat(formData.cost) || 0
    
    // Add raw items cost
    selectedRawItems.forEach(item => {
      total += (item.quantity * item.cost) || 0
    })
    
    // Add miscellaneous costs
    miscellaneousCosts.forEach(cost => {
      total += parseFloat(cost.amount) || 0
    })
    
    // Add operations labor cost
    operations.forEach(op => {
      if (op.operatorCost) {
        total += parseFloat(op.operatorCost) || 0
      }
    })
    
    return total
  }

  // Calculate profit margin
  const calculateMargin = () => {
    const salesPrice = parseFloat(formData.salesPrice) || 0
    const totalCost = calculateTotalCost()
    
    if (totalCost === 0) return 0
    return ((salesPrice - totalCost) / totalCost * 100).toFixed(1)
  }

  // Calculate operator cost for duration
  const calculateOperatorCost = (operatorSalary, minutes, seconds) => {
    if (!operatorSalary || operatorSalary <= 0) return 0
    
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    const totalMinutes = totalSeconds / 60
    
    // Calculate cost per minute
    const salaryPerMonth = parseFloat(operatorSalary)
    const costPerMinute = salaryPerMonth / MINUTES_PER_MONTH
    
    // Calculate cost for this operation
    const operatorCost = costPerMinute * totalMinutes
    
    return operatorCost
  }

  // Handle machine selection
  const handleMachineSelect = (machine) => {
    setNewOperation(prev => ({ 
      ...prev, 
      machine: machine.name,
      machineType: machine.type,
      operatorSalary: data.averageOperatorSalary?.toString() || ""
    }))
    setMachineSuggestions([])
  }

  // Add operation with operator cost calculation
  const addOperation = () => {
    if (newOperation.type.trim() && (newOperation.minutes || newOperation.seconds)) {
      const totalSeconds = (parseInt(newOperation.minutes) || 0) * 60 + (parseInt(newOperation.seconds) || 0)
      
      // Calculate operator cost
      const operatorCost = calculateOperatorCost(
        newOperation.operatorSalary,
        newOperation.minutes,
        newOperation.seconds
      )
      
      const newOp = {
        id: operations.length + 1,
        type: newOperation.type.trim(),
        machine: newOperation.machine || "",
        machineType: newOperation.machineType || "",
        minutes: newOperation.minutes || "0",
        seconds: newOperation.seconds || "0",
        duration: `${newOperation.minutes || "0"}m ${newOperation.seconds || "0"}s`,
        totalSeconds,
        operatorSalary: newOperation.operatorSalary || "",
        operatorCost: operatorCost.toFixed(2)
      }
      
      setOperations([...operations, newOp])
      setNewOperation({
        type: "",
        machine: "",
        machineType: "",
        minutes: "",
        seconds: "",
        operatorSalary: ""
      })
      setOperationTypeSuggestions([])
      setMachineSuggestions([])
    }
  }

  // Cloudinary image upload
  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'stock_items_preset'); // Your Cloudinary preset
      
      const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      toast.error("You can only upload up to 3 images")
      return
    }

    try {
      // Create previews first
      const newPreviews = [...imagePreviews]
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result)
          setImagePreviews([...newPreviews])
        }
        reader.readAsDataURL(file)
      })

      // Upload to Cloudinary
      const uploadPromises = files.map(async (file) => {
        const imageUrl = await uploadToCloudinary(file)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      setImages(prev => [...prev, ...uploadedUrls])
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error("Failed to upload images")
    }
  }

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  // Handle attribute input
  const handleAttributeInput = (value) => {
    setNewAttribute(value)
    if (value.length > 0) {
      const suggestions = data.attributes?.filter(attr =>
        attr.name.toLowerCase().includes(value.toLowerCase())
      ) || []
      setAttributeSuggestions(suggestions.slice(0, 5))
    } else {
      setAttributeSuggestions([])
    }
  }

  // Check if attribute exists
  const attributeExists = (attrName) => {
    return data.attributes?.some(attr => 
      attr.name.toLowerCase() === attrName.toLowerCase()
    ) || false
  }

  // Select attribute
  const selectAttribute = (attribute) => {
    setNewAttribute(attribute.name)
    setSelectedAttribute(attribute)
    setNewValue("")
    setAttributeSuggestions([])
    // Auto-show value suggestions
    setValueSuggestions(attribute.values?.slice(0, 5) || [])
  }

  // Create new attribute
  const createNewAttribute = () => {
    if (newAttribute.trim() && !attributeExists(newAttribute.trim())) {
      const newAttr = {
        id: Date.now() + Math.random(),
        name: newAttribute.trim(),
        values: []
      }
      setAttributes([...attributes, newAttr])
      setSelectedAttribute(newAttr)
      setNewAttribute("")
      setNewValue("")
      setValueSuggestions([])
    }
  }

  // Handle value input
  const handleValueInput = (value) => {
    setNewValue(value)
    if (selectedAttribute && value.length > 0) {
      const existingAttr = data.attributes?.find(attr => attr.name === selectedAttribute.name)
      if (existingAttr) {
        const suggestions = existingAttr.values
          ?.filter(val => val.toLowerCase().includes(value.toLowerCase()))
          ?.slice(0, 5) || []
        setValueSuggestions(suggestions)
      } else {
        setValueSuggestions([])
      }
    } else {
      setValueSuggestions([])
    }
  }

  // Add value to attribute
  const addValueToAttribute = () => {
    if (selectedAttribute && newValue.trim()) {
      const updatedAttributes = attributes.map(attr => {
        if (attr.id === selectedAttribute.id) {
          return {
            ...attr,
            values: [...attr.values, newValue.trim()]
          }
        }
        return attr
      })
      setAttributes(updatedAttributes)
      setSelectedAttribute(updatedAttributes.find(attr => attr.id === selectedAttribute.id))
      setNewValue("")
      setValueSuggestions([])
    }
  }

  // Remove attribute
  const removeAttribute = (attributeId) => {
    if (window.confirm("Warning: Deleting this attribute will remove all its values. Continue?")) {
      setAttributes(attributes.filter(attr => attr.id !== attributeId))
      if (selectedAttribute?.id === attributeId) {
        setSelectedAttribute(null)
        setNewAttribute("")
        setNewValue("")
      }
    }
  }

  // Remove value from attribute
  const removeValue = (attributeId, value) => {
    const updatedAttributes = attributes.map(attr => {
      if (attr.id === attributeId) {
        return {
          ...attr,
          values: attr.values.filter(v => v !== value)
        }
      }
      return attr
    })
    setAttributes(updatedAttributes)
    if (selectedAttribute?.id === attributeId) {
      setSelectedAttribute(updatedAttributes.find(attr => attr.id === attributeId))
    }
  }

  // Handle raw item search
  useEffect(() => {
    if (rawItemSearch.length > 0) {
      const suggestions = allRawItems.filter(item =>
        item.name.toLowerCase().includes(rawItemSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(rawItemSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(rawItemSearch.toLowerCase())
      )
      setRawItemSuggestions(suggestions.slice(0, 10))
      setShowRawItemSuggestions(true)
    } else {
      // Show initial 5-6 suggestions
      setRawItemSuggestions(allRawItems.slice(0, 6))
      setShowRawItemSuggestions(false)
    }
  }, [rawItemSearch, allRawItems])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rawItemSearchRef.current && !rawItemSearchRef.current.contains(event.target)) {
        setShowRawItemSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add raw item
  const addRawItem = (rawItem) => {
    if (!selectedRawItems.find(item => item.id === rawItem.id)) {
      setSelectedRawItems([
        ...selectedRawItems,
        {
          ...rawItem,
          quantity: 1,
          totalCost: rawItem.cost
        }
      ])
    }
    setRawItemSearch("")
    setShowRawItemSuggestions(false)
  }

  // Update raw item quantity
  const updateRawItemQuantity = (id, quantity) => {
    const updatedItems = selectedRawItems.map(item => {
      if (item.id === id) {
        const totalCost = item.cost * quantity
        return { ...item, quantity, totalCost }
      }
      return item
    })
    setSelectedRawItems(updatedItems)
  }

  // Remove raw item
  const removeRawItem = (id) => {
    setSelectedRawItems(selectedRawItems.filter(item => item.id !== id))
  }

  // Handle operation type input
  const handleOperationTypeInput = (value) => {
    setNewOperation(prev => ({ ...prev, type: value }))
    if (value.length > 0) {
      const suggestions = data.operationTypes?.filter(op =>
        op.toLowerCase().includes(value.toLowerCase())
      ) || []
      setOperationTypeSuggestions(suggestions.slice(0, 5))
      
      // Auto-suggest machines based on operation type
      if (data.machines && data.machines.length > 0) {
        const machineTypes = [...new Set(data.machines.map(m => m.type))]
        const matchingMachines = data.machines.filter(m => 
          m.type.toLowerCase().includes(value.toLowerCase()) ||
          machineTypes.some(type => type.toLowerCase().includes(value.toLowerCase()))
        )
        setMachineSuggestions(matchingMachines.slice(0, 5))
      }
    } else {
      setOperationTypeSuggestions([])
      setMachineSuggestions([])
    }
  }

  // Select operation type
  const selectOperationType = (operationType) => {
    setNewOperation(prev => ({ ...prev, type: operationType }))
    setOperationTypeSuggestions([])
  }

  // Handle machine input
  const handleMachineInput = (value) => {
    setNewOperation(prev => ({ ...prev, machine: value }))
    if (value.length > 0) {
      const suggestions = data.machines?.filter(machine =>
        machine.name.toLowerCase().includes(value.toLowerCase()) ||
        machine.type.toLowerCase().includes(value.toLowerCase())
      ) || []
      setMachineSuggestions(suggestions.slice(0, 5))
    } else {
      setMachineSuggestions([])
    }
  }

  // Update miscellaneous cost
  const updateMiscellaneousCost = (id, field, value) => {
    const updatedCosts = miscellaneousCosts.map(cost => {
      if (cost.id === id) {
        return { ...cost, [field]: value }
      }
      return cost
    })
    setMiscellaneousCosts(updatedCosts)
  }

  // Add miscellaneous cost
  const addMiscellaneousCost = () => {
    const newCost = {
      id: miscellaneousCosts.length + 1,
      name: "",
      amount: "",
      unit: "Fixed"
    }
    setMiscellaneousCosts([...miscellaneousCosts, newCost])
  }

  // Remove miscellaneous cost
  const removeMiscellaneousCost = (id) => {
    setMiscellaneousCosts(miscellaneousCosts.filter(cost => cost.id !== id))
  }

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    
    if (!formData.salesPrice || isNaN(formData.salesPrice) || parseFloat(formData.salesPrice) <= 0) {
      newErrors.salesPrice = "Valid sales price is required"
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const submitData = {
        name: formData.name.trim(),
        productType: formData.productType,
        invoicingPolicy: formData.invoicingPolicy,
        trackInventory: formData.trackInventory,
        category: formData.category,
        hsnCode: formData.hsnCode,
        internalNotes: formData.internalNotes,
        unit: formData.unit,
        salesPrice: parseFloat(formData.salesPrice),
        salesTax: formData.salesTax,
        cost: parseFloat(formData.cost) || 0,
        purchaseTax: formData.purchaseTax,
        quantityOnHand: parseFloat(formData.quantityOnHand) || 0,
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        attributes: attributes.map(attr => ({
          name: attr.name,
          values: attr.values
        })),
        variants: [], // You can add variant logic here
        rawItems: selectedRawItems.map(item => ({
          rawItemId: item.id,
          quantity: item.quantity
        })),
        operations: operations.map(op => ({
          type: op.type,
          machine: op.machine,
          machineType: op.machineType,
          minutes: parseFloat(op.minutes) || 0,
          seconds: parseFloat(op.seconds) || 0,
          operatorSalary: parseFloat(op.operatorSalary) || 0,
          operatorCost: parseFloat(op.operatorCost) || 0
        })),
        miscellaneousCosts: miscellaneousCosts.filter(cost => cost.name.trim() && cost.amount).map(cost => ({
          name: cost.name.trim(),
          amount: parseFloat(cost.amount) || 0,
          unit: cost.unit
        })),
        images: images
      }
      
      const url = isEditMode 
        ? `${API_URL}/api/cms/stock-items/${stockItemId}`
        : `${API_URL}/api/cms/stock-items`
      
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
        toast.success(isEditMode ? "Stock item updated successfully!" : "Stock item created successfully!")
        router.push("/project-manager/dashboard/inventory/products/stock-items")
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} stock item`)
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} stock item:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} stock item`)
    } finally {
      setSubmitting(false)
    }
  }

  // Quick add quantity
  const handleQuickAdd = (quantity) => {
    setFormData(prev => ({
      ...prev,
      quantityOnHand: (parseInt(prev.quantityOnHand) || 0) + quantity
    }))
  }

  // Remove operation
  const removeOperation = (id) => {
    setOperations(operations.filter(op => op.id !== id))
  }

  // Calculate total operator cost
  const calculateTotalOperatorCost = () => {
    return operations.reduce((total, op) => total + (parseFloat(op.operatorCost) || 0), 0)
  }

  // Auto-generate reference based on name and category
  useEffect(() => {
    if (formData.name && formData.category && !formData.reference && !isEditMode) {
      const nameWords = formData.name.split(' ')
      const nameCode = nameWords.map(word => word.substring(0, 3).toUpperCase()).join('')
      const categoryCode = formData.category.substring(0, 3).toUpperCase()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({
        ...prev,
        reference: `PROD-${categoryCode}-${nameCode}-${randomNum}`
      }))
    }
  }, [formData.name, formData.category, isEditMode])

  // Auto-generate barcode (EAN-13 format)
  useEffect(() => {
    if (!formData.barcode && !isEditMode) {
      const barcode = "89" + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
      setFormData(prev => ({ ...prev, barcode }))
    }
  }, [isEditMode])

  // Auto-calculate sales price with 50% markup
  useEffect(() => {
    const totalCost = calculateTotalCost()
    if (totalCost > 0 && !formData.salesPrice && !isEditMode) {
      const salesPrice = (totalCost * 1.5).toFixed(2)
      setFormData(prev => ({ ...prev, salesPrice }))
    }
  }, [selectedRawItems, miscellaneousCosts, formData.cost, operations, isEditMode])

  // Auto-fill min and max stock based on category
  useEffect(() => {
    if (formData.category && !formData.minStock && !isEditMode) {
      const baseMinStock = formData.category.toLowerCase().includes("shirt") ? 50 :
                          formData.category.toLowerCase().includes("jeans") ? 30 :
                          formData.category.toLowerCase().includes("ethnic") ? 20 : 25
      setFormData(prev => ({
        ...prev,
        minStock: baseMinStock.toString(),
        maxStock: (baseMinStock * 5).toString()
      }))
    }
  }, [formData.category, isEditMode])

  if (loading) {
    return (
      <DashboardLayout activeMenu="inventory">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading {isEditMode ? 'stock item' : 'create form'}...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeMenu="inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/project-manager/dashboard/inventory/products/stock-items")}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Stock Items
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Edit Stock Item" : "Create New Stock Item"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? "Update finished clothing product details" : "Add a new finished clothing product to inventory"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCreateData}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push("/project-manager/dashboard/inventory/products/stock-items")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Product Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Product Images (Max 3)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image Upload Boxes */}
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative">
                    {imagePreviews[index] ? (
                      <div className="border border-gray-300 rounded-md overflow-hidden h-48">
                        <img
                          src={imagePreviews[index]}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-48 cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={images.length >= 3}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Upload up to 3 images. Max file size: 2MB each. Supported formats: JPG, PNG, WebP.
                Images are uploaded to Cloudinary and URLs are stored in the database.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden min-h-[500px]">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {["general", "attributes", "rawItems", "operations", "prices"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab === "general" && "General Information"}
                    {tab === "attributes" && "Attributes & Variants"}
                    {tab === "rawItems" && "Raw Items"}
                    {tab === "operations" && "Operations"}
                    {tab === "prices" && "Prices"}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* General Information Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.name ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="e.g., Men's Formal Shirt"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Type *
                        </label>
                        <div className="flex gap-4">
                          {["Goods", "Service", "Combo"].map((type) => (
                            <label key={type} className="flex items-center">
                              <input
                                type="radio"
                                name="productType"
                                checked={formData.productType === type}
                                onChange={() => setFormData(prev => ({ ...prev, productType: type }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

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
                          {data.categories?.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit of Measurement
                        </label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="Units">Units</option>
                          <option value="Pieces">Pieces</option>
                          <option value="Pairs">Pairs</option>
                          <option value="Sets">Sets</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          HSN Code
                        </label>
                        <input
                          type="text"
                          name="hsnCode"
                          value={formData.hsnCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="e.g., 611020"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Internal Notes
                        </label>
                        <textarea
                          name="internalNotes"
                          value={formData.internalNotes}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Internal notes about this product..."
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reference (Auto-generated)
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                            readOnly
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Auto-generated based on name and category</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Barcode (Auto-generated)
                        </label>
                        <div className="relative">
                          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                            readOnly
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Auto-generated EAN-13 barcode</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.minStock ? "border-red-300" : "border-gray-300"
                            }`}
                            placeholder="e.g., 50"
                          />
                          {errors.minStock && (
                            <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
                          )}
                        </div>

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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.maxStock ? "border-red-300" : "border-gray-300"
                            }`}
                            placeholder="e.g., 200"
                          />
                          {errors.maxStock && (
                            <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity on Hand
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="quantityOnHand"
                            value={formData.quantityOnHand}
                            onChange={handleChange}
                            min="0"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Current stock"
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(10)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(50)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
                            >
                              +50
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Track Inventory
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="trackInventory"
                            checked={formData.trackInventory}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Track quantities of this product</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attributes & Variants Tab */}
              {activeTab === "attributes" && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          Adding or deleting attributes will delete variants and lead to the loss of their possible customizations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Attribute Input */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attribute
                        </label>
                        <input
                          type="text"
                          value={newAttribute}
                          onChange={(e) => handleAttributeInput(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="e.g., color, size"
                        />
                        
                        {/* Attribute Suggestions */}
                        {attributeSuggestions.length > 0 && (
                          <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-lg z-10 absolute w-full">
                            {attributeSuggestions.map((attr, index) => (
                              <div
                                key={index}
                                onClick={() => selectAttribute(attr)}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                              >
                                <span>{attr.name}</span>
                                <span className="text-xs text-gray-500">{attr.values?.length || 0} values</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Create new attribute button - only show if not found in suggestions */}
                        {newAttribute && attributeSuggestions.length === 0 && !attributeExists(newAttribute.trim()) && (
                          <button
                            type="button"
                            onClick={createNewAttribute}
                            className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors w-full text-center"
                          >
                            Create "{newAttribute}"
                          </button>
                        )}
                      </div>

                      {/* Values Input */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Values
                        </label>
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => handleValueInput(e.target.value)}
                          disabled={!selectedAttribute}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            !selectedAttribute ? "bg-gray-100" : "border-gray-300"
                          }`}
                          placeholder={selectedAttribute ? "Add value..." : "Select attribute first"}
                        />
                        
                        {/* Value Suggestions - Auto show when attribute is selected */}
                        {selectedAttribute && valueSuggestions.length > 0 && (
                          <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-lg z-10 absolute w-full">
                            {valueSuggestions.map((value, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setNewValue(value)
                                  addValueToAttribute()
                                }}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add value button */}
                        {selectedAttribute && newValue.trim() && (
                          <button
                            type="button"
                            onClick={addValueToAttribute}
                            className="mt-2 text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors w-full text-center"
                          >
                            Add "{newValue}"
                          </button>
                        )}
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedAttribute && newValue) {
                              addValueToAttribute()
                            }
                          }}
                          disabled={!selectedAttribute || !newValue.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                          Add a line
                        </button>
                      </div>
                    </div>

                    {/* Existing Attributes */}
                    <div className="space-y-4">
                      {attributes.map((attr) => (
                        <div key={attr.id} className="border border-gray-200 rounded-md p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">{attr.name}</span>
                              <span className="ml-2 text-xs text-gray-500">({attr.values.length} values)</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAttribute(attr)
                                  setNewAttribute(attr.name)
                                  setNewValue("")
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                Configure
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttribute(attr.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {selectedAttribute?.id === attr.id && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {attr.values.map((value, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                  >
                                    {value}
                                    <button
                                      type="button"
                                      onClick={() => removeValue(attr.id, value)}
                                      className="hover:text-blue-900"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {attr.values.map((value, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-1 border border-gray-300 rounded text-center text-sm hover:bg-gray-50"
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Items Tab */}
              {activeTab === "rawItems" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Search for Raw Items */}
                    <div className="relative" ref={rawItemSearchRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Raw Items
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={rawItemSearch}
                          onChange={(e) => setRawItemSearch(e.target.value)}
                          onFocus={() => rawItemSearch && setShowRawItemSuggestions(true)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Search raw items by name, SKU, or category..."
                        />
                      </div>

                      {/* Raw Item Suggestions - Fixed height */}
                      {showRawItemSuggestions && rawItemSuggestions.length > 0 && (
                        <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-lg z-10 absolute w-full max-h-64 overflow-y-auto">
                          {rawItemSuggestions.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => addRawItem(item)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500">
                                    SKU: {item.sku} | Category: {item.category} | Stock: {item.quantity} {item.unit}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-green-700">
                                  ₹{item.cost}/{item.unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Raw Items Table */}
                    {selectedRawItems.length > 0 && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Raw Item
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit Cost
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Cost
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedRawItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.sku}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  ₹{item.cost}/{item.unit}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) => updateRawItemQuantity(item.id, parseFloat(e.target.value))}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <span className="ml-2 text-sm text-gray-500">{item.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                  ₹{(item.cost * item.quantity).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => removeRawItem(item.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                Total Raw Items Cost:
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-green-700">
                                ₹{selectedRawItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Operations Tab */}
              {activeTab === "operations" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-start">
                      <Calculator className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Operator Cost Calculation</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Operator cost is calculated based on: Monthly Salary ÷ (26 days × 8 hours × 60 minutes)
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                          Average Operator Salary: ₹{data.averageOperatorSalary?.toLocaleString('en-IN')}/month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Operation Type Input */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Operation Type
                        </label>
                        <div className="relative">
                          <Cpu className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={newOperation.type}
                            onChange={(e) => handleOperationTypeInput(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Cutting, Stitching"
                          />
                        </div>
                        
                        {/* Operation Type Suggestions */}
                        {operationTypeSuggestions.length > 0 && (
                          <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-lg z-10 absolute w-full">
                            {operationTypeSuggestions.map((op, index) => (
                              <div
                                key={index}
                                onClick={() => selectOperationType(op)}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              >
                                <div className="font-medium">{op}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Machine Input */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign Machine (Optional)
                        </label>
                        <div className="relative">
                          <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={newOperation.machine}
                            onChange={(e) => handleMachineInput(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Sewing Machine 1"
                          />
                        </div>
                        
                        {/* Machine Suggestions */}
                        {machineSuggestions.length > 0 && (
                          <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-lg z-10 absolute w-full">
                            {machineSuggestions.map((machine) => (
                              <div
                                key={machine.id}
                                onClick={() => handleMachineSelect(machine)}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              >
                                <div className="font-medium">{machine.name}</div>
                                <div className="text-xs text-gray-500">
                                  Type: {machine.type} | Model: {machine.model}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Duration - Minutes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minutes
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            min="0"
                            value={newOperation.minutes}
                            onChange={(e) => setNewOperation({...newOperation, minutes: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Min"
                          />
                        </div>
                      </div>

                      {/* Duration - Seconds */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seconds
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={newOperation.seconds}
                            onChange={(e) => setNewOperation({...newOperation, seconds: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Sec"
                          />
                        </div>
                      </div>

                      {/* Operator Salary Display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Salary
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={newOperation.operatorSalary ? `₹${newOperation.operatorSalary}/month` : `₹${data.averageOperatorSalary}/month`}
                            readOnly
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Average salary"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Based on operator department average
                        </p>
                      </div>
                    </div>

                    {/* Manual Operation Type Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newOperation.type}
                        onChange={(e) => setNewOperation({...newOperation, type: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Or enter custom operation type..."
                      />
                    </div>

                    {/* Add Operation Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={addOperation}
                        disabled={!newOperation.type.trim() || (!newOperation.minutes && !newOperation.seconds)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Operation
                      </button>
                    </div>

                    {/* Operations List */}
                    {operations.length > 0 && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Operation Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Machine
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Operator Salary
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Operator Cost
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {operations.map((op) => (
                              <tr key={op.id}>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900">{op.type}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {op.machine || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {op.duration}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-gray-400" />
                                    <span>₹{op.operatorSalary || data.averageOperatorSalary}/month</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-semibold text-green-700">
                                    ₹{op.operatorCost}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => removeOperation(op.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                Total Duration:
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                Total Operator Cost:
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-green-700">
                                ₹{calculateTotalOperatorCost().toFixed(2)}
                              </td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prices Tab */}
              {activeTab === "prices" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Sales */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-800">Sales</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sales Price *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            name="salesPrice"
                            min="0.01"
                            step="0.01"
                            value={formData.salesPrice}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              errors.salesPrice ? "border-red-300" : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.salesPrice && (
                          <p className="mt-1 text-sm text-red-600">{errors.salesPrice}</p>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                          per {formData.unit}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sales Taxes
                        </label>
                        <select
                          name="salesTax"
                          value={formData.salesTax}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="5% GST S">5% GST S</option>
                          <option value="12% GST S">12% GST S</option>
                          <option value="18% GST S">18% GST S</option>
                          <option value="28% GST S">28% GST S</option>
                          <option value="0%">0% (Exempt)</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="text-xs text-blue-600">Including Taxes (5% GST)</div>
                        <div className="text-lg font-semibold text-blue-800 mt-1">
                          ₹{((parseFloat(formData.salesPrice) || 0) * 1.05).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Cost & Profit */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-800">Cost & Profit</h4>
                      
                      {/* Base Cost */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Cost
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            name="cost"
                            min="0"
                            step="0.01"
                            value={formData.cost}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Additional base cost"
                          />
                        </div>
                      </div>

                      {/* Miscellaneous Costs */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Miscellaneous Costs</label>
                          <button
                            type="button"
                            onClick={addMiscellaneousCost}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add Cost
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {miscellaneousCosts.map((cost) => (
                            <div key={cost.id} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={cost.name}
                                onChange={(e) => updateMiscellaneousCost(cost.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Cost name"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={cost.amount}
                                onChange={(e) => updateMiscellaneousCost(cost.id, 'amount', e.target.value)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Amount"
                              />
                              <select
                                value={cost.unit}
                                onChange={(e) => updateMiscellaneousCost(cost.id, 'unit', e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="Fixed">Fixed</option>
                                <option value="Percentage">%</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeMiscellaneousCost(cost.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cost Summary */}
                      <div className="bg-gray-50 p-4 rounded-md space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Cost:</span>
                          <span className="font-medium">
                            ₹{(parseFloat(formData.cost) || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Raw Materials:</span>
                          <span className="font-medium">
                            ₹{selectedRawItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Operator Labor:</span>
                          <span className="font-medium">
                            ₹{calculateTotalOperatorCost().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Miscellaneous:</span>
                          <span className="font-medium">
                            ₹{miscellaneousCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-medium">
                            <span className="text-gray-700">Total Cost:</span>
                            <span className="text-green-700">₹{calculateTotalCost().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Profit Margin */}
                      <div className={`p-3 rounded-md ${calculateMargin() >= 50 ? 'bg-green-50' : calculateMargin() >= 25 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className="text-xs text-gray-600">Profit Margin</div>
                        <div className={`text-lg font-semibold ${calculateMargin() >= 50 ? 'text-green-800' : calculateMargin() >= 25 ? 'text-yellow-800' : 'text-red-800'}`}>
                          {calculateMargin()}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Sales Price: ₹{formData.salesPrice || "0"} | Total Cost: ₹{calculateTotalCost().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/project-manager/dashboard/inventory/products/stock-items")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}