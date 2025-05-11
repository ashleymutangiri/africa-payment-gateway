import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the database URL from environment variables
export const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle ORM instance
export const db = drizzle(sql)

// Helper function to execute raw SQL queries using the correct syntax
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Use sql.query for conventional function calls with value placeholders
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Alternative helper using tagged template literals
export function sqlTemplate(strings: TemplateStringsArray, ...values: any[]) {
  return sql(strings, ...values)
}
