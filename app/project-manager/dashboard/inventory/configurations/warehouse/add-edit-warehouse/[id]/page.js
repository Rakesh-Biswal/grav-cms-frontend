// /project-manager/dashboard/inventory/configurations/warehouse/add-edit-warehouse/[id]/page.js

"use client"
import { useParams } from "next/navigation"

import WarehouseForm from "../../components/WarehouseForm"

export default function EditWarehousePage() {
    const params = useParams()
    const id = params?.id
    return <WarehouseForm isEditMode={true} warehouseId={id} />
}