import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if the current path is the login page
  // We can't use usePathname in a server component, so we'll check another way
  const isLoginPage = children.toString().includes("AdminLoginPage")

  // Check if user is authenticated
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has("admin_auth")

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !isLoginPage) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {isAuthenticated && <AdminSidebar />}
      <div className={`flex-1 ${isAuthenticated ? "p-6" : ""}`}>{children}</div>
    </div>
  )
}
