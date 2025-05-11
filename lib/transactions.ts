import { executeQuery } from "./db"

export interface User {
  id?: number
  mobile_number: string
  country: string
}

export interface Transaction {
  id?: number
  transaction_id: string
  user_id?: number
  amount: number
  currency: string
  payment_method: string
  status: string
  note?: string
  receipt_url?: string
  metadata?: any
  created_at?: Date
}

export async function createUser(user: User): Promise<number> {
  const result = await executeQuery(
    `INSERT INTO users (mobile_number, country) 
     VALUES ($1, $2) 
     ON CONFLICT (mobile_number) DO UPDATE 
     SET country = $2, updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [user.mobile_number, user.country],
  )

  return result[0].id
}

export async function createTransaction(transaction: Transaction): Promise<string> {
  const result = await executeQuery(
    `INSERT INTO transactions 
     (transaction_id, user_id, amount, currency, payment_method, status, note, receipt_url, metadata) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING transaction_id`,
    [
      transaction.transaction_id,
      transaction.user_id,
      transaction.amount,
      transaction.currency,
      transaction.payment_method,
      transaction.status || "completed",
      transaction.note || null,
      transaction.receipt_url || null,
      transaction.metadata ? JSON.stringify(transaction.metadata) : null,
    ],
  )

  return result[0].transaction_id
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const result = await executeQuery(`SELECT * FROM transactions WHERE transaction_id = $1`, [transactionId])

  return result.length > 0 ? result[0] : null
}

export async function getTransactionsByUser(userId: number): Promise<Transaction[]> {
  const result = await executeQuery(`SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`, [userId])

  return result
}

export async function getUserByMobileNumber(mobileNumber: string): Promise<User | null> {
  const result = await executeQuery(`SELECT * FROM users WHERE mobile_number = $1`, [mobileNumber])

  return result.length > 0 ? result[0] : null
}
