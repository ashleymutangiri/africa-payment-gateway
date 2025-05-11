import PaymentGateway from "@/components/payment-gateway"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-md">
        <PaymentGateway />

        {/* Temporary Admin Login Button */}
        <div className="mt-8 text-center">
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Admin Login (Temporary)
          </a>
        </div>
      </div>
    </main>
  )
}
