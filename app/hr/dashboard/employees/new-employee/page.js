"use client"

import Hr_DashboardLayout from "@/components/Hr_DashboardLayout"
import EmployeeForm from "./components/EmployeeForm"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewEmployeePage() {
  const [pageState, setPageState] = useState({
    editMode: false,
    employeeId: null,
    employeeData: null,
    loading: true
  })

  const searchParams = useSearchParams()

  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true'
    const employeeId = searchParams.get('id')
    
    setPageState(prev => ({
      ...prev,
      editMode,
      employeeId
    }))

    if (editMode && employeeId) {
      fetchEmployeeData(employeeId)
    } else {
      setPageState(prev => ({ ...prev, loading: false }))
    }
  }, [searchParams])

  const fetchEmployeeData = async (id) => {
    try {
      setPageState(prev => ({ ...prev, loading: true }))

      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: "GET",
          credentials: "include"
        }
      )

      const data = await response.json()

      if (data.success) {
        const transformedData = {
          basicInfo: {
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            email: data.data.email,
            phone: data.data.phone,
            alternatePhone: data.data.alternatePhone || "",
            dateOfBirth: data.data.dateOfBirth
              ? new Date(data.data.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: data.data.gender,
            maritalStatus: data.data.maritalStatus
          },
          work: {
            department: data.data.department,
            jobPosition: data.data.jobPosition,
            jobTitle: data.data.jobTitle,
            manager: data.data.manager || "",
            employeeId: data.data.employeeId,
            dateOfJoining: data.data.dateOfJoining
              ? new Date(data.data.dateOfJoining).toISOString().split("T")[0]
              : "",
            employmentType: data.data.employmentType,
            workLocation: data.data.workLocation
          },
          salary: {
            basicSalary: data.data.salary?.basic || "",
            allowances: data.data.salary?.allowances || "",
            deductions: data.data.salary?.deductions || "",
            bankName: data.data.bankDetails?.bankName || "",
            accountNumber: data.data.bankDetails?.accountNumber || "",
            ifscCode: data.data.bankDetails?.ifscCode || ""
          },
          documents: {
            aadharNumber: data.data.documents?.aadharNumber || "",
            panNumber: data.data.documents?.panNumber || "",
            uanNumber: data.data.documents?.uanNumber || ""
          },
          address: {
            currentAddress: data.data.address?.current?.street || "",
            permanentAddress: data.data.address?.permanent?.street || "",
            city: data.data.address?.current?.city || "",
            state: data.data.address?.current?.state || "",
            pincode: data.data.address?.current?.pincode || ""
          }
        }

        setPageState(prev => ({ 
          ...prev, 
          employeeData: transformedData, 
          loading: false 
        }))
      }
    } catch (error) {
      console.error("Error fetching employee data:", error)
      setPageState(prev => ({ ...prev, loading: false }))
    }
  }

  if (pageState.loading) {
    return (
      <Hr_DashboardLayout activeMenu="employees">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </Hr_DashboardLayout>
    )
  }

  return (
    <Hr_DashboardLayout activeMenu="employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {pageState.editMode ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600 mt-1">
              {pageState.editMode
                ? 'Update employee information'
                : 'Fill in employee details to add to the system'}
            </p>
          </div>
          {pageState.editMode && pageState.employeeData && (
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
              <span className="text-sm font-medium">Editing: {pageState.employeeData.work.employeeId}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <EmployeeForm
            initialData={pageState.employeeData}
            isEditMode={pageState.editMode}
            employeeId={pageState.employeeId}
          />
        </div>
      </div>
    </Hr_DashboardLayout>
  )
}