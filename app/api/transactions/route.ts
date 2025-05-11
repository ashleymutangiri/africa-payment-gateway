import { NextResponse } from "next/server"
import { createUser, createTransaction } from "@/lib/transactions"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create or update user
    const userId = await createUser({
      mobile_number: data.mobileNumber,
      country: data.country,
    })

    // Create transaction
    const transactionId = await createTransaction({
      transaction_id: data.transactionId,
      user_id: userId,
      amount: Number.parseFloat(data.amount),
      currency: data.currency,
      payment_method: data.paymentMethod,
      status: "completed",
      note: data.note,
      receipt_url: data.receiptUrl,
      metadata: {
        cardDetails:
          data.paymentMethod === "card"
            ? {
                lastFour: data.cardNumber ? data.cardNumber.slice(-4) : null,
                expiryMonth: data.expiryMonth,
                expiryYear: data.expiryYear,
              }
            : null,
        mobileProvider: data.mobileProvider || null,
        usdEquivalent: data.usdEquivalent || null,
      },
    })

    return NextResponse.json({
      success: true,
      transactionId,
    })
  } catch (error) {
    console.error("Error storing transaction:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to store transaction",
      },
      { status: 500 },
    )
  }
}
