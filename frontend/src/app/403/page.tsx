import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-destructive/10 text-destructive mx-auto rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          You do not have the required roles to view this page. If you believe this is an error, please contact IT.
        </p>
        <Link
          href="/requests"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium h-10 px-6 rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to My Requests
        </Link>
      </div>
    </div>
  )
}
