"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    User, Briefcase, CreditCard, FileText, MapPin,
    Save, X, Upload, ChevronRight, ChevronLeft, Check,
    AlertCircle, Loader2, Edit
} from "lucide-react"
import EmployeeFormSection from "./EmployeeFormSection"
import { uploadToCloudinary } from "@/lib/cloudinaryUpload"

const formSections = [
    { id: 'basicInfo', title: 'Basic Information', icon: User },
    { id: 'work', title: 'Work Details', icon: Briefcase },
    { id: 'salary', title: 'Salary & Bank', icon: CreditCard },
    { id: 'documents', title: 'Documents', icon: FileText },
    { id: 'address', title: 'Address', icon: MapPin }
]

export default function EmployeeForm({ initialData = null, isEditMode = false, employeeId = null }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState({
        aadharFile: null,
        panFile: null,
        resumeFile: null
    })
    const [uploadingFile, setUploadingFile] = useState(null)
    const [errorMessages, setErrorMessages] = useState({
        form: null,
        upload: null,
        validation: null
    })

    const [formData, setFormData] = useState({
        basicInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            alternatePhone: "",
            dateOfBirth: "",
            gender: "",
            maritalStatus: ""
        },
        work: {
            department: "",
            jobPosition: "",
            jobTitle: "",
            manager: "",
            employeeId: "",
            dateOfJoining: "",
            employmentType: "",
            workLocation: ""
        },
        salary: {
            basicSalary: "",
            allowances: "",
            deductions: "",
            bankName: "",
            accountNumber: "",
            ifscCode: ""
        },
        documents: {
            aadharNumber: "",
            panNumber: "",
            uanNumber: "",
            aadharFileUrl: "",
            panFileUrl: "",
            resumeFileUrl: "",
            aadharPublicId: "",
            panPublicId: "",
            resumePublicId: ""
        },
        address: {
            currentAddress: "",
            permanentAddress: "",
            city: "",
            state: "",
            pincode: ""
        }
    })

    const fileInputRefs = {
        aadharFile: useRef(null),
        panFile: useRef(null),
        resumeFile: useRef(null)
    }

    // Load employee data in edit mode
    useEffect(() => {
        if (isEditMode && initialData) {
            // Transform initialData to match formData structure
            setFormData({
                basicInfo: {
                    firstName: initialData.firstName || "",
                    lastName: initialData.lastName || "",
                    email: initialData.email || "",
                    phone: initialData.phone || "",
                    alternatePhone: initialData.alternatePhone || "",
                    dateOfBirth: initialData.dateOfBirth || "",
                    gender: initialData.gender || "",
                    maritalStatus: initialData.maritalStatus || ""
                },
                work: {
                    department: initialData.department || "",
                    jobPosition: initialData.jobPosition || "",
                    jobTitle: initialData.jobTitle || "",
                    manager: initialData.manager || "",
                    employeeId: initialData.employeeId || "",
                    dateOfJoining: initialData.dateOfJoining || "",
                    employmentType: initialData.employmentType || "",
                    workLocation: initialData.workLocation || ""
                },
                salary: {
                    basicSalary: initialData.salary?.basic?.toString() || "",
                    allowances: initialData.salary?.allowances?.toString() || "",
                    deductions: initialData.salary?.deductions?.toString() || "",
                    bankName: initialData.bankDetails?.bankName || "",
                    accountNumber: initialData.bankDetails?.accountNumber || "",
                    ifscCode: initialData.bankDetails?.ifscCode || ""
                },
                documents: {
                    aadharNumber: initialData.documents?.aadharNumber || "",
                    panNumber: initialData.documents?.panNumber || "",
                    uanNumber: initialData.documents?.uanNumber || "",
                    aadharFileUrl: initialData.documents?.aadharFile?.url || "",
                    panFileUrl: initialData.documents?.panFile?.url || "",
                    resumeFileUrl: initialData.documents?.resumeFile?.url || "",
                    aadharPublicId: initialData.documents?.aadharFile?.publicId || "",
                    panPublicId: initialData.documents?.panFile?.publicId || "",
                    resumePublicId: initialData.documents?.resumeFile?.publicId || ""
                },
                address: {
                    currentAddress: initialData.address?.current?.street || "",
                    permanentAddress: initialData.address?.permanent?.street || "",
                    city: initialData.address?.current?.city || "",
                    state: initialData.address?.current?.state || "",
                    pincode: initialData.address?.current?.pincode || ""
                }
            })

            // Set uploaded files if they exist
            if (initialData.documents?.aadharFile?.url) {
                setUploadedFiles(prev => ({
                    ...prev,
                    aadharFile: {
                        url: initialData.documents.aadharFile.url,
                        name: "Aadhar Card",
                        size: 0
                    }
                }))
            }
            if (initialData.documents?.panFile?.url) {
                setUploadedFiles(prev => ({
                    ...prev,
                    panFile: {
                        url: initialData.documents.panFile.url,
                        name: "PAN Card",
                        size: 0
                    }
                }))
            }
            if (initialData.documents?.resumeFile?.url) {
                setUploadedFiles(prev => ({
                    ...prev,
                    resumeFile: {
                        url: initialData.documents.resumeFile.url,
                        name: "Resume",
                        size: 0
                    }
                }))
            }

            // Mark all steps as completed in edit mode
            setCompletedSteps([0, 1, 2, 3, 4])
        }
    }, [isEditMode, initialData])

    const showError = (type, message) => {
        setErrorMessages(prev => ({
            ...prev,
            [type]: message
        }))

        setTimeout(() => {
            setErrorMessages(prev => ({
                ...prev,
                [type]: null
            }))
        }, 5000)
    }

    const validateCurrentStep = () => {
        const currentSection = formSections[currentStep].id
        let error = null

        switch (currentSection) {
            case 'basicInfo':
                if (!formData.basicInfo.firstName.trim() ||
                    !formData.basicInfo.lastName.trim() ||
                    !formData.basicInfo.email.trim() ||
                    !formData.basicInfo.phone.trim() ||
                    !formData.basicInfo.dateOfBirth ||
                    !formData.basicInfo.gender) {
                    error = 'Please fill all required fields in Basic Information section'
                }
                break

            case 'work':
                if (!formData.work.department.trim() ||
                    !formData.work.jobPosition.trim() ||
                    !formData.work.jobTitle.trim() ||
                    !formData.work.employeeId.trim() ||
                    !formData.work.dateOfJoining ||
                    !formData.work.employmentType.trim() ||
                    !formData.work.workLocation.trim()) {
                    error = 'Please fill all required fields in Work Details section'
                }
                break

            case 'salary':
                if (!formData.salary.basicSalary ||
                    !formData.salary.bankName.trim() ||
                    !formData.salary.accountNumber.trim() ||
                    !formData.salary.ifscCode.trim()) {
                    error = 'Please fill all required fields in Salary & Bank section'
                }
                break

            case 'documents':
                if (!formData.documents.aadharNumber.trim() ||
                    !formData.documents.panNumber.trim()) {
                    error = 'Please fill Aadhar and PAN numbers in Documents section'
                }
                break

            case 'address':
                if (!formData.address.currentAddress.trim() ||
                    !formData.address.city.trim() ||
                    !formData.address.state.trim() ||
                    !formData.address.pincode.trim()) {
                    error = 'Please fill all required fields in Address section'
                }
                break
        }

        if (error) {
            showError('validation', error)
            return false
        }

        setErrorMessages(prev => ({ ...prev, validation: null }))
        return true
    }

    const handleNextStep = () => {
        if (!validateCurrentStep()) {
            return
        }

        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep])
        }

        if (currentStep < formSections.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))

        if (errorMessages.validation) {
            setErrorMessages(prev => ({ ...prev, validation: null }))
        }
    }

    const handleFileChange = async (field, file) => {
        if (!file) return

        setUploadingFile(field)
        setErrorMessages(prev => ({ ...prev, upload: null }))

        try {
            const uploadResult = await uploadToCloudinary(file)

            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [`${field}Url`]: uploadResult.url,
                    [`${field}PublicId`]: uploadResult.publicId
                }
            }))

            setUploadedFiles(prev => ({
                ...prev,
                [field]: {
                    file,
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    name: file.name,
                    size: uploadResult.bytes
                }
            }))

        } catch (error) {
            console.error('File upload error:', error)
            showError('upload', `Failed to upload ${field}. Please try again.`)
        } finally {
            setUploadingFile(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateCurrentStep()) {
            return
        }

        setIsSubmitting(true)
        setErrorMessages(prev => ({ ...prev, form: null }))

        try {
            // Prepare complete employee data
            const employeeData = {
                // Basic Info
                firstName: formData.basicInfo.firstName.trim(),
                lastName: formData.basicInfo.lastName.trim(),
                email: formData.basicInfo.email.toLowerCase().trim(),
                phone: formData.basicInfo.phone.trim(),
                alternatePhone: formData.basicInfo.alternatePhone.trim(),
                dateOfBirth: formData.basicInfo.dateOfBirth,
                gender: formData.basicInfo.gender,
                maritalStatus: formData.basicInfo.maritalStatus,

                // Work Details
                department: formData.work.department.trim(),
                jobPosition: formData.work.jobPosition.trim(),
                jobTitle: formData.work.jobTitle.trim(),
                manager: formData.work.manager.trim(),
                employeeId: formData.work.employeeId.trim(),
                dateOfJoining: formData.work.dateOfJoining,
                employmentType: formData.work.employmentType,
                workLocation: formData.work.workLocation.trim(),

                // Salary & Bank
                salary: {
                    basic: parseFloat(formData.salary.basicSalary) || 0,
                    allowances: parseFloat(formData.salary.allowances) || 0,
                    deductions: parseFloat(formData.salary.deductions) || 0
                },
                bankDetails: {
                    bankName: formData.salary.bankName.trim(),
                    accountNumber: formData.salary.accountNumber.trim(),
                    ifscCode: formData.salary.ifscCode.trim()
                },

                // Documents
                documents: {
                    aadharNumber: formData.documents.aadharNumber.trim(),
                    panNumber: formData.documents.panNumber.trim(),
                    uanNumber: formData.documents.uanNumber.trim(),
                    aadharFile: formData.documents.aadharFileUrl ? {
                        url: formData.documents.aadharFileUrl,
                        publicId: formData.documents.aadharPublicId
                    } : undefined,
                    panFile: formData.documents.panFileUrl ? {
                        url: formData.documents.panFileUrl,
                        publicId: formData.documents.panPublicId
                    } : undefined,
                    resumeFile: formData.documents.resumeFileUrl ? {
                        url: formData.documents.resumeFileUrl,
                        publicId: formData.documents.resumePublicId
                    } : undefined
                },

                // Address
                address: {
                    current: {
                        street: formData.address.currentAddress.trim(),
                        city: formData.address.city.trim(),
                        state: formData.address.state.trim(),
                        pincode: formData.address.pincode.trim(),
                        country: "India"
                    },
                    permanent: formData.address.permanentAddress.trim() ? {
                        street: formData.address.permanentAddress.trim(),
                        city: formData.address.city.trim(),
                        state: formData.address.state.trim(),
                        pincode: formData.address.pincode.trim(),
                        country: "India"
                    } : undefined
                },

                // Status
                status: "active",
                isActive: true
            }

            // Remove undefined values
            Object.keys(employeeData.documents).forEach(key => {
                if (employeeData.documents[key] === undefined) {
                    delete employeeData.documents[key]
                }
            })

            // Determine API endpoint and method based on mode
            const apiUrl = isEditMode
                ? `http://localhost:5000/api/employees/update/${employeeId}`
                : "http://localhost:5000/api/employees/create"

            const method = isEditMode ? "PUT" : "POST"

            // Send request
            const response = await fetch(apiUrl, {
                method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData)
            })

            const data = await response.json()

            if (data.success) {
                alert(`Employee ${isEditMode ? 'updated' : 'created'} successfully!`)
                router.push('/hr/dashboard/employees')
            } else {
                showError('form', data.message || `Failed to ${isEditMode ? 'update' : 'create'} employee`)
            }

        } catch (error) {
            console.error('Error:', error)
            showError('form', 'Network error. Please check your connection.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Error Message Component
    const ErrorMessage = ({ type, message, onClose }) => (
        <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${type === 'validation' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            type === 'upload' ? 'bg-red-50 border border-red-200 text-red-800' :
                'bg-red-50 border border-red-200 text-red-800'
            }`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 ${type === 'validation' ? 'text-yellow-600' : 'text-red-600'
                }`} />
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )

    // Spinner Component for file upload
    const UploadSpinner = ({ isUploading, field }) => (
        isUploading === field && (
            <div className="mt-2 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
        )
    )

    const renderStepIndicator = () => {
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {formSections[currentStep].title}
                        </p>
                    </div>
                    {isEditMode && (
                        <div className="flex items-center gap-2 text-purple-600">
                            <Edit className="w-5 h-5" />
                            <span className="font-medium">Edit Mode</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    {formSections.map((section, index) => (
                        <div key={section.id} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                ${index === currentStep
                                    ? 'bg-purple-600 text-white'
                                    : completedSteps.includes(index)
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                {completedSteps.includes(index) ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <section.icon className="w-5 h-5" />
                                )}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${index === currentStep
                                    ? 'text-purple-600'
                                    : completedSteps.includes(index)
                                        ? 'text-green-600'
                                        : 'text-gray-400'
                                    }`}>
                                    {section.title}
                                </p>
                                <p className="text-xs text-gray-500">Step {index + 1}</p>
                            </div>
                            {index < formSections.length - 1 && (
                                <div className={`w-16 h-0.5 mx-4 ${completedSteps.includes(index + 1)
                                    ? 'bg-green-300'
                                    : 'bg-gray-300'
                                    }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderBasicInfoStep = () => (
        <EmployeeFormSection title="Basic Information" icon={User}>
            {errorMessages.validation && currentStep === 0 && (
                <ErrorMessage
                    type="validation"
                    message={errorMessages.validation}
                    onClose={() => setErrorMessages(prev => ({ ...prev, validation: null }))}
                />
            )}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                    </label>
                    <input
                        type="text"
                        value={formData.basicInfo.firstName}
                        onChange={(e) => handleInputChange("basicInfo", "firstName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        value={formData.basicInfo.lastName}
                        onChange={(e) => handleInputChange("basicInfo", "lastName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        value={formData.basicInfo.email}
                        onChange={(e) => handleInputChange("basicInfo", "email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.basicInfo.phone}
                        onChange={(e) => handleInputChange("basicInfo", "phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.basicInfo.alternatePhone}
                        onChange={(e) => handleInputChange("basicInfo", "alternatePhone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                    </label>
                    <input
                        type="date"
                        value={formData.basicInfo.dateOfBirth}
                        onChange={(e) => handleInputChange("basicInfo", "dateOfBirth", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                    </label>
                    <select
                        value={formData.basicInfo.gender}
                        onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                    </label>
                    <select
                        value={formData.basicInfo.maritalStatus}
                        onChange={(e) => handleInputChange("basicInfo", "maritalStatus", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                    </select>
                </div>
            </div>
        </EmployeeFormSection>
    )

    const renderWorkDetailsStep = () => (
        <EmployeeFormSection title="Work Details" icon={Briefcase}>
            {errorMessages.validation && currentStep === 1 && (
                <ErrorMessage
                    type="validation"
                    message={errorMessages.validation}
                    onClose={() => setErrorMessages(prev => ({ ...prev, validation: null }))}
                />
            )}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                    </label>
                    <select
                        value={formData.work.department}
                        onChange={(e) => handleInputChange("work", "department", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="Administration">Administration</option>
                        <option value="House-Keeping">House-Keeping</option>
                        <option value="IT">IT</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Production">Production</option>
                        <option value="Operator">Operator</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>


                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Position *
                    </label>
                    <input
                        type="text"
                        value={formData.work.jobPosition}
                        onChange={(e) => handleInputChange("work", "jobPosition", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        value={formData.work.jobTitle}
                        onChange={(e) => handleInputChange("work", "jobTitle", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager
                    </label>
                    <input
                        type="text"
                        value={formData.work.manager}
                        onChange={(e) => handleInputChange("work", "manager", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                    </label>
                    <input
                        type="text"
                        value={formData.work.employeeId}
                        onChange={(e) => handleInputChange("work", "employeeId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Joining *
                    </label>
                    <input
                        type="date"
                        value={formData.work.dateOfJoining}
                        onChange={(e) => handleInputChange("work", "dateOfJoining", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type *
                    </label>
                    <select
                        value={formData.work.employmentType}
                        onChange={(e) => handleInputChange("work", "employmentType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Location *
                    </label>
                    <input
                        type="text"
                        value={formData.work.workLocation}
                        onChange={(e) => handleInputChange("work", "workLocation", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
            </div>
        </EmployeeFormSection>
    )

    const renderSalaryBankStep = () => (
        <EmployeeFormSection title="Salary & Bank Details" icon={CreditCard}>
            {errorMessages.validation && currentStep === 2 && (
                <ErrorMessage
                    type="validation"
                    message={errorMessages.validation}
                    onClose={() => setErrorMessages(prev => ({ ...prev, validation: null }))}
                />
            )}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary (₹) *
                    </label>
                    <input
                        type="number"
                        value={formData.salary.basicSalary}
                        onChange={(e) => handleInputChange("salary", "basicSalary", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allowances (₹)
                    </label>
                    <input
                        type="number"
                        value={formData.salary.allowances}
                        onChange={(e) => handleInputChange("salary", "allowances", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deductions (₹)
                    </label>
                    <input
                        type="number"
                        value={formData.salary.deductions}
                        onChange={(e) => handleInputChange("salary", "deductions", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bank Name *
                            </label>
                            <input
                                type="text"
                                value={formData.salary.bankName}
                                onChange={(e) => handleInputChange("salary", "bankName", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Number *
                            </label>
                            <input
                                type="text"
                                value={formData.salary.accountNumber}
                                onChange={(e) => handleInputChange("salary", "accountNumber", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                IFSC Code *
                            </label>
                            <input
                                type="text"
                                value={formData.salary.ifscCode}
                                onChange={(e) => handleInputChange("salary", "ifscCode", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeFormSection>
    )

    const renderDocumentsStep = () => (
        <EmployeeFormSection title="Documents" icon={FileText}>
            {errorMessages.validation && currentStep === 3 && (
                <ErrorMessage
                    type="validation"
                    message={errorMessages.validation}
                    onClose={() => setErrorMessages(prev => ({ ...prev, validation: null }))}
                />
            )}

            {errorMessages.upload && (
                <ErrorMessage
                    type="upload"
                    message={errorMessages.upload}
                    onClose={() => setErrorMessages(prev => ({ ...prev, upload: null }))}
                />
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhar Number *
                    </label>
                    <input
                        type="text"
                        value={formData.documents.aadharNumber}
                        onChange={(e) => handleInputChange("documents", "aadharNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                    </label>
                    <input
                        type="text"
                        value={formData.documents.panNumber}
                        onChange={(e) => handleInputChange("documents", "panNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        UAN Number
                    </label>
                    <input
                        type="text"
                        value={formData.documents.uanNumber}
                        onChange={(e) => handleInputChange("documents", "uanNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents (Cloudinary)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Upload Aadhar Card *</p>
                        <p className="text-xs text-gray-500 mb-3">PDF, JPG, PNG (Max: 10MB)</p>
                        <input
                            type="file"
                            className="hidden"
                            id="aadharUpload"
                            ref={fileInputRefs.aadharFile}
                            onChange={(e) => handleFileChange('aadharFile', e.target.files[0])}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={uploadingFile}
                        />
                        <label
                            htmlFor="aadharUpload"
                            className={`text-purple-600 text-sm font-medium cursor-pointer inline-flex items-center gap-1
                                ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload className="w-4 h-4" />
                            {uploadedFiles.aadharFile ? uploadedFiles.aadharFile.name : 'Choose File'}
                        </label>
                        <UploadSpinner isUploading={uploadingFile} field="aadharFile" />
                        {uploadedFiles.aadharFile?.url && !uploadingFile && (
                            <div className="mt-2">
                                <p className="text-xs text-green-600">✓ {isEditMode ? 'File exists' : 'Uploaded to Cloudinary'}</p>
                                {uploadedFiles.aadharFile.size > 0 && (
                                    <p className="text-xs text-gray-500">Size: {(uploadedFiles.aadharFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Upload PAN Card *</p>
                        <p className="text-xs text-gray-500 mb-3">PDF, JPG, PNG (Max: 10MB)</p>
                        <input
                            type="file"
                            className="hidden"
                            id="panUpload"
                            ref={fileInputRefs.panFile}
                            onChange={(e) => handleFileChange('panFile', e.target.files[0])}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={uploadingFile}
                        />
                        <label
                            htmlFor="panUpload"
                            className={`text-purple-600 text-sm font-medium cursor-pointer inline-flex items-center gap-1
                                ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload className="w-4 h-4" />
                            {uploadedFiles.panFile ? uploadedFiles.panFile.name : 'Choose File'}
                        </label>
                        <UploadSpinner isUploading={uploadingFile} field="panFile" />
                        {uploadedFiles.panFile?.url && !uploadingFile && (
                            <div className="mt-2">
                                <p className="text-xs text-green-600">✓ {isEditMode ? 'File exists' : 'Uploaded to Cloudinary'}</p>
                                {uploadedFiles.panFile.size > 0 && (
                                    <p className="text-xs text-gray-500">Size: {(uploadedFiles.panFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-sm text-gray-600 mb-2">Upload Resume</p>
                        <p className="text-xs text-gray-500 mb-3">PDF, DOC, DOCX (Max: 10MB)</p>
                        <input
                            type="file"
                            className="hidden"
                            id="resumeUpload"
                            ref={fileInputRefs.resumeFile}
                            onChange={(e) => handleFileChange('resumeFile', e.target.files[0])}
                            accept=".pdf,.doc,.docx"
                            disabled={uploadingFile}
                        />
                        <label
                            htmlFor="resumeUpload"
                            className={`text-purple-600 text-sm font-medium cursor-pointer inline-flex items-center gap-1
                                ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload className="w-4 h-4" />
                            {uploadedFiles.resumeFile ? uploadedFiles.resumeFile.name : 'Choose File'}
                        </label>
                        <UploadSpinner isUploading={uploadingFile} field="resumeFile" />
                        {uploadedFiles.resumeFile?.url && !uploadingFile && (
                            <div className="mt-2">
                                <p className="text-xs text-green-600">✓ {isEditMode ? 'File exists' : 'Uploaded to Cloudinary'}</p>
                                {uploadedFiles.resumeFile.size > 0 && (
                                    <p className="text-xs text-gray-500">Size: {(uploadedFiles.resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EmployeeFormSection>
    )

    const renderAddressStep = () => (
        <EmployeeFormSection title="Address Details" icon={MapPin}>
            {errorMessages.validation && currentStep === 4 && (
                <ErrorMessage
                    type="validation"
                    message={errorMessages.validation}
                    onClose={() => setErrorMessages(prev => ({ ...prev, validation: null }))}
                />
            )}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <textarea
                                value={formData.address.currentAddress}
                                onChange={(e) => handleInputChange("address", "currentAddress", e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                            </label>
                            <input
                                type="text"
                                value={formData.address.city}
                                onChange={(e) => handleInputChange("address", "city", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State *
                            </label>
                            <input
                                type="text"
                                value={formData.address.state}
                                onChange={(e) => handleInputChange("address", "state", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode *
                            </label>
                            <input
                                type="text"
                                value={formData.address.pincode}
                                onChange={(e) => handleInputChange("address", "pincode", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="sameAsCurrent"
                            className="rounded"
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleInputChange("address", "permanentAddress", formData.address.currentAddress)
                                } else {
                                    handleInputChange("address", "permanentAddress", "")
                                }
                            }}
                        />
                        <label htmlFor="sameAsCurrent" className="text-sm text-gray-700">
                            Permanent address same as current address
                        </label>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Permanent Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                value={formData.address.permanentAddress}
                                onChange={(e) => handleInputChange("address", "permanentAddress", e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeFormSection>
    )

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0: return renderBasicInfoStep()
            case 1: return renderWorkDetailsStep()
            case 2: return renderSalaryBankStep()
            case 3: return renderDocumentsStep()
            case 4: return renderAddressStep()
            default: return null
        }
    }

    const renderNavigationButtons = () => {
        const isLastStep = currentStep === formSections.length - 1

        return (
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div>
                    {currentStep > 0 && (
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            disabled={isSubmitting || uploadingFile}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                                router.push('/hr/dashboard/employees')
                            }
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>

                    {isLastStep ? (
                        <button
                            type="submit"
                            disabled={isSubmitting || uploadingFile}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditMode ? 'Updating Employee...' : 'Creating Employee...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? 'Update Employee' : 'Create Employee'}
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={isSubmitting || uploadingFile}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {renderStepIndicator()}

            {/* Global Form Error Message */}
            {errorMessages.form && (
                <ErrorMessage
                    type="form"
                    message={errorMessages.form}
                    onClose={() => setErrorMessages(prev => ({ ...prev, form: null }))}
                />
            )}

            <form onSubmit={handleSubmit}>
                {renderCurrentStep()}
                {renderNavigationButtons()}
            </form>
        </div>
    )
}