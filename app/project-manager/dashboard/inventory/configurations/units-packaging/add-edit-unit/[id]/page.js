// /project-manager/dashboard/inventory/configurations/units-packaging/add-edit-unit/[id]/page.js

"use client"

import { useParams } from "next/navigation"
import UnitForm from "../../components/UnitForm"

export default function EditUnitPage() {
  const params = useParams()
  const id = params?.id
  
  return <UnitForm isEditMode={true} unitId={id} />
}