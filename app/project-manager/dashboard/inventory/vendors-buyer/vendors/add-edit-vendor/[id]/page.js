// /project-manager/dashboard/inventory/vendors-buyer/vendor/add-edit-vendor/[id]/page.js

"use client"

import VendorForm from "../../components/VendorForm"
import { useParams } from "next/navigation"

export default function EditVendorPage() {
    const params = useParams()
    const id = params?.id
    return <VendorForm isEditMode={true} vendorId={id} />
}

// The above code defines a React component for editing a vendor in the inventory management system.