import { put } from "@vercel/blob"

export async function generateAndStoreReceipt(paymentData: any) {
  try {
    // Create a unique filename for the receipt
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `receipt-${timestamp}-${Math.random().toString(36).substring(2, 10)}.json`

    // Store the payment data in the Blob store
    const blob = await put(filename, JSON.stringify(paymentData, null, 2), {
      access: "public",
      addRandomSuffix: false,
    })

    return {
      success: true,
      url: blob.url,
      filename,
    }
  } catch (error) {
    console.error("Error generating receipt:", error)
    return {
      success: false,
      error: "Failed to generate receipt",
    }
  }
}
