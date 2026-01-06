// app/project-manager/dashboard/production/manufacturing-orders/planning/[id]/page.js

"use client";

import DashboardLayout from "../../../../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Check,
    Package,
    Wrench,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Eye,
    Truck,
    User,
    MapPin,
    Phone,
    Mail,
    ChevronRight,
    ChevronLeft,
    RefreshCw
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WorkOrderPlanningPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workOrder, setWorkOrder] = useState(null);
    const [step, setStep] = useState(1);
    
    // Raw Materials State
    const [rawMaterials, setRawMaterials] = useState([]);
    
    // Operations State
    const [operations, setOperations] = useState([]);
    const [availableMachines, setAvailableMachines] = useState({});
    
    // Timeline State
    const [timeline, setTimeline] = useState({
        plannedStartDate: "",
        scheduledStartDate: "",
        scheduledEndDate: ""
    });
    
    const [planningNotes, setPlanningNotes] = useState("");

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
                    setRawMaterials(data.workOrder.rawMaterials || []);
                    setOperations(data.workOrder.operations || []);
                    
                    // Initialize timeline
                    if (data.workOrder.timeline) {
                        setTimeline({
                            plannedStartDate: data.workOrder.timeline.plannedStartDate 
                                ? new Date(data.workOrder.timeline.plannedStartDate).toISOString().split('T')[0]
                                : "",
                            scheduledStartDate: data.workOrder.timeline.scheduledStartDate 
                                ? new Date(data.workOrder.timeline.scheduledStartDate).toISOString().split('T')[0]
                                : "",
                            scheduledEndDate: data.workOrder.timeline.scheduledEndDate 
                                ? new Date(data.workOrder.timeline.scheduledEndDate).toISOString().split('T')[0]
                                : ""
                        });
                    }
                    
                    setPlanningNotes(data.workOrder.planningNotes || "");
                }
            }
        } catch (error) {
            console.error("Error fetching work order details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMachinesForOperation = async (machineType) => {
        if (!machineType) return [];
        
        try {
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/machines/${machineType}`,
                { credentials: "include" }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.machines;
                }
            }
            return [];
        } catch (error) {
            console.error("Error fetching machines:", error);
            return [];
        }
    };

    useEffect(() => {
        if (id) {
            fetchWorkOrderDetails();
        }
    }, [id]);

    useEffect(() => {
        // Pre-fetch machines for all operation types
        const fetchAllMachines = async () => {
            const machineTypes = [...new Set(operations.map(op => op.machineType))];
            const machinesMap = {};
            
            for (const type of machineTypes) {
                if (type) {
                    const machines = await fetchMachinesForOperation(type);
                    machinesMap[type] = machines;
                }
            }
            
            setAvailableMachines(machinesMap);
        };
        
        if (operations.length > 0) {
            fetchAllMachines();
        }
    }, [operations]);

    // Raw Material Handlers
    const handleRawMaterialAllocation = (index, quantity) => {
        const updatedMaterials = [...rawMaterials];
        const material = updatedMaterials[index];
        
        const allocated = Math.min(Math.max(0, quantity), material.quantityRequired);
        material.quantityAllocated = allocated;
        
        if (allocated >= material.quantityRequired) {
            material.allocationStatus = "fully_allocated";
        } else if (allocated > 0) {
            material.allocationStatus = "partially_allocated";
        } else {
            material.allocationStatus = "not_allocated";
        }
        
        setRawMaterials(updatedMaterials);
    };

    // Operation Handlers
    const handleMachineAssignment = async (opIndex, machineId) => {
        const updatedOperations = [...operations];
        const operation = updatedOperations[opIndex];
        
        operation.assignedMachine = machineId;
        
        if (machineId) {
            const machineType = operation.machineType;
            if (availableMachines[machineType]) {
                const machine = availableMachines[machineType].find(m => m._id === machineId);
                if (machine) {
                    operation.assignedMachineName = machine.name;
                    operation.assignedMachineSerial = machine.serialNumber;
                }
            }
        } else {
            operation.assignedMachineName = null;
            operation.assignedMachineSerial = null;
        }
        
        setOperations(updatedOperations);
    };

    const handleTimeChange = (opIndex, seconds) => {
        const updatedOperations = [...operations];
        updatedOperations[opIndex].plannedTimeSeconds = Math.max(0, seconds);
        setOperations(updatedOperations);
    };

    const handleAddCustomMachine = async (opIndex) => {
        // In a real app, this would open a modal to add new machine
        const machineName = prompt("Enter new machine name:");
        const machineSerial = prompt("Enter machine serial number:");
        
        if (machineName && machineSerial) {
            // Here you would call API to create new machine
            alert(`New machine "${machineName}" added. In production, this would create a new machine record.`);
        }
    };

    // Save Handlers
    const saveRawMaterialAllocations = async () => {
        try {
            setSaving(true);
            const allocations = rawMaterials.map(rm => ({
                rawItemId: rm.rawItemId,
                quantityAllocated: rm.quantityAllocated || 0,
                notes: rm.notes || ""
            }));

            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/allocate-raw-materials`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rawMaterialAllocations: allocations,
                        planningNotes
                    }),
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("Raw materials allocated successfully!");
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Error saving raw material allocations:", error);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveOperationsPlanning = async () => {
        try {
            setSaving(true);
            const operationsData = operations.map(op => ({
                _id: op._id,
                assignedMachine: op.assignedMachine,
                plannedTimeSeconds: op.plannedTimeSeconds || op.estimatedTimeSeconds,
                scheduledStartTime: op.scheduledStartTime,
                scheduledEndTime: op.scheduledEndTime,
                notes: op.notes || ""
            }));

            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/plan-operations`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        operations: operationsData,
                        plannedStartDate: timeline.plannedStartDate,
                        planningNotes
                    }),
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("Operations planned successfully!");
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Error saving operations planning:", error);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const completePlanning = async () => {
        try {
            setSaving(true);
            
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/complete-planning`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        planningNotes,
                        timeline: {
                            scheduledStartDate: timeline.scheduledStartDate,
                            scheduledEndDate: timeline.scheduledEndDate
                        }
                    }),
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert("Planning completed successfully! Raw materials have been issued.");
                    router.push(`/project-manager/dashboard/production/work-orders/${id}`);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Error completing planning:", error);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleNextStep = async () => {
        if (step === 1) {
            const success = await saveRawMaterialAllocations();
            if (success) {
                setStep(2);
            }
        } else if (step === 2) {
            const success = await saveOperationsPlanning();
            if (success) {
                setStep(3);
            }
        }
    };

    const handleBackStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const secondsToTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
        
        return parts.join(' ') || '0s';
    };

    const calculateTotalPlannedTime = () => {
        return operations.reduce((total, op) => 
            total + (op.plannedTimeSeconds || op.estimatedTimeSeconds || 0), 0
        );
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackStep}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {workOrder.workOrderNumber} - Planning
                            </h1>
                            <p className="text-gray-600">
                                {workOrder.stockItemName} | {workOrder.quantity} units
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchWorkOrderDetails}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                                </div>
                                <span className="ml-2 font-medium">Raw Materials</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="ml-2 font-medium">Operations</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    3
                                </div>
                                <span className="ml-2 font-medium">Delivery & Timeline</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 1: Raw Materials */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Raw Material Allocation</h2>
                                <p className="text-gray-600">
                                    Allocate available raw materials for this work order
                                </p>
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
                                                Available
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Allocate
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
                                        {rawMaterials.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center">
                                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-600">No raw materials required for this work order.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            rawMaterials.map((material, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{material.name}</div>
                                                        <div className="text-sm text-gray-600">{material.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium">
                                                            {material.quantityRequired.toFixed(2)} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`font-medium ${
                                                            material.currentStock >= material.quantityRequired
                                                                ? "text-green-600"
                                                                : material.currentStock > 0
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                        }`}>
                                                            {material.currentStock.toFixed(2)} {material.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={Math.min(material.quantityRequired, material.currentStock)}
                                                                step="0.01"
                                                                value={material.quantityAllocated || 0}
                                                                onChange={(e) => handleRawMaterialAllocation(index, parseFloat(e.target.value))}
                                                                className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-600">{material.unit}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {material.quantityAllocated >= material.quantityRequired ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : material.quantityAllocated > 0 ? (
                                                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-500" />
                                                            )}
                                                            <span className={`text-xs font-medium ${
                                                                material.quantityAllocated >= material.quantityRequired
                                                                    ? "text-green-800"
                                                                    : material.quantityAllocated > 0
                                                                        ? "text-yellow-800"
                                                                        : "text-red-800"
                                                            }`}>
                                                                {material.quantityAllocated >= material.quantityRequired
                                                                    ? "Fully Allocated"
                                                                    : material.quantityAllocated > 0
                                                                        ? "Partially Allocated"
                                                                        : "Not Allocated"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={material.notes || ""}
                                                            onChange={(e) => {
                                                                const updated = [...rawMaterials];
                                                                updated[index].notes = e.target.value;
                                                                setRawMaterials(updated);
                                                            }}
                                                            placeholder="Add notes..."
                                                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Planning Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Planning Notes</h3>
                            <textarea
                                value={planningNotes}
                                onChange={(e) => setPlanningNotes(e.target.value)}
                                rows="3"
                                placeholder="Add any planning notes or special instructions..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handleBackStep}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save & Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Operations */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Operations Planning</h2>
                                <p className="text-gray-600">
                                    Assign machines and set timing for each operation
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                {operations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">No operations defined for this work order.</p>
                                    </div>
                                ) : (
                                    operations.map((operation, index) => (
                                        <div key={operation._id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {operation.operationType}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        Machine Type: {operation.machineType}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                        Step {index + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Machine Assignment */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Assign Machine
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={operation.assignedMachine || ""}
                                                            onChange={(e) => handleMachineAssignment(index, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select Machine</option>
                                                            {availableMachines[operation.machineType]?.map((machine) => (
                                                                <option key={machine._id} value={machine._id}>
                                                                    {machine.name} ({machine.serialNumber})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleAddCustomMachine(index)}
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            New
                                                        </button>
                                                    </div>
                                                    {operation.assignedMachineName && (
                                                        <div className="mt-2 text-sm text-gray-600">
                                                            Selected: {operation.assignedMachineName} ({operation.assignedMachineSerial})
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Time Setting */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Operation Time
                                                    </label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                Estimated: {secondsToTime(operation.estimatedTimeSeconds || 0)}
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="60"
                                                                value={operation.plannedTimeSeconds || operation.estimatedTimeSeconds || 0}
                                                                onChange={(e) => handleTimeChange(index, parseInt(e.target.value))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Enter time in seconds
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-blue-600">
                                                                {secondsToTime(operation.plannedTimeSeconds || operation.estimatedTimeSeconds || 0)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">Planned Time</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Operation Notes */}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Operation Notes
                                                </label>
                                                <textarea
                                                    value={operation.notes || ""}
                                                    onChange={(e) => {
                                                        const updated = [...operations];
                                                        updated[index].notes = e.target.value;
                                                        setOperations(updated);
                                                    }}
                                                    rows="2"
                                                    placeholder="Add notes for this operation..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Total Time Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Time Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-900">
                                        {operations.length}
                                    </div>
                                    <div className="text-sm text-blue-700">Total Operations</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-900">
                                        {operations.filter(op => op.assignedMachine).length}
                                    </div>
                                    <div className="text-sm text-green-700">Machines Assigned</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-900">
                                        {secondsToTime(calculateTotalPlannedTime())}
                                    </div>
                                    <div className="text-sm text-purple-700">Total Planned Time</div>
                                </div>
                            </div>
                        </div>

                        {/* Planning Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Planning Notes</h3>
                            <textarea
                                value={planningNotes}
                                onChange={(e) => setPlanningNotes(e.target.value)}
                                rows="3"
                                placeholder="Add any planning notes or special instructions..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handleBackStep}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save & Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Delivery & Timeline */}
                {step === 3 && (
                    <div className="space-y-6">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                            <div className="space-y-4">
                                {workOrder.customerRequestId?.customerInfo && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">Customer</span>
                                                </div>
                                                <div className="text-gray-700 pl-6">
                                                    {workOrder.customerRequestId.customerInfo.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">Phone</span>
                                                </div>
                                                <div className="text-gray-700 pl-6">
                                                    {workOrder.customerRequestId.customerInfo.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">Delivery Address</span>
                                            </div>
                                            <div className="text-gray-700 pl-6">
                                                {workOrder.customerRequestId.customerInfo.address}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Truck className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">Delivery Deadline</span>
                                            </div>
                                            <div className="text-gray-700 pl-6">
                                                {workOrder.customerRequestId.deliveryDeadline
                                                    ? formatDate(workOrder.customerRequestId.deliveryDeadline)
                                                    : "Not specified"}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Timeline Planning */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Timeline</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Scheduled Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={timeline.scheduledStartDate}
                                            onChange={(e) => setTimeline({...timeline, scheduledStartDate: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Scheduled End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={timeline.scheduledEndDate}
                                            onChange={(e) => setTimeline({...timeline, scheduledEndDate: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Time Summary */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Production Time Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total Operations:</span>
                                            <span className="font-medium">{operations.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total Planned Time:</span>
                                            <span className="font-medium text-blue-600">
                                                {secondsToTime(calculateTotalPlannedTime())}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Machines Assigned:</span>
                                            <span className="font-medium text-green-600">
                                                {operations.filter(op => op.assignedMachine).length} / {operations.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Raw Material Summary */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Raw Material Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Total Raw Materials:</span>
                                            <span className="font-medium">{rawMaterials.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Fully Allocated:</span>
                                            <span className="font-medium text-green-600">
                                                {rawMaterials.filter(rm => rm.allocationStatus === "fully_allocated").length} / {rawMaterials.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">To Be Issued:</span>
                                            <span className="font-medium text-blue-600">
                                                {rawMaterials.filter(rm => rm.quantityAllocated > 0).length} items
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Planning Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Final Planning Notes</h3>
                            <textarea
                                value={planningNotes}
                                onChange={(e) => setPlanningNotes(e.target.value)}
                                rows="4"
                                placeholder="Add final planning notes, special instructions, or production requirements..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={handleBackStep}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={saveOperationsPlanning}
                                    disabled={saving}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Draft
                                </button>
                                <button
                                    onClick={completePlanning}
                                    disabled={saving}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Complete Planning
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}