// components/sales/ApproveEditButton.js

"use client"

import { useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ApproveEditButton({ requestId, onApproveSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showConfirm, setShowConfirm] = useState(false)

    const handleApproveEdit = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch(`${API_URL}/api/cms/sales/${requestId}/approve-edit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ action: "approve_and_proceed" })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    onApproveSuccess(data.request)
                }
            } else {
                const errorData = await response.json()
                alert(errorData.message)
                setError(errorData.message || "Failed to approve edit")
            }
        } catch (error) {
            console.error("Error approving edit:", error)
            setError("Failed to approve edit")
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Edit Request</h3>
                        <p className="text-gray-600">
                            Are you sure you want to approve these changes and move the request to "In Progress"?
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApproveEdit}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Yes, Approve & Proceed"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
            <CheckCircle className="w-4 h-4" />
            Approve & Move Further
        </button>
    )
}