// app/project-manager/dashboard/production/manufacturing-orders/[id]/page.js - UPDATED

"use client";

import DashboardLayout from "../../../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Eye,
    Calendar,
    Package,
    User,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock,
    Wrench,
    Factory,
    Settings,
    TrendingUp,
    BarChart3,
    Edit,
    Play,
    Pause,
    Filter,
    Download,
    Printer,
    RefreshCw,
    Truck,
    MapPin,
    Phone,
    Mail,
    FileText,
    Box,
    Layers,
    ClipboardList,
    ChevronDown,
    ChevronUp
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManufacturingOrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [activeTab, setActiveTab] = useState("workOrders");
    const [loading, setLoading] = useState(true);
    const [manufacturingOrder, setManufacturingOrder] = useState(null);
    const [workOrders, setWorkOrders] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [expandedVariants, setExpandedVariants] = useState({}); // Track which work order's variants are expanded

    const fetchManufacturingOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/manufacturing-orders/${id}`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setManufacturingOrder(data.manufacturingOrder);
                    setWorkOrders(data.manufacturingOrder.workOrders || []);
                    setRawMaterials(data.manufacturingOrder.rawMaterialRequirements || []);
                }
            }
        } catch (error) {
            console.error("Error fetching manufacturing order details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchManufacturingOrderDetails();
        }
    }, [id]);

    const toggleVariantDetails = (workOrderId) => {
        setExpandedVariants(prev => ({
            ...prev,
            [workOrderId]: !prev[workOrderId]
        }));
    };

    const getWorkOrderStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-red-300 text-black-800";
            case "planned": return "bg-blue-100 text-blue-800";
            case "scheduled": return "bg-purple-100 text-purple-800";
            case "ready_to_start": return "bg-yellow-100 text-yellow-800";
            case "in_progress": return "bg-green-100 text-green-800";
            case "paused": return "bg-orange-100 text-orange-800";
            case "completed": return "bg-teal-100 text-teal-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getRawMaterialStatusColor = (status) => {
        switch (status) {
            case "available": return "bg-green-100 text-green-800";
            case "partial": return "bg-yellow-100 text-yellow-800";
            case "unavailable": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const handlePlanWorkOrder = (workOrderId) => {
        router.push(`/project-manager/dashboard/production/manufacturing-orders/planning/${workOrderId}`);
    };

    const handleViewWorkOrder = (workOrderId) => {
        router.push(`/project-manager/dashboard/production/work-orders/${workOrderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading manufacturing order details...</p>
                </div>
            </div>
        );
    }

    if (!manufacturingOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Manufacturing Order Not Found</h3>
                    <p className="text-gray-600 mb-4">The manufacturing order you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">View MO Details</h1>
                            <p className="text-gray-600">
                                Customer PO: {manufacturingOrder.requestId} | 
                                {manufacturingOrder.quotation?.quotationNumber && ` Quotation: ${manufacturingOrder.quotation.quotationNumber}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={fetchManufacturingOrderDetails}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("workOrders")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "workOrders"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" />
                                Work Orders ({workOrders.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("rawMaterials")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "rawMaterials"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Box className="w-4 h-4" />
                                Raw Materials ({rawMaterials.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("delivery")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "delivery"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Delivery Details
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Work Orders Tab */}
                {activeTab === "workOrders" && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">Total Work Orders</div>
                                        <div className="text-2xl font-bold text-gray-900">{workOrders.length}</div>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">Planned</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {workOrders.filter(wo => wo.status === 'planned').length}
                                        </div>
                                    </div>
                                    <Clock className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">Scheduled</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {workOrders.filter(wo => wo.status === 'scheduled').length}
                                        </div>
                                    </div>
                                    <Calendar className="w-8 h-8 text-purple-600" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">In Progress</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {workOrders.filter(wo => wo.status === 'in_progress').length}
                                        </div>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">Completed</div>
                                        <div className="text-2xl font-bold text-teal-600">
                                            {workOrders.filter(wo => wo.status === 'completed').length}
                                        </div>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-teal-600" />
                                </div>
                            </div>
                        </div>

                        {/* Work Orders Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workOrders.map((wo) => (
                                <div key={wo._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        {/* Work Order Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">WO-{wo.workOrderNumber?.slice(-8) || wo._id.toString().slice(-8)}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {wo.stockItemName} ({wo.stockItemReference})
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getWorkOrderStatusColor(wo.status)}`}>
                                                {wo.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Variant Details - Collapsible */}
                                        {wo.variantAttributes && wo.variantAttributes.length > 0 && (
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => toggleVariantDetails(wo._id)}
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
                                                >
                                                    {expandedVariants[wo._id] ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                    <span>Variant Details ({wo.variantAttributes.length})</span>
                                                </button>
                                                
                                                {expandedVariants[wo._id] && (
                                                    <div className="pl-6 space-y-1 border-l-2 border-gray-200">
                                                        {wo.variantAttributes?.map((attr, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">{attr.name}:</span>
                                                                <span className="font-medium">{attr.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Quantity */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Quantity</span>
                                            </div>
                                            <span className="font-bold text-blue-600">{wo.quantity} units</span>
                                        </div>

                                        {/* Operations */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Settings className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Operations</span>
                                            </div>
                                            <div className="text-sm">
                                                {wo.operations?.length || 0} operations needed
                                            </div>
                                        </div>

                                        {/* Raw Materials */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Box className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Raw Materials</span>
                                            </div>
                                            <div className="text-sm">
                                                {wo.rawMaterials?.length || 0} raw material types
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewWorkOrder(wo._id)}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View WO
                                            </button>
                                            {wo.status === 'pending' && (
                                                <button
                                                    onClick={() => handlePlanWorkOrder(wo._id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Create Plan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Raw Materials Tab */}
                {activeTab === "rawMaterials" && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Material Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-900">{rawMaterials.length}</div>
                                    <div className="text-sm text-blue-700">Total Items</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-900">
                                        {rawMaterials.filter(m => m.status === "available").length}
                                    </div>
                                    <div className="text-sm text-green-700">Fully Available</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-900">
                                        {rawMaterials.filter(m => m.status === "partial").length}
                                    </div>
                                    <div className="text-sm text-yellow-700">Partially Available</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-900">
                                        {rawMaterials.filter(m => m.status === "unavailable").length}
                                    </div>
                                    <div className="text-sm text-red-700">Not Available</div>
                                </div>
                            </div>
                        </div>

                        {/* Raw Materials Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Raw Material Requirements</h2>
                                        <p className="text-gray-600">Total required cost: {formatCurrency(manufacturingOrder.totalRawMaterialCost || 0)}</p>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Filter
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Raw Material
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Required
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Available
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {rawMaterials.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-8 text-center">
                                                    <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-600">No raw materials required for this manufacturing order.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            rawMaterials.map((material, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{material.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{material.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">{material.quantityRequired.toFixed(2)} {material.unit}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`font-medium ${material.availableQuantity >= material.quantityRequired
                                                                ? "text-green-600"
                                                                : material.availableQuantity > 0
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                            }`}>
                                                            {material.availableQuantity.toFixed(2)} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getRawMaterialStatusColor(material.status)}`}>
                                                            {material.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery Details Tab */}
                {activeTab === "delivery" && (
                    <div className="space-y-6">
                        {/* Delivery Information */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-600">Delivery Address</div>
                                                <div className="font-medium">{manufacturingOrder.customerInfo?.address}</div>
                                                <div className="text-sm text-gray-600">
                                                    {manufacturingOrder.customerInfo?.city}, {manufacturingOrder.customerInfo?.postalCode}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-600">Delivery Deadline</div>
                                                <div className="font-medium">
                                                    {manufacturingOrder.deliveryDeadline
                                                        ? formatDate(manufacturingOrder.deliveryDeadline)
                                                        : "Not specified"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-600">Contact Person</div>
                                                <div className="font-medium">{manufacturingOrder.customerInfo?.name}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-600">Contact Phone</div>
                                                <div className="font-medium">{manufacturingOrder.customerInfo?.phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-600">Email</div>
                                            <div className="font-medium">{manufacturingOrder.customerInfo?.email}</div>
                                        </div>
                                    </div>
                                </div>

                                {manufacturingOrder.specialInstructions && (
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm text-gray-600">Special Instructions</div>
                                                <div className="text-gray-700 whitespace-pre-line">
                                                    {manufacturingOrder.specialInstructions}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Total Work Orders</div>
                                    <div className="font-medium">{workOrders.length}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Total Quantity</div>
                                    <div className="font-medium">{manufacturingOrder.workOrderStats?.totalQuantity || 0} units</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Order Value</div>
                                    <div className="font-medium text-green-600">{formatCurrency(manufacturingOrder.finalOrderPrice)}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Amount Paid</div>
                                    <div className="font-medium text-blue-600">{formatCurrency(manufacturingOrder.totalPaidAmount)}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Amount Due</div>
                                    <div className="font-medium text-orange-600">{formatCurrency(manufacturingOrder.totalDueAmount)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Request Created</div>
                                    <div className="font-medium">{formatDate(manufacturingOrder.createdAt)}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Sales Approved</div>
                                    <div className="font-medium">
                                        {manufacturingOrder.timeline?.salesApproved
                                            ? formatDate(manufacturingOrder.timeline.salesApproved)
                                            : "Not available"}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Estimated Completion</div>
                                    <div className="font-medium">
                                        {manufacturingOrder.estimatedCompletion
                                            ? formatDate(manufacturingOrder.estimatedCompletion)
                                            : "Not set"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}