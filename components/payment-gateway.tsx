"use client"

import type React from "react"

import { useState } from "react"
import { Check, CreditCard, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReceiptGenerator } from "./receipt-generator"
import { CountryFlag } from "./country-flag"
import { CardIcon } from "./card-icon"

// Mobile money providers by country
const mobileMoneyProviders = {
  Zimbabwe: ["EcoCash", "OneMoney", "Telecash"],
  Zambia: ["MTN Money", "Airtel Money", "Zamtel Money"],
  "South Africa": ["M-Pesa", "FNB eWallet", "Standard Bank Instant Money"],
}

// Add country code mapping at the top of the file, after the mobileMoneyProviders constant
const countryCodeMap = {
  Zimbabwe: "+263",
  Zambia: "+260",
  "South Africa": "+27",
}

export default function PaymentGateway() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    mobileNumber: "",
    country: "",
    paymentMethod: "",
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    mobileProvider: "",
    amount: "100.00", // Default amount for demo purposes
  })
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isGlowing, setIsGlowing] = useState(false)

  // Format card number in groups of 4
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const groups = []

    for (let i = 0; i < cleanValue.length; i += 4) {
      groups.push(cleanValue.slice(i, i + 4))
    }

    return groups.join(" ")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    if (id === "cardNumber") {
      // Format card number in groups of 4
      const formattedValue = formatCardNumber(value)
      setFormData({ ...formData, [id]: formattedValue })
    } else {
      setFormData({ ...formData, [id]: value })
    }
  }

  // Update the handleSelectChange function to handle country code autocomplete
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })

    // If country is selected, update mobile number with country code
    if (name === "country") {
      const countryCode = countryCodeMap[value as keyof typeof countryCodeMap]
      // Only prepend country code if mobile number doesn't already have it
      if (countryCode && !formData.mobileNumber.startsWith(countryCode)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          mobileNumber: countryCode + " ",
        }))
      }
    }
  }

  const handleRadioChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value })
  }

  const handleNextStep = () => {
    setStep(step + 1)
    triggerGlowEffect()
  }

  const handlePrevStep = () => {
    setStep(step - 1)
    triggerGlowEffect()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Move to confirmation step
    setStep(4)
    triggerGlowEffect()
  }

  const handleConfirmPayment = async () => {
    // Here you would connect to your backend API
    console.log("Payment data submitted:", formData)

    // Generate a transaction ID
    const newTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    setTransactionId(newTransactionId)

    // Mock successful payment
    setStep(5)
    triggerGlowEffect()
  }

  const triggerGlowEffect = () => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Gateway</CardTitle>
            <CardDescription>Complete your payment securely</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Slider */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {["Details", "Method", "Payment", "Confirmation", "Complete"].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step > index + 1
                      ? "bg-green-600 text-white"
                      : step === index + 1
                        ? "bg-primary text-white border-2 border-primary"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > index + 1 ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2.5 ${isGlowing ? "progress-glow" : ""}`}>
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Mobile Number and Country */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zimbabwe">
                    <div className="flex items-center">
                      <CountryFlag country="Zimbabwe" />
                      Zimbabwe
                    </div>
                  </SelectItem>
                  <SelectItem value="Zambia">
                    <div className="flex items-center">
                      <CountryFlag country="Zambia" />
                      Zambia
                    </div>
                  </SelectItem>
                  <SelectItem value="South Africa">
                    <div className="flex items-center">
                      <CountryFlag country="South Africa" />
                      South Africa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                placeholder={
                  formData.country
                    ? `${countryCodeMap[formData.country as keyof typeof countryCodeMap]} phone number`
                    : "Enter your mobile number"
                }
                value={formData.mobileNumber}
                onChange={handleInputChange}
                required
              />
              {formData.country && (
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code {countryCodeMap[formData.country as keyof typeof countryCodeMap]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={handleRadioChange}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  Card Payment
                </Label>
              </div>
              <div>
                <RadioGroupItem value="mobile" id="mobile" className="peer sr-only" />
                <Label
                  htmlFor="mobile"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Smartphone className="mb-3 h-6 w-6" />
                  Mobile Money
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.paymentMethod === "card" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="Enter name on card"
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="Enter card number"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19} // 16 digits + 3 spaces
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CardIcon cardNumber={formData.cardNumber} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Select
                      value={formData.expiryMonth}
                      onValueChange={(value) => handleSelectChange("expiryMonth", value)}
                    >
                      <SelectTrigger id="expiryMonth">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1
                          return (
                            <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Select
                      value={formData.expiryYear}
                      onValueChange={(value) => handleSelectChange("expiryYear", value)}
                    >
                      <SelectTrigger id="expiryYear">
                        <SelectValue placeholder="YY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i
                          return (
                            <SelectItem key={year} value={year.toString().slice(-2)}>
                              {year.toString().slice(-2)}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="CVC" value={formData.cvc} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileProvider">Mobile Money Provider</Label>
                  <Select
                    value={formData.mobileProvider}
                    onValueChange={(value) => handleSelectChange("mobileProvider", value)}
                  >
                    <SelectTrigger id="mobileProvider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.country &&
                        mobileMoneyProviders[formData.country as keyof typeof mobileMoneyProviders].map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-gray-100 rounded-md">
                  <p className="text-sm">
                    You will receive a prompt on your mobile phone to complete the payment with{" "}
                    {formData.mobileProvider || "your selected provider"}.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium text-lg">Confirm Your Payment</h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Amount:</div>
                <div className="font-medium">${formData.amount}</div>

                <div className="text-gray-500">Mobile Number:</div>
                <div className="font-medium">{formData.mobileNumber}</div>

                <div className="text-gray-500">Country:</div>
                <div className="font-medium">
                  <div className="flex items-center">
                    <CountryFlag country={formData.country} />
                    {formData.country}
                  </div>
                </div>

                <div className="text-gray-500">Payment Method:</div>
                <div className="font-medium">{formData.paymentMethod === "card" ? "Card Payment" : "Mobile Money"}</div>

                {formData.paymentMethod === "card" ? (
                  <>
                    <div className="text-gray-500">Card Holder:</div>
                    <div className="font-medium">{formData.cardName}</div>

                    <div className="text-gray-500">Card Number:</div>
                    <div className="font-medium flex items-center">
                      {formData.cardNumber ? "xxxx xxxx xxxx " + formData.cardNumber.slice(-4) : ""}
                      <span className="ml-2">
                        <CardIcon cardNumber={formData.cardNumber} />
                      </span>
                    </div>

                    <div className="text-gray-500">Expiry Date:</div>
                    <div className="font-medium">
                      {formData.expiryMonth}/{formData.expiryYear}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-500">Mobile Provider:</div>
                    <div className="font-medium">{formData.mobileProvider}</div>
                  </>
                )}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <p className="text-sm text-yellow-800">
                  Please review your information carefully before proceeding with the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful</h3>
            <p className="text-gray-500 mb-4">
              Your payment of ${formData.amount} has been processed successfully. You will receive a confirmation
              shortly.
            </p>

            {transactionId && (
              <div className="text-sm text-gray-600 mb-4">
                Transaction ID: <span className="font-mono font-medium">{transactionId}</span>
              </div>
            )}

            <ReceiptGenerator
              paymentData={{
                ...formData,
                transactionId,
                timestamp: new Date().toISOString(),
              }}
              receiptUrl={receiptUrl}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && step < 5 && (
          <Button variant="outline" onClick={handlePrevStep}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button
            onClick={handleNextStep}
            disabled={
              (step === 1 && (!formData.mobileNumber || !formData.country || !formData.amount)) ||
              (step === 2 && !formData.paymentMethod)
            }
            className={step === 1 ? "ml-auto" : ""}
          >
            Next
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={handleSubmit}
            disabled={
              (formData.paymentMethod === "card" &&
                (!formData.cardName ||
                  !formData.cardNumber ||
                  !formData.expiryMonth ||
                  !formData.expiryYear ||
                  !formData.cvc)) ||
              (formData.paymentMethod === "mobile" && !formData.mobileProvider)
            }
          >
            Review Payment
          </Button>
        )}
        {step === 4 && <Button onClick={handleConfirmPayment}>Confirm & Pay</Button>}
        {step === 5 && (
          <Button
            onClick={() => {
              setStep(1)
              setFormData({
                mobileNumber: "",
                country: "",
                paymentMethod: "",
                cardName: "",
                cardNumber: "",
                expiryMonth: "",
                expiryYear: "",
                cvc: "",
                mobileProvider: "",
                amount: "100.00",
              })
              setReceiptUrl(null)
              setTransactionId(null)
            }}
            className="mx-auto"
          >
            Make Another Payment
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
