"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, CreditCard, RefreshCw, Smartphone, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReceiptGenerator } from "./receipt-generator"
import { CountryFlag } from "./country-flag"
import { CardIcon } from "./card-icon"
import { ThemeToggle } from "./theme-toggle"
import { validateCardNumber } from "@/lib/card-validation"

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
  "United States": "+1",
  "United Kingdom": "+44",
}

// Currency mapping for each country
const currencyMap = {
  Zimbabwe: { code: "USD", symbol: "$", rate: 1 },
  Zambia: { code: "ZMW", symbol: "K", rate: 0.043 },
  "South Africa": { code: "ZAR", symbol: "R", rate: 0.055 },
  "United States": { code: "USD", symbol: "$", rate: 1 },
  "United Kingdom": { code: "GBP", symbol: "£", rate: 1.27 },
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
    note: "", // Add this new field
  })
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isGlowing, setIsGlowing] = useState(false)
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$", rate: 1 })
  const [cardError, setCardError] = useState<string | null>(null)
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [usdtPaymentConfirmed, setUsdtPaymentConfirmed] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Update currency when country changes
  useEffect(() => {
    if (formData.country && currencyMap[formData.country as keyof typeof currencyMap]) {
      setCurrency(currencyMap[formData.country as keyof typeof currencyMap])
    } else {
      setCurrency({ code: "USD", symbol: "$", rate: 1 })
    }
  }, [formData.country])

  // Format card number in groups of 4
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const groups = []

    for (let i = 0; i < cleanValue.length; i += 4) {
      groups.push(cleanValue.slice(i, i + 4))
    }

    return groups.join(" ")
  }

  const fetchExchangeRate = async (from: string, to = "USD") => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${to}`)
      const data = await response.json()
      if (data && data.rates && data.rates[from]) {
        return 1 / data.rates[from] // Convert to USD rate
      }
      return currencyMap[from as keyof typeof currencyMap]?.rate || 1
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
      return currencyMap[from as keyof typeof currencyMap]?.rate || 1
    } finally {
      setIsRefreshing(false)
    }
  }

  const refreshExchangeRate = async () => {
    if (formData.country && currencyMap[formData.country as keyof typeof currencyMap]) {
      const currencyCode = currencyMap[formData.country as keyof typeof currencyMap].code
      if (currencyCode !== "USD") {
        const rate = await fetchExchangeRate(currencyCode)
        setExchangeRates((prev) => ({ ...prev, [currencyCode]: rate }))
      } else {
        setExchangeRates((prev) => ({ ...prev, USD: 1 }))
      }
    }
  }

  useEffect(() => {
    const updateExchangeRates = async () => {
      if (formData.country && currencyMap[formData.country as keyof typeof currencyMap]) {
        const currencyCode = currencyMap[formData.country as keyof typeof currencyMap].code
        if (currencyCode !== "USD") {
          const rate = await fetchExchangeRate(currencyCode)
          setExchangeRates((prev) => ({ ...prev, [currencyCode]: rate }))
        } else {
          setExchangeRates((prev) => ({ ...prev, USD: 1 }))
        }
      }
    }

    updateExchangeRates()
  }, [formData.country])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    if (id === "cardNumber") {
      // Format card number in groups of 4
      const formattedValue = formatCardNumber(value)
      setFormData({ ...formData, [id]: formattedValue })

      // Clear error when user is typing
      setCardError(null)
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
    // Reset USDT payment confirmation when changing payment method
    if (value !== "usdt") {
      setUsdtPaymentConfirmed(false)
    }
  }

  const handleNextStep = () => {
    setStep(step + 1)
    triggerGlowEffect()
  }

  const handlePrevStep = () => {
    setStep(step - 1)
    triggerGlowEffect()
  }

  const validateCardDetails = () => {
    if (formData.paymentMethod === "card") {
      if (!validateCardNumber(formData.cardNumber)) {
        setCardError("Invalid card number. Please check and try again.")
        return false
      }
      setCardError(null)
      return true
    }
    return true
  }

  const getUsdEquivalent = (amount: string) => {
    const numAmount = Number.parseFloat(amount) || 0
    const rate = exchangeRates[currency.code] || currency.rate
    return (numAmount * rate).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate card details if payment method is card
    if (!validateCardDetails()) {
      return
    }

    // Move to confirmation step
    setStep(4)
    triggerGlowEffect()
  }

  const handleConfirmPayment = async () => {
    // Generate a transaction ID
    const newTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    setTransactionId(newTransactionId)

    try {
      // Store transaction in database
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: newTransactionId,
          mobileNumber: formData.mobileNumber,
          country: formData.country,
          amount: formData.amount,
          currency: formData.paymentMethod === "usdt" ? "USDT" : currency.code,
          paymentMethod: formData.paymentMethod,
          note: formData.note,
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          mobileProvider: formData.mobileProvider,
          usdEquivalent: formData.paymentMethod === "usdt" ? getUsdEquivalent(formData.amount) : null,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        console.error("Failed to store transaction:", data.error)
      }
    } catch (error) {
      console.error("Error storing transaction:", error)
    }

    // Move to success step
    setStep(5)
    triggerGlowEffect()
    setShowSuccessAnimation(true)
  }

  const triggerGlowEffect = () => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), 2000)
  }

  const confirmUsdtPayment = () => {
    setUsdtPaymentConfirmed(true)
  }

  return (
    <Card className="w-full card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">24/7 Payment Gateway</CardTitle>
            <CardDescription>"Paying someone in Africa has never been easier"</CardDescription>
          </div>
          <ThemeToggle />
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
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {step > index + 1 ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 ${isGlowing ? "progress-glow" : ""}`}>
            <div
              className="bg-green-600 dark:progress-bar h-2.5 rounded-full transition-all duration-300"
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
                  <SelectItem value="United States">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg" role="img" aria-label="United States flag">
                        🇺🇸
                      </span>
                      United States
                    </div>
                  </SelectItem>
                  <SelectItem value="United Kingdom">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg" role="img" aria-label="United Kingdom flag">
                        🇬🇧
                      </span>
                      United Kingdom
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
                    ? `${countryCodeMap[formData.country as keyof typeof countryCodeMap] || "+1"} phone number`
                    : "Enter your mobile number"
                }
                value={formData.mobileNumber}
                onChange={handleInputChange}
                required
              />
              {formData.country && (
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code {countryCodeMap[formData.country as keyof typeof countryCodeMap] || "+1"}
                </p>
              )}
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
              {formData.country === "United States" || formData.country === "United Kingdom" ? (
                <div>
                  <RadioGroupItem value="usdt" id="usdt" className="peer sr-only" />
                  <Label
                    htmlFor="usdt"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        fill="#26A17B"
                        fillOpacity="0.2"
                        stroke="#26A17B"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12.75 11.25V15.75M11.25 11.25V15.75M8.25 8.25H15.75M7.5 10.5H16.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    USDT
                  </Label>
                </div>
              ) : (
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
              )}
            </RadioGroup>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.paymentMethod === "card" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currency.code})</Label>
                  <div className="relative flex">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      {currency.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="pl-8 flex-grow"
                      required
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={refreshExchangeRate}
                      disabled={isRefreshing}
                      title="Refresh exchange rate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span className="sr-only">Refresh rate</span>
                    </Button>
                  </div>
                  {currency.code !== "USD" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      * {currency.symbol}
                      {formData.amount} {currency.code} ≈ ${getUsdEquivalent(formData.amount)} USD
                    </p>
                  )}
                </div>
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
                  {cardError && <p className="text-sm text-red-500 mt-1">{cardError}</p>}
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
                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <textarea
                    id="note"
                    placeholder="Add a note describing what you are paying for"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full min-h-[80px] p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            ) : formData.paymentMethod === "usdt" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <div className="relative flex">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount in USDT"
                      value={getUsdEquivalent(formData.amount)}
                      onChange={(e) => {
                        const usdtAmount = e.target.value
                        const rate = exchangeRates[currency.code] || currency.rate
                        const originalAmount = (Number.parseFloat(usdtAmount) / rate).toFixed(2)
                        setFormData({ ...formData, amount: originalAmount })
                      }}
                      className="pl-8 flex-grow"
                      required
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={refreshExchangeRate}
                      disabled={isRefreshing}
                      title="Refresh exchange rate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span className="sr-only">Refresh rate</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    * {currency.code !== "USD" ? `${currency.symbol}${formData.amount} ${currency.code} ≈ ` : ""}$
                    {getUsdEquivalent(formData.amount)} USDT
                  </p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm mb-4">You'll be sending ${getUsdEquivalent(formData.amount)} USDT.</p>
                  <p className="text-sm">
                    Please review your information on the next screen before proceeding with the payment.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <textarea
                    id="note"
                    placeholder="Add a note describing what you are paying for"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full min-h-[80px] p-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ({currency.code})</Label>
                  <div className="relative flex">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      {currency.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="pl-8 flex-grow"
                      required
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={refreshExchangeRate}
                      disabled={isRefreshing}
                      title="Refresh exchange rate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span className="sr-only">Refresh rate</span>
                    </Button>
                  </div>
                  {currency.code !== "USD" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      * {currency.symbol}
                      {formData.amount} {currency.code} ≈ ${getUsdEquivalent(formData.amount)} USD
                    </p>
                  )}
                </div>
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
                        mobileMoneyProviders[formData.country as keyof typeof mobileMoneyProviders]?.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm">
                    You will receive a prompt on your mobile phone to complete the payment with{" "}
                    {formData.mobileProvider || "your selected provider"}.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <textarea
                    id="note"
                    placeholder="Add a note describing what you are paying for"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full min-h-[80px] p-2 border rounded-md bg-background"
                  />
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
                <div className="text-gray-500 dark:text-gray-400">Amount:</div>
                <div className="font-medium">
                  {formData.paymentMethod === "usdt" ? (
                    <>${getUsdEquivalent(formData.amount)} USDT</>
                  ) : (
                    <>
                      {currency.symbol}
                      {formData.amount} {currency.code}
                      {currency.code !== "USD" && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (≈ ${getUsdEquivalent(formData.amount)} USD)
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="text-gray-500 dark:text-gray-400">Mobile Number:</div>
                <div className="font-medium">{formData.mobileNumber}</div>

                <div className="text-gray-500 dark:text-gray-400">Country:</div>
                <div className="font-medium">
                  <div className="flex items-center">
                    {formData.country === "United States" ? (
                      <span className="mr-2 text-lg" role="img" aria-label="United States flag">
                        🇺🇸
                      </span>
                    ) : formData.country === "United Kingdom" ? (
                      <span className="mr-2 text-lg" role="img" aria-label="United Kingdom flag">
                        🇬🇧
                      </span>
                    ) : (
                      <CountryFlag country={formData.country} />
                    )}
                    {formData.country}
                  </div>
                </div>

                <div className="text-gray-500 dark:text-gray-400">Payment Method:</div>
                <div className="font-medium">
                  {formData.paymentMethod === "card"
                    ? "Card Payment"
                    : formData.paymentMethod === "usdt"
                      ? "Crypto (USDT)"
                      : "Mobile Money"}
                </div>

                {formData.paymentMethod === "card" ? (
                  <>
                    <div className="text-gray-500 dark:text-gray-400">Card Holder:</div>
                    <div className="font-medium">{formData.cardName}</div>

                    <div className="text-gray-500 dark:text-gray-400">Card Number:</div>
                    <div className="font-medium flex items-center">
                      {formData.cardNumber ? "xxxx xxxx xxxx " + formData.cardNumber.slice(-4) : ""}
                      <span className="ml-2">
                        <CardIcon cardNumber={formData.cardNumber} />
                      </span>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">Expiry Date:</div>
                    <div className="font-medium">
                      {formData.expiryMonth}/{formData.expiryYear}
                    </div>
                  </>
                ) : formData.paymentMethod === "usdt" ? (
                  <>
                    {!usdtPaymentConfirmed ? (
                      <div className="col-span-2 mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <p className="text-sm mb-3">
                          Send ${getUsdEquivalent(formData.amount)} USDT to the following address:
                        </p>
                        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs break-all">
                          TRC20: TJYeasTPa6gpEEfYiH8xZXQbSNwzCNERwD
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Please include your mobile number in the transaction memo for faster processing.
                        </div>
                        <div className="mt-4 flex justify-center">
                          <Button onClick={confirmUsdtPayment} className="w-full">
                            I've Made This Payment
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-md">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                          <p className="text-sm text-green-800 dark:text-green-200">
                            USDT payment confirmed. Please proceed with the payment.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-gray-500 dark:text-gray-400">Mobile Provider:</div>
                    <div className="font-medium">{formData.mobileProvider}</div>
                  </>
                )}
                {formData.note && (
                  <>
                    <div className="text-gray-500 dark:text-gray-400">Note:</div>
                    <div className="font-medium">{formData.note}</div>
                  </>
                )}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800/30 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please review your information carefully before proceeding with the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-6">
            <div
              className={`w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 ${showSuccessAnimation ? "success-circle-animation" : ""}`}
            >
              <Check
                className={`h-8 w-8 text-green-600 dark:text-green-400 ${showSuccessAnimation ? "checkmark-animation" : ""}`}
              />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Successful</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {formData.paymentMethod === "usdt" ? (
                <>Your payment of ${getUsdEquivalent(formData.amount)} USDT has been processed successfully.</>
              ) : (
                <>
                  Your payment of {currency.symbol}
                  {formData.amount} {currency.code} has been processed successfully.
                </>
              )}{" "}
              You will receive a confirmation shortly.
            </p>

            {transactionId && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Transaction ID: <span className="font-mono font-medium">{transactionId}</span>
              </div>
            )}

            <ReceiptGenerator
              paymentData={{
                ...formData,
                currency: formData.paymentMethod === "usdt" ? "USDT" : currency.code,
                currencySymbol: formData.paymentMethod === "usdt" ? "$" : currency.symbol,
                amount: formData.paymentMethod === "usdt" ? getUsdEquivalent(formData.amount) : formData.amount,
                transactionId,
                timestamp: new Date().toISOString(),
              }}
              receiptUrl={receiptUrl}
              onReceiptGenerated={(url) => {
                setReceiptUrl(url)
                // Update transaction with receipt URL
                fetch("/api/transactions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    transactionId,
                    receiptUrl: url,
                    mobileNumber: formData.mobileNumber,
                    country: formData.country,
                    amount: formData.amount,
                    currency: formData.paymentMethod === "usdt" ? "USDT" : currency.code,
                    paymentMethod: formData.paymentMethod,
                  }),
                }).catch((error) => console.error("Error updating receipt URL:", error))
              }}
            />

            <div className="mt-6">
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <a href={`/transactions?mobileNumber=${encodeURIComponent(formData.mobileNumber)}`}>
                  <History className="h-4 w-4" />
                  View Transaction History
                </a>
              </Button>
            </div>
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
              (step === 1 && (!formData.mobileNumber || !formData.country)) || (step === 2 && !formData.paymentMethod)
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
              !formData.amount ||
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
        {step === 4 && (
          <Button onClick={handleConfirmPayment} disabled={formData.paymentMethod === "usdt" && !usdtPaymentConfirmed}>
            Confirm & Pay
          </Button>
        )}
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
                note: "",
              })
              setReceiptUrl(null)
              setTransactionId(null)
              setUsdtPaymentConfirmed(false)
              setShowSuccessAnimation(false)
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
