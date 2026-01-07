// app/project-manager/dashboard/production/manufacturing-orders/planning/[id]/page.js - FINAL VERSION

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
    RefreshCw,
    X,
    Maximize2,
    Split,
    Info,
    AlertTriangle
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
    const [quantity, setQuantity] = useState(0);
    const [maxProducibleQuantity, setMaxProducibleQuantity] = useState(0);
    const [splitRemaining, setSplitRemaining] = useState(true);

    // Operations State
    const [operations, setOperations] = useState([]);
    const [availableMachines, setAvailableMachines] = useState({});
    const [totalPlannedTime, setTotalPlannedTime] = useState(0);
    const [efficiencyPercentage, setEfficiencyPercentage] = useState(100);

    // New Machine Modal State
    const [showNewMachineModal, setShowNewMachineModal] = useState(false);
    const [newMachineData, setNewMachineData] = useState({
        name: "",
        type: "",
        model: "",
        serialNumber: "",
        powerConsumption: "",
        location: "",
        lastMaintenance: "",
        nextMaintenance: ""
    });
    const [selectedOperationForNewMachine, setSelectedOperationForNewMachine] = useState(null);

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
                    setQuantity(data.workOrder.quantity);
                    setMaxProducibleQuantity(data.workOrder.maxProducibleQuantity || data.workOrder.quantity);

                    // Set operations with auto-calculated planned times (within 70% efficiency)
                    const opsWithMaxTimes = (data.workOrder.operations || []).map(op => ({
                        ...op,
                        plannedTimeSeconds: op.plannedTimeSeconds || op.estimatedTimeSeconds || 0,
                        maxAllowedSeconds: op.maxAllowedSeconds || Math.ceil((op.estimatedTimeSeconds || 0) / 0.7)
                    }));

                    setOperations(opsWithMaxTimes);

                    // Calculate initial total time and efficiency
                    const totalEst = opsWithMaxTimes.reduce((sum, op) => sum + (op.estimatedTimeSeconds || 0), 0);
                    const totalPlan = opsWithMaxTimes.reduce((sum, op) => sum + (op.plannedTimeSeconds || 0), 0);
                    setTotalPlannedTime(totalPlan);
                    setEfficiencyPercentage(totalEst > 0 ? Math.min(100, Math.round((totalEst / totalPlan) * 100)) : 100);

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

    const createNewMachine = async (machineData) => {
        try {
            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/machines`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(machineData),
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.machine;
            }
            return null;
        } catch (error) {
            console.error("Error creating machine:", error);
            return null;
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
    // Update handleQuantityChange function
    const handleQuantityChange = (newQuantity) => {
        const numericValue = parseInt(newQuantity) || 1;
        // Don't allow more than max producible or less than 1
        const validQuantity = Math.max(1, Math.min(numericValue, maxProducibleQuantity));
        setQuantity(validQuantity);
    };

    

    // Operation Handlers
    const handlePrimaryMachineAssignment = async (opIndex, machineId) => {
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

    const handleAddAdditionalMachine = (opIndex) => {
        const updatedOperations = [...operations];
        if (!updatedOperations[opIndex].additionalMachines) {
            updatedOperations[opIndex].additionalMachines = [];
        }
        updatedOperations[opIndex].additionalMachines.push({
            _id: `temp-${Date.now()}-${Math.random()}`,
            assignedMachine: "",
            assignedMachineName: "",
            assignedMachineSerial: "",
            notes: ""
        });
        setOperations(updatedOperations);
    };

    const handleAdditionalMachineChange = (opIndex, machineIndex, machineId) => {
        const updatedOperations = [...operations];
        const operation = updatedOperations[opIndex];
        const additionalMachine = operation.additionalMachines[machineIndex];

        additionalMachine.assignedMachine = machineId;

        if (machineId) {
            const machineType = operation.machineType;
            if (availableMachines[machineType]) {
                const machine = availableMachines[machineType].find(m => m._id === machineId);
                if (machine) {
                    additionalMachine.assignedMachineName = machine.name;
                    additionalMachine.assignedMachineSerial = machine.serialNumber;
                }
            }
        } else {
            additionalMachine.assignedMachineName = null;
            additionalMachine.assignedMachineSerial = null;
        }

        setOperations(updatedOperations);
    };

    const handleRemoveAdditionalMachine = (opIndex, machineIndex) => {
        const updatedOperations = [...operations];
        updatedOperations[opIndex].additionalMachines.splice(machineIndex, 1);
        setOperations(updatedOperations);
    };



    const handleSaveNewMachine = async () => {
        try {
            const machine = await createNewMachine({
                ...newMachineData,
                status: "Operational",
                createdBy: "current-user" // Will be set by backend
            });

            if (machine) {
                // Add to available machines for this type
                setAvailableMachines(prev => ({
                    ...prev,
                    [newMachineData.type]: [...(prev[newMachineData.type] || []), machine]
                }));

                // Auto-select this new machine
                if (selectedOperationForNewMachine) {
                    const { opIndex, isAdditional, machineIndex } = selectedOperationForNewMachine;
                    const updatedOperations = [...operations];

                    if (isAdditional && machineIndex !== null) {
                        // For additional machine
                        updatedOperations[opIndex].additionalMachines[machineIndex].assignedMachine = machine._id;
                        updatedOperations[opIndex].additionalMachines[machineIndex].assignedMachineName = machine.name;
                        updatedOperations[opIndex].additionalMachines[machineIndex].assignedMachineSerial = machine.serialNumber;
                    } else {
                        // For primary machine
                        updatedOperations[opIndex].assignedMachine = machine._id;
                        updatedOperations[opIndex].assignedMachineName = machine.name;
                        updatedOperations[opIndex].assignedMachineSerial = machine.serialNumber;
                    }

                    setOperations(updatedOperations);
                }

                setShowNewMachineModal(false);
                setNewMachineData({
                    name: "",
                    type: "",
                    model: "",
                    serialNumber: "",
                    powerConsumption: "",
                    location: "",
                    lastMaintenance: "",
                    nextMaintenance: ""
                });
                setSelectedOperationForNewMachine(null);
            }
        } catch (error) {
            console.error("Error adding new machine:", error);
            alert("Error adding new machine. Please try again.");
        }
    };

    // Time Handlers
    const secondsToTimeDisplay = (seconds) => {
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

    const handleTotalTimeChange = (newTotalSeconds) => {
        const totalEstimated = operations.reduce((sum, op) => sum + (op.estimatedTimeSeconds || 0), 0);
        const maxAllowed = Math.ceil(totalEstimated / 0.7); // 70% efficiency minimum

        // Ensure we don't exceed max allowed (minimum 70% efficiency)
        const adjustedSeconds = Math.min(newTotalSeconds, maxAllowed);
        setTotalPlannedTime(adjustedSeconds);

        // Calculate efficiency
        const efficiency = totalEstimated > 0 ? Math.round((totalEstimated / adjustedSeconds) * 100) : 100;
        setEfficiencyPercentage(Math.min(efficiency, 100));

        // Update individual operation times proportionally
        if (totalEstimated > 0) {
            const ratio = adjustedSeconds / totalEstimated;
            const updatedOperations = operations.map(op => ({
                ...op,
                plannedTimeSeconds: Math.ceil((op.estimatedTimeSeconds || 0) * ratio)
            }));
            setOperations(updatedOperations);
        }
    };

    // Save Handlers
    // Update the saveRawMaterialAllocations function in the frontend

    // Update the saveRawMaterialAllocations function in frontend

    const saveRawMaterialAllocations = async () => {
        try {
            setSaving(true);

            // Validate quantity
            if (quantity < 1) {
                alert("Quantity must be at least 1");
                setSaving(false);
                return false;
            }

            if (quantity > maxProducibleQuantity) {
                alert(`Cannot produce ${quantity} units. Maximum producible is ${maxProducibleQuantity} units with current stock.`);
                setSaving(false);
                return false;
            }

            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/work-orders/${id}/allocate-raw-materials`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: quantity,
                        splitRemaining: splitRemaining && (quantity < workOrder.quantity),
                        planningNotes
                    }),
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                let message = `✅ Quantity set to ${quantity} units. Raw materials auto-allocated.`;

                if (data.splitCreated) {
                    message = `✅ Quantity reduced to ${quantity} units. 
                
 New work order created for remaining ${data.remainingQuantity} units: 
${data.newWorkOrder.workOrderNumber}

 Current work order updated: ${data.workOrder.workOrderNumber}`;

                    // Show success message
                    const userChoice = window.confirm(
                        `${message}\n\nDo you want to view the new work order? (Click Cancel to stay here)`
                    );

                } else if (quantity < workOrder.quantity) {
                    message = `✅ Quantity reduced to ${quantity} units. Raw materials auto-allocated.`;
                    alert(message);
                } else {
                    alert("✅ Raw materials auto-allocated successfully!");
                }

                // Refresh work order data
                await fetchWorkOrderDetails();
                return true;
            } else {
                // Show error message from server
                alert(`❌ Error: ${data.message || 'Failed to save allocation'}`);
                return false;
            }
        } catch (error) {
            console.error("Error saving raw material allocations:", error);
            alert("❌ Network error. Please check your connection and try again.");
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
                additionalMachines: op.additionalMachines || [],
                plannedTimeSeconds: op.plannedTimeSeconds,
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
                        totalPlannedSeconds: totalPlannedTime,
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
                        planningNotes
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

    const calculateTotalEstimatedTime = () => {
        return operations.reduce((total, op) => total + (op.estimatedTimeSeconds || 0), 0);
    };

    const canProceedToNextStep = () => {
        if (step === 1) {
            // For step 1, ensure at least 1 unit can be produced
            return maxProducibleQuantity >= 1;
        } else if (step === 2) {
            // For step 2, ensure all operations have at least primary machine
            return operations.every(op => op.assignedMachine) && efficiencyPercentage <= 70;
        }
        return true;
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

    const insufficientRawMaterials = maxProducibleQuantity < workOrder.quantity;
    const totalEstimatedTime = calculateTotalEstimatedTime();

    return (
        <>
            <DashboardLayout activeMenu="production">
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
                                    {workOrder.stockItemName} | Original: {workOrder.quantity} units
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
                                    <span className="ml-2 font-medium">Delivery & Finalize</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Raw Materials */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Quantity Adjustment Card */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Production Quantity Adjustment</h2>
                                        <p className="text-gray-600">
                                            Adjust quantity based on raw material availability
                                        </p>
                                    </div>
                                    {insufficientRawMaterials && (
                                        <div className="flex items-center gap-2 text-yellow-600">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="font-medium">Insufficient Raw Materials</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-900">{workOrder.quantity}</div>
                                            <div className="text-sm text-blue-700">Original Quantity</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-900">{maxProducibleQuantity}</div>
                                            <div className="text-sm text-green-700">Maximum Producible</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={maxProducibleQuantity}
                                                    value={quantity}
                                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                                    className="w-24 text-center text-2xl font-bold text-purple-900 bg-transparent border-b-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                                                />
                                                <span className="text-2xl font-bold text-purple-900">units</span>
                                            </div>
                                            <div className="text-sm text-purple-700">Set Production Quantity</div>
                                        </div>
                                    </div>

                                    {insufficientRawMaterials && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-yellow-800">Raw Material Constraint</h4>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        Only {maxProducibleQuantity} units can be produced with current raw material stock.
                                                        {quantity < workOrder.quantity && (
                                                            <>
                                                                <br />
                                                                <span className="font-medium">
                                                                    {workOrder.quantity - quantity} units cannot be produced.
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <div className="mt-3">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={splitRemaining}
                                                                onChange={(e) => setSplitRemaining(e.target.checked)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-yellow-800">
                                                                Create new work order for remaining {workOrder.quantity - quantity} units
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    
                                </div>
                            </div>

                            {/* Raw Materials Table */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Raw Material Availability</h2>
                                            <p className="text-gray-600">
                                                Materials will be auto-allocated based on availability
                                            </p>
                                        </div>
                                        
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
                                                    Required/Unit
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Required
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Available
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Max Units
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
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
                                                                {material.requiredPerUnit?.toFixed(2) || '0.00'} {material.unit}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium">
                                                                {material.quantityRequired.toFixed(2)} {material.unit}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`font-medium ${material.currentStock >= material.quantityRequired
                                                                ? "text-green-600"
                                                                : material.currentStock > 0
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                                }`}>
                                                                {material.currentStock.toFixed(2)} {material.unit}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`font-medium ${material.maxUnitsFromThisMaterial >= workOrder.quantity
                                                                ? "text-green-600"
                                                                : material.maxUnitsFromThisMaterial > 0
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                                }`}>
                                                                {material.maxUnitsFromThisMaterial} units
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {material.status === "sufficient" ? (
                                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                                ) : material.status === "partial" ? (
                                                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                                )}
                                                                <span className={`text-xs font-medium ${material.status === "sufficient"
                                                                    ? "text-green-800"
                                                                    : material.status === "partial"
                                                                        ? "text-yellow-800"
                                                                        : "text-red-800"
                                                                    }`}>
                                                                    {material.status === "sufficient"
                                                                        ? "Sufficient"
                                                                        : material.status === "partial"
                                                                            ? `Only ${material.maxUnitsFromThisMaterial} units`
                                                                            : "Insufficient"}
                                                                </span>
                                                            </div>
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
                                    disabled={false}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Operations Planning</h2>
                                            <p className="text-gray-600">
                                                Assign machines for each operation
                                            </p>
                                        </div>
                                    </div>
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
                                                                    {operation.machineType} • Step {index + 1} of {operations.length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-sm text-gray-600">
                                                                Time: {secondsToTimeDisplay(operation.plannedTimeSeconds)}
                                                            </span>
                                                            {operation.maxAllowedSeconds && (
                                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                                    Max: {secondsToTimeDisplay(operation.maxAllowedSeconds)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Primary Machine */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Primary Machine *
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={operation.assignedMachine || ""}
                                                                onChange={(e) => handlePrimaryMachineAssignment(index, e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select Primary Machine</option>
                                                                {availableMachines[operation.machineType]?.map((machine) => (
                                                                    <option key={machine._id} value={machine._id}>
                                                                        {machine.name} ({machine.serialNumber})
                                                                    </option>
                                                                ))}
                                                            </select>

                                                        </div>
                                                    </div>

                                                    {/* Additional Machines */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                Additional Machines (Optional)
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddAdditionalMachine(index)}
                                                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Machine
                                                            </button>
                                                        </div>

                                                        {/* Additional Machines List */}
                                                        {operation.additionalMachines && operation.additionalMachines.length > 0 && (
                                                            <div className="space-y-2">
                                                                {operation.additionalMachines.map((additionalMachine, machineIndex) => (
                                                                    <div key={additionalMachine._id} className="flex items-center gap-2">
                                                                        <select
                                                                            value={additionalMachine.assignedMachine || ""}
                                                                            onChange={(e) => handleAdditionalMachineChange(index, machineIndex, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                        >
                                                                            <option value="">Select Additional Machine</option>
                                                                            {availableMachines[operation.machineType]?.map((machine) => (
                                                                                <option key={machine._id} value={machine._id}>
                                                                                    {machine.name} ({machine.serialNumber})
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveAdditionalMachine(index, machineIndex)}
                                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                                            title="Remove machine"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>

                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Selected Machines Display */}
                                                    {(operation.assignedMachine || (operation.additionalMachines && operation.additionalMachines.length > 0)) && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="text-sm font-medium text-gray-700 mb-2">Selected Machines:</div>
                                                            <div className="space-y-2">
                                                                {operation.assignedMachine && (
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                                            <span className="font-medium">Primary:</span>
                                                                            <span>{operation.assignedMachineName} ({operation.assignedMachineSerial})</span>
                                                                        </div>
                                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                                            Primary
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {operation.additionalMachines && operation.additionalMachines
                                                                    .filter(m => m.assignedMachine)
                                                                    .map((machine, idx) => (
                                                                        <div key={machine._id} className="flex items-center justify-between text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                                                <span>Additional {idx + 1}:</span>
                                                                                <span>{machine.assignedMachineName} ({machine.assignedMachineSerial})</span>
                                                                            </div>
                                                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                                                                Backup
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Operation Notes */}
                                                <div className="mt-6 pt-6 border-t border-gray-200">
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

                            {/* Time Efficiency Control */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Production Time & Efficiency</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {secondsToTimeDisplay(totalEstimatedTime)}
                                            </div>
                                            <div className="text-sm text-blue-700">Estimated Time</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Clock className="w-6 h-6 text-green-600" />
                                                <input
                                                    type="number"
                                                    min={totalEstimatedTime}
                                                    max={Math.ceil(totalEstimatedTime / 0.7)}
                                                    value={Math.ceil(totalPlannedTime / 60)} // Convert to minutes for input
                                                    onChange={(e) => handleTotalTimeChange((parseInt(e.target.value) || 0) * 60)}
                                                    className="w-20 text-center text-2xl font-bold text-green-900 bg-transparent border-b-2 border-green-300 focus:border-green-500 focus:outline-none"
                                                />
                                                <span className="text-2xl font-bold text-green-900">min</span>
                                            </div>
                                            <div className="text-sm text-green-700">Planned Time (minutes)</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Max: {secondsToTimeDisplay(Math.ceil(totalEstimatedTime / 0.7))}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className={`text-2xl font-bold ${efficiencyPercentage >= 70 ? 'text-green-900' : 'text-purple-900'}`}>
                                                {efficiencyPercentage}%
                                            </div>
                                            <div className="text-sm text-purple-700">Efficiency</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Target: ≥70%
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Adjust Total Production Time
                                        </label>
                                        <input
                                            type="range"
                                            min={totalEstimatedTime}
                                            max={Math.ceil(totalEstimatedTime / 0.7)}
                                            step="60" // 1 minute steps
                                            value={totalPlannedTime}
                                            onChange={(e) => handleTotalTimeChange(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>Min: {secondsToTimeDisplay(totalEstimatedTime)}</span>
                                            <span>Current: {secondsToTimeDisplay(totalPlannedTime)}</span>
                                            <span>Max: {secondsToTimeDisplay(Math.ceil(totalEstimatedTime / 0.7))}</span>
                                        </div>
                                    </div>

                                    {efficiencyPercentage < 70 && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                <div>
                                                    <h4 className="font-medium text-yellow-800">Efficiency Warning</h4>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        Current efficiency is {efficiencyPercentage}%. Target is at least 70%.
                                                        Please increase the planned time to improve efficiency.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                    disabled={false}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Step 3: Delivery & Finalize */}
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

                            {/* Planning Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Planning Summary</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {quantity}
                                            </div>
                                            <div className="text-sm text-blue-700">Production Quantity</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-900">
                                                {operations.filter(op => op.assignedMachine).length}/{operations.length}
                                            </div>
                                            <div className="text-sm text-green-700">Machines Assigned</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-900">
                                                {secondsToTimeDisplay(totalPlannedTime)}
                                            </div>
                                            <div className="text-sm text-purple-700">Total Time</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">Raw Material Allocation</h4>
                                        <div className="space-y-2">
                                            {rawMaterials.map((material, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{material.name}</span>
                                                    <span className="font-medium">
                                                        {material.quantityAllocated.toFixed(2)} / {material.quantityRequired.toFixed(2)} {material.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">Time Efficiency</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Estimated Time</span>
                                                <span className="font-medium">{secondsToTimeDisplay(totalEstimatedTime)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Planned Time</span>
                                                <span className="font-medium text-blue-600">{secondsToTimeDisplay(totalPlannedTime)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Efficiency</span>
                                                <span className={`font-medium ${efficiencyPercentage >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {efficiencyPercentage}%
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
                                        disabled={saving || operations.some(op => !op.assignedMachine) || efficiencyPercentage < 70}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        </>
    );
}