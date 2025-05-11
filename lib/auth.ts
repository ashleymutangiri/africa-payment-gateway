import { cookies } from "next/headers"

// Simple admin authentication
// In a real app, you would use a more secure authentication system
const ADMIN_PASSWORD = "admin123" // Change this to a secure password

export function isAuthenticated() {
  const cookieStore = cookies()
  return cookieStore.has("admin_auth")
}

export function authenticate(password: string) {
  return password === ADMIN_PASSWORD
}

export function checkAuth(pathname: string) {
  // Skip authentication check for login page
  if (pathname.includes("/admin/login")) {
    return true
  }

  return isAuthenticated()
}
