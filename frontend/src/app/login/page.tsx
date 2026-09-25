"use client"

import { signIn } from "next-auth/react"
import { Lock } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <div className="w-12 h-12 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-6">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Sign In</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Authenticate with your ServiceNow enterprise account to request software or manage approvals.
        </p>
        <button
          onClick={() => signIn("servicenow", { callbackUrl: "/dashboard" })}
          className="w-full bg-primary text-primary-foreground font-medium h-10 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Sign in with ServiceNow
        </button>
      </div>
    </div>
  )
}
