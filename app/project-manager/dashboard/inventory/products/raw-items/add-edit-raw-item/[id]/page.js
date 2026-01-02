// /project-manager/dashboard/inventory/products/raw-items/add-edit-raw-item/[id]/page.js

"use client"

import RawItemForm from "../../components/RawItemForm"
import { useParams } from "next/navigation"

export default function EditRawItemPage() {
  const params = useParams()
  const id = params?.id
  return <RawItemForm isEditMode={true} rawItemId={id} />
}