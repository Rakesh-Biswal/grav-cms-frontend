"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Breadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)

  // Find dashboard index dynamically
  const dashboardIndex = segments.indexOf("dashboard")

  // If no dashboard in path, do not render breadcrumb
  if (dashboardIndex === -1) return null

  const department = segments[0] // project-manager / admin / vendor etc.
  const breadcrumbSegments = segments.slice(dashboardIndex)

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center text-sm text-gray-500">
        {/* Dashboard Home */}
        <li className="flex items-center">
          <Link
            href={`/${department}/dashboard`}
            className="flex items-center gap-1 hover:text-emerald-600"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {breadcrumbSegments.slice(1).map((segment, index) => {
          const href =
            `/${department}/dashboard/` +
            breadcrumbSegments.slice(1, index + 2).join("/")

          const isLast = index === breadcrumbSegments.length - 2

          return (
            <li key={href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />

              {isLast ? (
                <span className="font-medium text-gray-900 capitalize">
                  {segment.replace(/-/g, " ")}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-emerald-600 capitalize"
                >
                  {segment.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
