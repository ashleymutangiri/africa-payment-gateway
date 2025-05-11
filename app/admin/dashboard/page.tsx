import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, Users, Activity } from "lucide-react"
import { executeQuery } from "@/lib/db"

async function getStats() {
  try {
    const totalTransactions = await executeQuery("SELECT COUNT(*) as count FROM transactions")
    const totalUsers = await executeQuery("SELECT COUNT(*) as count FROM users")
    const totalAmount = await executeQuery(
      "SELECT SUM(amount) as total FROM transactions WHERE currency = 'USD' OR currency = 'USDT'",
    )
    const recentTransactions = await executeQuery("SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5")

    return {
      totalTransactions: totalTransactions[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalAmount: totalAmount[0]?.total || 0,
      recentTransactions,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalTransactions: 0,
      totalUsers: 0,
      totalAmount: 0,
      recentTransactions: [],
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats.totalAmount).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USD and USDT transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentTransactions.length > 0 ? "Active" : "No recent activity"}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest 5 transactions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction: any) => (
                <div key={transaction.transaction_id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">
                      {transaction.currency === "USDT" || transaction.currency === "USD"
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
                    <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {transaction.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No recent transactions</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
