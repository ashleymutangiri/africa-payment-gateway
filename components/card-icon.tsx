import { CreditCard } from "lucide-react"

type CardType = "visa" | "mastercard" | "amex" | "unknown"

export function detectCardType(cardNumber: string): CardType {
  const cleanNumber = cardNumber.replace(/\D/g, "")

  // Visa: Starts with 4
  if (/^4/.test(cleanNumber)) {
    return "visa"
  }

  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleanNumber)) {
    return "mastercard"
  }

  // American Express: Starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return "amex"
  }

  return "unknown"
}

export function CardIcon({ cardNumber }: { cardNumber: string }) {
  const cardType = detectCardType(cardNumber)

  if (cardType === "visa") {
    return (
      <svg className="h-6 w-10" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M40 0H740C762.091 0 780 17.9086 780 40V460C780 482.091 762.091 500 740 500H40C17.9086 500 0 482.091 0 460V40C0 17.9086 17.9086 0 40 0Z"
          fill="#0066B2"
        />
        <path d="M470.002 235.5H311.004L323.004 182.5H458.002L470.002 235.5Z" fill="white" />
        <path d="M333.5 348.5L350 290.5H395.5L379 348.5H333.5Z" fill="white" />
        <path d="M313.5 348.5L346.5 182.5H392L359 348.5H313.5Z" fill="white" />
        <path d="M399.5 348.5L432.5 182.5H478L445 348.5H399.5Z" fill="white" />
        <path d="M485.5 348.5L518.5 182.5H564L531 348.5H485.5Z" fill="white" />
      </svg>
    )
  }

  if (cardType === "mastercard") {
    return (
      <svg className="h-6 w-10" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M40 0H740C762.091 0 780 17.9086 780 40V460C780 482.091 762.091 500 740 500H40C17.9086 500 0 482.091 0 460V40C0 17.9086 17.9086 0 40 0Z"
          fill="white"
        />
        <path
          d="M449 250C449 323.5 389.5 383 316 383C242.5 383 183 323.5 183 250C183 176.5 242.5 117 316 117C389.5 117 449 176.5 449 250Z"
          fill="#D9222A"
        />
        <path
          d="M597 250C597 323.5 537.5 383 464 383C390.5 383 331 323.5 331 250C331 176.5 390.5 117 464 117C537.5 117 597 176.5 597 250Z"
          fill="#0099DF"
        />
        <path
          d="M464 383C537.5 383 597 323.5 597 250C597 176.5 537.5 117 464 117C390.5 117 331 176.5 331 250C331 323.5 390.5 383 464 383Z"
          fill="#6C6BBD"
        />
        <path
          d="M464 383C537.5 383 597 323.5 597 250C597 176.5 537.5 117 464 117C427.5 117 394.5 132 371 156.5C394.5 181 409.5 214 409.5 250C409.5 286 394.5 319 371 343.5C394.5 368 427.5 383 464 383Z"
          fill="#EB001B"
        />
        <path
          d="M316 383C352.5 383 385.5 368 409 343.5C385.5 319 370.5 286 370.5 250C370.5 214 385.5 181 409 156.5C385.5 132 352.5 117 316 117C242.5 117 183 176.5 183 250C183 323.5 242.5 383 316 383Z"
          fill="#0099DF"
        />
      </svg>
    )
  }

  if (cardType === "amex") {
    return (
      <svg className="h-6 w-10" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M40 0H740C762.091 0 780 17.9086 780 40V460C780 482.091 762.091 500 740 500H40C17.9086 500 0 482.091 0 460V40C0 17.9086 17.9086 0 40 0Z"
          fill="#016FD0"
        />
        <path d="M390 375H586V325H390V375Z" fill="white" />
        <path d="M390 295H586V245H390V295Z" fill="white" />
        <path d="M488 125L390 125V225H488L538 175L488 125Z" fill="white" />
        <path d="M194 125L292 125V225H194L144 175L194 125Z" fill="white" />
        <path d="M194 375H390V175H292L194 175V375Z" fill="white" />
      </svg>
    )
  }

  return <CreditCard className="h-6 w-6 text-gray-400" />
}
