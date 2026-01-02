export default function EmployeeFormSection({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  )
}