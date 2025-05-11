import { NextResponse } from "next/server"
import { getUserByMobileNumber, getTransactionsByUser } from "@/lib/transactions"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mobileNumber = searchParams.get("mobileNumber")

    if (!mobileNumber) {
      return NextResponse.json({ success: false, error: "Mobile number is required" }, { status: 400 })
    }

    // Get user by mobile number
    const user = await getUserByMobileNumber(mobileNumber)

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Get transactions for user
    const transactions = await getTransactionsByUser(user.id!)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transaction history",
      },
      { status: 500 },
    )
  }
}
