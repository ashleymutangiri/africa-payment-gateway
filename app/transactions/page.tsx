import { TransactionHistory } from "@/components/transaction-history"

export default function TransactionsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl">
        <TransactionHistory />
      </div>
    </main>
  )
}
