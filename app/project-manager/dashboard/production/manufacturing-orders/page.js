// app/project-manager/dashboard/production/manufacturing-orders/page.js - UPDATED

"use client";
import DashboardLayout from "../../../../../components/DashboardLayout";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Eye,
    Package,
    Calendar,
    User,
    DollarSign,
    AlertCircle,
    RefreshCw,
    Filter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManufacturingOrdersPage() {
    const router = useRouter();
    const [manufacturingOrders, setManufacturingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    const statusOptions = [
        { value: "", label: "All Status" },
        { value: "created", label: "Created" },
        { value: "planning", label: "Planning" },
        { value: "in_production", label: "In Production" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "on_hold", label: "On Hold" }
    ];

    const fetchManufacturingOrders = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter })
            });

            const response = await fetch(
                `${API_URL}/api/cms/manufacturing/manufacturing-orders?${params}`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setManufacturingOrders(data.manufacturingOrders);
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching manufacturing orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManufacturingOrders();
    }, [search, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchManufacturingOrders(1);
    };

    const handlePageChange = (newPage) => {
        fetchManufacturingOrders(newPage);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "created": return "bg-blue-100 text-blue-800";
            case "planning": return "bg-yellow-100 text-yellow-800";
            case "in_production": return "bg-green-100 text-green-800";
            case "completed": return "bg-purple-100 text-purple-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "on_hold": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <DashboardLayout activeMenu="production">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manufacturing Orders</h1>
                        <p className="text-gray-600">Auto-generated from sales-approved customer purchase orders</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by MO number, customer name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </form>
                </div>

                {/* Orders Grid */}
                {loading ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading manufacturing orders...</p>
                    </div>
                ) : manufacturingOrders.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Manufacturing Orders</h3>
                        <p className="text-gray-600">
                            {search || statusFilter 
                                ? "No manufacturing orders match your search criteria."
                                : "No manufacturing orders created yet. Sales-approved customer orders will automatically generate manufacturing orders."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {manufacturingOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{order.moNumber}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Customer PO: {order.requestId}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">{order.customerInfo?.name}</div>
                                                <div className="text-sm text-gray-600">{order.customerInfo?.email}</div>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Work Orders</span>
                                                </div>
                                                <span className="font-medium">{order.workOrdersCount}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Total Quantity</span>
                                                </div>
                                                <span className="font-medium">{order.totalQuantity} units</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Order Value</span>
                                                </div>
                                                <span className="font-medium">
                                                    {formatCurrency(order.finalOrderPrice || 0)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Created</span>
                                                </div>
                                                <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => router.push(`/project-manager/dashboard/production/manufacturing-orders/${order._id}`)}
                                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Manufacturing Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="bg-white px-6 py-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> of{" "}
                                        <span className="font-medium">{pagination.total}</span> manufacturing orders
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-3 py-1 border rounded-md text-sm ${pagination.page === pageNum
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}