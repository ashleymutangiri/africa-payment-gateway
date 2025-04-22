"use client"

import { useState } from "react"
import { Download, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptGeneratorProps {
  paymentData: any
  receiptUrl?: string
}

export function ReceiptGenerator({ paymentData, receiptUrl }: ReceiptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(receiptUrl || null)
  const [error, setError] = useState<string | null>(null)

  const generateReceipt = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedUrl(data.url)
      } else {
        setError(data.error || "Failed to generate receipt")
      }
    } catch (err) {
      setError("An error occurred while generating the receipt")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-4">
      {!generatedUrl ? (
        <Button
          onClick={generateReceipt}
          disabled={isGenerating}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Generating Receipt...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Receipt
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Receipt generated successfully
          </div>
          <Button
            as="a"
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}
