import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const cookieStore = cookies()
    const isAuthenticated = cookieStore.has("admin_auth")

    if (!isAuthenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchType = searchParams.get("type") || "mobile"
    const searchTerm = searchParams.get("term") || ""

    if (!searchTerm) {
      return NextResponse.json({ success: false, error: "Search term is required" }, { status: 400 })
    }

    let query = ""
    let params = []

    switch (searchType) {
      case "mobile":
        query = `
          SELECT t.*, u.mobile_number, u.country
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          WHERE u.mobile_number LIKE $1
          ORDER BY t.created_at DESC
        `
        params = [`%${searchTerm}%`]
        break
      case "transaction":
        query = `
          SELECT t.*, u.mobile_number, u.country
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          WHERE t.transaction_id LIKE $1
          ORDER BY t.created_at DESC
        `
        params = [`%${searchTerm}%`]
        break
      case "country":
        query = `
          SELECT t.*, u.mobile_number, u.country
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          WHERE u.country ILIKE $1
          ORDER BY t.created_at DESC
        `
        params = [`%${searchTerm}%`]
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid search type" }, { status: 400 })
    }

    const transactions = await executeQuery(query, params)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error searching transactions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search transactions",
      },
      { status: 500 },
    )
  }
}
