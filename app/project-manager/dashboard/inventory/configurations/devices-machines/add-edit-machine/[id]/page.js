// /project-manager/dashboard/inventory/configurations/devices-machines/add-edit-machine/[id]/page.js

"use client"

import { useParams } from "next/navigation"
import MachineForm from "../../components/MachineForm"

export default function EditMachinePage() {
  const params = useParams()
  const id = params?.id
  return <MachineForm isEditMode={true} machineId={id} />
}