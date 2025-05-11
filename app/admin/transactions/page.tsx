"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: number
  transaction_id: string
  amount: number
  currency: string
  payment_method: string
  status: string
  note?: string
  receipt_url?: string
  created_at: string
  user_id: number
  mobile_number?: string
  country?: string
}

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("mobile")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTransactions = async () => {
    if (!searchTerm) {
      setError("Please enter a search term")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/transactions?type=${searchType}&term=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions)
      } else {
        setError(data.error || "Failed to fetch transactions")
      }
    } catch (err) {
      setError("An error occurred while fetching transactions")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getPaymentMethodName = (code: string) => {
    switch (code) {
      case "card":
        return "Card Payment"
      case "mobile":
        return "Mobile Money"
      case "usdt":
        return "Crypto (USDT)"
      default:
        return code
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Find transactions by mobile number, transaction ID, or amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex gap-4">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile Number</SelectItem>
                      <SelectItem value="transaction">Transaction ID</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1">
                    <Input
                      placeholder={`Enter ${
                        searchType === "mobile"
                          ? "mobile number"
                          : searchType === "transaction"
                            ? "transaction ID"
                            : "country"
                      }`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={searchTransactions} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            {transactions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Found {transactions.length} transactions</h3>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.transaction_id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {transaction.currency === "USDT"
                              ? "$"
                              : transaction.currency === "USD"
                                ? "$"
                                : transaction.currency === "GBP"
                                  ? "£"
                                  : transaction.currency === "ZAR"
                                    ? "R"
                                    : transaction.currency === "ZMW"
                                      ? "K"
                                      : ""}
                            {transaction.amount} {transaction.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getPaymentMethodName(transaction.payment_method)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.created_at)}</p>
                          {transaction.mobile_number && (
                            <p className="text-sm mt-1">
                              <span className="font-medium">Mobile:</span> {transaction.mobile_number}
                            </p>
                          )}
                          {transaction.country && (
                            <p className="text-sm">
                              <span className="font-medium">Country:</span> {transaction.country}
                            </p>
                          )}
                          {transaction.note && <p className="text-sm mt-2 italic">{transaction.note}</p>}
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {transaction.status}
                          </span>
                          {transaction.receipt_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              as="a"
                              href={transaction.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">ID: {transaction.transaction_id}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              searchTerm &&
              !isLoading &&
              !error && (
                <div className="text-center py-8 text-muted-foreground">No transactions found for this search</div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
