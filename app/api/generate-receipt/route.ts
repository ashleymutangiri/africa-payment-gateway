import { NextResponse } from "next/server"
import { generateAndStoreReceipt } from "@/lib/blob-utils"

export async function POST(request: Request) {
  try {
    const paymentData = await request.json()

    // Add additional receipt information
    const receiptData = {
      ...paymentData,
      receiptId: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString(),
      status: "PAID",
    }

    const result = await generateAndStoreReceipt(receiptData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.url,
        filename: result.filename,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in generate-receipt API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
