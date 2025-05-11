/**
 * Validates a credit card number using the Luhn algorithm
 * @param cardNumber The card number to validate (can include spaces)
 * @returns boolean indicating if the card number is valid
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, "")

  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  // Luhn algorithm implementation
  let sum = 0
  let shouldDouble = false

  // Loop through digits in reverse order
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
