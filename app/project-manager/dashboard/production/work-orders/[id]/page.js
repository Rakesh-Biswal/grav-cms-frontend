// app/project-manager/dashboard/production/work-orders/[id]/page.js - UPDATED

"use client";

import DashboardLayout from "../../../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Eye,
    Package,
    Wrench,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Edit,
    Truck,
    User,
    MapPin,
    Phone,
    Mail,
    Settings,
    Factory,
    BarChart3,
    FileText,
    RefreshCw,
    Printer,
    Download,
    Play,
    Pause,
    CheckSquare,
    Barcode,
    QrCode,
    Copy,
    Scan
} from "lucide-react";
import dynamic from 'next/dynamic';

import BarcodeGenerator from './components/BarcodeGenerator';


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WorkOrderViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [workOrder, setWorkOrder] = useState(null);
    const [stockItem, setStockItem] = useState(null);
    const [customerRequest, setCustomerRequest] = useState(null);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [barcodeData, setBarcodeData] = useState(null);
    const [barcodeLoading, setBarcodeLoading] = useState(false);
    const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);


    const fetchWorkOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/planning`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setWorkOrder(data.workOrder);
                    setStockItem(data.workOrder.stockItemId || data.workOrder.stockItem);

                    if (data.workOrder.customerRequestId) {
                        const requestResponse = await fetch(
                            `${API_URL}/api/cms/manufacturing/manufacturing-orders/${data.workOrder.customerRequestId}`,
                            { credentials: "include" }
                        );

                        if (requestResponse.ok) {
                            const requestData = await requestResponse.json();
                            if (requestData.success) {
                                setCustomerRequest(requestData.manufacturingOrder);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching work order details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchWorkOrderDetails();
        }
    }, [id]);

    const generateBarcodeId = (sequence) => {
        if (!workOrder) return '';

        // Barcode ID Format: [WO Number]-[Sequence]-[Operation Count]-[Timestamp]
        const timestamp = Date.now().toString().slice(-8);
        const operationCount = workOrder.operations?.length || 0;
        return `${workOrder.workOrderNumber}-${sequence.toString().padStart(4, '0')}-${operationCount}-${timestamp}`;
    };

    const generateBarcodeData = async () => {
        if (!workOrder) return;

        setBarcodeLoading(true);
        try {
            const totalBarcodes = workOrder.quantity * (workOrder.operations?.length || 0);
            const barcodeItems = [];
            let sequence = 1;

            // Generate barcode data for each unit and operation
            for (let unit = 1; unit <= workOrder.quantity; unit++) {
                for (let opIndex = 0; opIndex < (workOrder.operations?.length || 0); opIndex++) {
                    const operation = workOrder.operations[opIndex];
                    const barcodeId = generateBarcodeId(sequence);

                    barcodeItems.push({
                        id: barcodeId,
                        sequence: sequence,
                        unitNumber: unit,
                        operationIndex: opIndex + 1,
                        operationType: operation?.operationType || 'Operation',
                        machineName: operation?.assignedMachineName || 'Not Assigned',
                        productName: workOrder.stockItemName,
                        productCode: workOrder.stockItemReference,
                        workOrderNumber: workOrder.workOrderNumber,
                        variant: workOrder.variantAttributes?.map(attr => `${attr.name}:${attr.value}`).join(', ') || 'Standard'
                    });

                    sequence++;
                }
            }

            setBarcodeData({
                items: barcodeItems,
                workOrder: workOrder,
                generatedAt: new Date().toISOString(),
                totalBarcodes: barcodeItems.length
            });
            setShowBarcodeModal(true);
        } catch (error) {
            console.error("Error generating barcode data:", error);
            alert("Error generating barcode data");
        } finally {
            setBarcodeLoading(false);
        }
    };

    const handlePrintBarcodes = () => {
        // This will be handled by the BarcodePDF component
        generateBarcodeData();
    };

    

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-gray-100 text-gray-800";
            case "planned": return "bg-blue-100 text-blue-800";
            case "scheduled": return "bg-purple-100 text-purple-800";
            case "ready_to_start": return "bg-yellow-100 text-yellow-800";
            case "in_progress": return "bg-green-100 text-green-800";
            case "paused": return "bg-orange-100 text-orange-800";
            case "completed": return "bg-teal-100 text-teal-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "partial_allocation": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getRawMaterialStatusColor = (status) => {
        switch (status) {
            case "fully_allocated":
            case "issued": return "bg-green-100 text-green-800";
            case "partially_allocated": return "bg-yellow-100 text-yellow-800";
            case "not_allocated": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getOperationStatusColor = (status) => {
        switch (status) {
            case "scheduled": return "bg-purple-100 text-purple-800";
            case "in_progress": return "bg-green-100 text-green-800";
            case "completed": return "bg-teal-100 text-teal-800";
            case "pending": return "bg-gray-100 text-gray-800";
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

    const secondsToTime = (seconds) => {
        if (!seconds) return "0s";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

        return parts.join(' ') || '0s';
    };

    const handleEditPlanning = () => {
        router.push(`/project-manager/dashboard/production/manufacturing-orders/planning/${id}`);
    };

    const handleStartProduction = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/start-production`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("Production started successfully!");
                    fetchWorkOrderDetails();
                }
            }
        } catch (error) {
            console.error("Error starting production:", error);
        }
    };

    const handleCompleteWorkOrder = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/complete`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("Work order completed successfully!");
                    fetchWorkOrderDetails();
                }
            }
        } catch (error) {
            console.error("Error completing work order:", error);
        }
    };

    const handlePauseResume = async (action) => {
        try {
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/${action}`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert(`Work order ${action === 'pause' ? 'paused' : 'resumed'} successfully!`);
                    fetchWorkOrderDetails();
                }
            }
        } catch (error) {
            console.error(`Error ${action}ing work order:`, error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading work order details...</p>
                </div>
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Work Order Not Found</h3>
                    <p className="text-gray-600 mb-4">The work order you're looking for doesn't exist.</p>
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

    const needsPlanning = workOrder.status === "pending" ||
        workOrder.status === "planned" ||
        workOrder.rawMaterials?.some(rm => rm.allocationStatus === "not_allocated") ||
        workOrder.operations?.some(op => !op.assignedMachine);

    const totalBarcodes = workOrder.quantity * (workOrder.operations?.length || 0);

    return (
        <DashboardLayout activeMenu="production">
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
                            <h1 className="text-2xl font-bold text-gray-900">View Work Order</h1>
                            <p className="text-gray-600">
                                {workOrder.workOrderNumber} | {workOrder.stockItemName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {workOrder.status === "planned" && totalBarcodes > 0 && (
                            <button
                                onClick={() => setShowBarcodeGenerator(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                            >
                                <Barcode className="w-4 h-4" />
                                Generate Barcodes ({totalBarcodes})
                            </button>
                        )}
                        <button
                            onClick={fetchWorkOrderDetails}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        {needsPlanning ? (
                            <button
                                onClick={handleEditPlanning}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Plan Work Order
                            </button>
                        ) : (
                            <>
                                {workOrder.status === "scheduled" && (
                                    <button
                                        onClick={handleStartProduction}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Start Production
                                    </button>
                                )}
                                {workOrder.status === "in_progress" && (
                                    <>
                                        <button
                                            onClick={() => handlePauseResume('pause')}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
                                        >
                                            <Pause className="w-4 h-4" />
                                            Pause
                                        </button>
                                        <button
                                            onClick={handleCompleteWorkOrder}
                                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
                                        >
                                            <CheckSquare className="w-4 h-4" />
                                            Complete
                                        </button>
                                    </>
                                )}
                                {workOrder.status === "paused" && (
                                    <button
                                        onClick={() => handlePauseResume('resume')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Resume
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Status and Info Bar */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div>
                            <div className="text-sm text-gray-600">Status</div>
                            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(workOrder.status)}`}>
                                {workOrder.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Priority</div>
                            <div className="font-medium">{workOrder.priority.toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Quantity</div>
                            <div className="font-medium text-blue-600">{workOrder.quantity} units</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Created</div>
                            <div className="font-medium">{formatDate(workOrder.createdAt)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Planned By</div>
                            <div className="font-medium">
                                {workOrder.plannedBy?.name || workOrder.createdBy?.name || 'Not planned'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "overview"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Overview
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
                                <Package className="w-4 h-4" />
                                Raw Materials ({workOrder.rawMaterials?.length || 0})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("operations")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "operations"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                Operations ({workOrder.operations?.length || 0})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("timeline")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "timeline"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Timeline
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
                                Delivery
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Product Details */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-600">Product Name</div>
                                        <div className="font-medium">{workOrder.stockItemName}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Product Code</div>
                                        <div className="font-medium">{workOrder.stockItemReference}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Work Order</div>
                                        <div className="font-medium text-blue-600">{workOrder.workOrderNumber}</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-600">Variant Details</div>
                                        {workOrder.variantAttributes?.length > 0 ? (
                                            workOrder.variantAttributes.map((attr, index) => (
                                                <div key={index} className="text-sm">
                                                    <span className="font-medium">{attr.name}:</span> {attr.value}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500">Standard variant</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Special Instructions</div>
                                        {workOrder.specialInstructions?.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-gray-700">
                                                {workOrder.specialInstructions.map((instruction, index) => (
                                                    <li key={index}>{instruction}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-gray-500">No special instructions</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Planning Status */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planning Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        <div className="text-lg font-bold text-blue-900">
                                            {workOrder.rawMaterials?.filter(rm =>
                                                rm.allocationStatus === "fully_allocated" || rm.allocationStatus === "issued"
                                            ).length || 0} / {workOrder.rawMaterials?.length || 0}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700">Raw Materials Allocated</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Factory className="w-5 h-5 text-green-600" />
                                        <div className="text-lg font-bold text-green-900">
                                            {workOrder.operations?.filter(op => op.assignedMachine).length || 0} / {workOrder.operations?.length || 0}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700">Machines Assigned</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                        <div className="text-lg font-bold text-purple-900">
                                            {secondsToTime(workOrder.timeline?.totalPlannedSeconds || 0)}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700">Total Planned Time</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Barcode className="w-5 h-5 text-purple-600" />
                                        <div className="text-lg font-bold text-purple-900">
                                            {totalBarcodes}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700">Barcodes Needed</div>
                                </div>
                            </div>

                            {needsPlanning && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-800">Planning Required</h4>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                This work order needs planning. Some raw materials are not allocated or machines are not assigned.
                                            </p>
                                            <button
                                                onClick={handleEditPlanning}
                                                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Go to Planning
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cost Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Estimated Raw Material Cost</div>
                                    <div className="font-medium">{formatCurrency(workOrder.estimatedCost)}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-600">Actual Cost (to date)</div>
                                    <div className="font-medium">{formatCurrency(workOrder.actualCost)}</div>
                                </div>
                                {workOrder.qualityCheck && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-gray-600">Quality Check</div>
                                        <div className="flex items-center gap-2">
                                            {workOrder.qualityCheck.passed ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-600">Passed</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-600">Not Passed</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Raw Materials Tab */}
                {activeTab === "rawMaterials" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Raw Materials</h2>
                                        <p className="text-gray-600">
                                            Total estimated cost: {formatCurrency(workOrder.estimatedCost || 0)}
                                        </p>
                                    </div>
                                    {needsPlanning && (
                                        <button
                                            onClick={handleEditPlanning}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Allocation
                                        </button>
                                    )}
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
                                                Required
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Allocated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Issued
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Unit Cost
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Cost
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {!workOrder.rawMaterials || workOrder.rawMaterials.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-8 text-center">
                                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-600">No raw materials required for this work order.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            workOrder.rawMaterials.map((material, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{material.name}</div>
                                                        <div className="text-sm text-gray-600">{material.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">
                                                            {material.quantityRequired?.toFixed(2) || '0'} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">
                                                            {material.quantityAllocated?.toFixed(2) || '0'} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">
                                                            {material.quantityIssued?.toFixed(2) || '0'} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">{formatCurrency(material.unitCost || 0)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-blue-600">
                                                            {formatCurrency(material.totalCost || 0)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getRawMaterialStatusColor(material.allocationStatus)}`}>
                                                            {material.allocationStatus?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 max-w-xs">
                                                            {material.notes || "No notes"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-xl font-bold text-blue-900">
                                            {workOrder.rawMaterials?.length || 0}
                                        </div>
                                        <div className="text-sm text-blue-700">Total Items</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-xl font-bold text-green-900">
                                            {workOrder.rawMaterials?.filter(m =>
                                                m.allocationStatus === "fully_allocated" || m.allocationStatus === "issued"
                                            ).length || 0}
                                        </div>
                                        <div className="text-sm text-green-700">Fully Allocated</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-xl font-bold text-yellow-900">
                                            {workOrder.rawMaterials?.filter(m => m.allocationStatus === "partially_allocated").length || 0}
                                        </div>
                                        <div className="text-sm text-yellow-700">Partially Allocated</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-xl font-bold text-red-900">
                                            {workOrder.rawMaterials?.filter(m => m.allocationStatus === "not_allocated").length || 0}
                                        </div>
                                        <div className="text-sm text-red-700">Not Allocated</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Operations Tab */}
                {activeTab === "operations" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Operations</h2>
                                        <p className="text-gray-600">
                                            Total planned time: {secondsToTime(workOrder.timeline?.totalPlannedSeconds || 0)}
                                        </p>
                                    </div>
                                    {needsPlanning && (
                                        <button
                                            onClick={handleEditPlanning}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Operations
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {!workOrder.operations || workOrder.operations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">No operations defined for this work order.</p>
                                    </div>
                                ) : (
                                    workOrder.operations.map((operation, index) => (
                                        <div key={operation._id || index} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Wrench className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                                {operation.operationType}
                                                            </h3>
                                                            <p className="text-gray-600">
                                                                {operation.machineType} • Step {index + 1} of {workOrder.operations.length}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs rounded-full ${getOperationStatusColor(operation.status)}`}>
                                                        {operation.status?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {secondsToTime(operation.plannedTimeSeconds || operation.estimatedTimeSeconds || 0)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Planned Time</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Machine Information */}
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-3">Machine Assignment</h4>
                                                    {operation.assignedMachine ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Factory className="w-4 h-4 text-green-500" />
                                                                <span className="font-medium">{operation.assignedMachineName}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 pl-6">
                                                                Serial: {operation.assignedMachineSerial}
                                                            </div>
                                                            {operation.additionalMachines?.length > 0 && (
                                                                <div className="mt-3">
                                                                    <div className="text-sm font-medium text-gray-700 mb-1">Additional Machines:</div>
                                                                    {operation.additionalMachines.map((am, amIdx) => (
                                                                        <div key={amIdx} className="text-sm text-gray-600 pl-4">
                                                                            • {am.assignedMachineName} ({am.assignedMachineSerial})
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-yellow-600">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span>No machine assigned</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Timing Information */}
                                                <div>
                                                    <h4 className="font-medium text-gray-700 mb-3">Timing</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Estimated:</span>
                                                            <span>{secondsToTime(operation.estimatedTimeSeconds || 0)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Planned:</span>
                                                            <span className="font-medium">
                                                                {secondsToTime(operation.plannedTimeSeconds || operation.estimatedTimeSeconds || 0)}
                                                            </span>
                                                        </div>
                                                        {operation.maxAllowedSeconds && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Max Allowed (70% eff.):</span>
                                                                <span className="text-orange-600">
                                                                    {secondsToTime(operation.maxAllowedSeconds)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Operation Notes */}
                                            {operation.notes && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                                                    <p className="text-gray-600">{operation.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Production Timeline</h2>
                            <div className="space-y-8">
                                {/* Timeline Events */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">Work Order Created</h4>
                                                <span className="text-sm text-gray-600">{formatDate(workOrder.createdAt)}</span>
                                            </div>
                                            <p className="text-gray-600 mt-1">Work order was created from customer request</p>
                                        </div>
                                    </div>

                                    {workOrder.plannedAt && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Settings className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Planning Completed</h4>
                                                    <span className="text-sm text-gray-600">{formatDate(workOrder.plannedAt)}</span>
                                                </div>
                                                <p className="text-gray-600 mt-1">Work order was planned by {workOrder.plannedBy?.name || 'production planner'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.timeline?.scheduledStartDate && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Scheduled Start</h4>
                                                    <span className="text-sm text-gray-600">{formatDate(workOrder.timeline.scheduledStartDate)}</span>
                                                </div>
                                                <p className="text-gray-600 mt-1">Production is scheduled to start</p>
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.timeline?.scheduledEndDate && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Scheduled Completion</h4>
                                                    <span className="text-sm text-gray-600">{formatDate(workOrder.timeline.scheduledEndDate)}</span>
                                                </div>
                                                <p className="text-gray-600 mt-1">Production is scheduled to complete</p>
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.timeline?.actualStartDate && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Play className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Production Started</h4>
                                                    <span className="text-sm text-gray-600">{formatDate(workOrder.timeline.actualStartDate)}</span>
                                                </div>
                                                <p className="text-gray-600 mt-1">Production work actually started</p>
                                            </div>
                                        </div>
                                    )}

                                    {workOrder.timeline?.actualEndDate && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckSquare className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Production Completed</h4>
                                                    <span className="text-sm text-gray-600">{formatDate(workOrder.timeline.actualEndDate)}</span>
                                                </div>
                                                <p className="text-gray-600 mt-1">Production work was completed</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Time Summary */}
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Time Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <div className="text-lg font-bold text-blue-900">
                                                {secondsToTime(workOrder.timeline?.totalEstimatedSeconds || 0)}
                                            </div>
                                            <div className="text-sm text-blue-700">Estimated Time</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <div className="text-lg font-bold text-purple-900">
                                                {secondsToTime(workOrder.timeline?.totalPlannedSeconds || 0)}
                                            </div>
                                            <div className="text-sm text-purple-700">Planned Time</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg">
                                            <div className="text-lg font-bold text-green-900">
                                                {secondsToTime(workOrder.operations?.reduce((total, op) =>
                                                    total + (op.plannedTimeSeconds || op.estimatedTimeSeconds || 0), 0
                                                ) || 0)}
                                            </div>
                                            <div className="text-sm text-green-700">Operations Time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery Tab */}
                {activeTab === "delivery" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Information</h2>
                            <div className="space-y-6">
                                {/* Customer Information */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Customer Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm text-gray-600">Customer Name</div>
                                                <div className="font-medium">{workOrder.customerName || customerRequest?.customerInfo?.name || 'Not available'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm text-gray-600">Phone Number</div>
                                                <div className="font-medium">{customerRequest?.customerInfo?.phone || 'Not available'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm text-gray-600">Email Address</div>
                                                <div className="font-medium">{customerRequest?.customerInfo?.email || 'Not available'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="text-sm text-gray-600">Delivery Address</div>
                                                <div className="font-medium">{customerRequest?.customerInfo?.address || 'Not available'}</div>
                                                {customerRequest?.customerInfo?.city && (
                                                    <div className="text-sm text-gray-600">
                                                        {customerRequest.customerInfo.city}, {customerRequest.customerInfo.postalCode}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Timeline */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-4">Delivery Timeline</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-gray-600">Work Order Created</div>
                                            <div className="font-medium">{formatDate(workOrder.createdAt)}</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-gray-600">Sales Approval Date</div>
                                            <div className="font-medium">
                                                {customerRequest?.timeline?.salesApproved
                                                    ? formatDate(customerRequest.timeline.salesApproved)
                                                    : 'Not available'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-gray-600">Customer Delivery Deadline</div>
                                            <div className="font-medium">
                                                {customerRequest?.deliveryDeadline
                                                    ? formatDate(customerRequest.deliveryDeadline)
                                                    : 'Not specified'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-gray-600">Estimated Completion</div>
                                            <div className="font-medium">
                                                {workOrder.timeline?.scheduledEndDate
                                                    ? formatDate(workOrder.timeline.scheduledEndDate)
                                                    : workOrder.timeline?.plannedEndDate
                                                        ? formatDate(workOrder.timeline.plannedEndDate)
                                                        : 'Not scheduled'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Information */}
                                {customerRequest && (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Order Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-gray-600">Manufacturing Order</div>
                                                <div className="font-medium">{customerRequest.moNumber}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-gray-600">Customer PO Number</div>
                                                <div className="font-medium">{customerRequest.requestId}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-gray-600">Quotation Number</div>
                                                <div className="font-medium">{customerRequest.quotation?.quotationNumber || 'Not available'}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-gray-600">Total Order Value</div>
                                                <div className="font-medium text-green-600">
                                                    {formatCurrency(customerRequest.finalOrderPrice)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                {customerRequest?.specialInstructions && (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-4">Special Instructions</h3>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700 whitespace-pre-line">
                                                {customerRequest.specialInstructions}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Barcode Modal */}
            

            {showBarcodeGenerator && (
                <BarcodeGenerator
                    workOrder={workOrder}
                    onClose={() => setShowBarcodeGenerator(false)}
                />
            )}
        </DashboardLayout>
    );
}