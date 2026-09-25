import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import Link from "next/link"
import { LayoutDashboard, ListChecks, Inbox, KanbanSquare, LogOut } from "lucide-react"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const roles = (session.user as any)?.roles || []
  
  const navItems = []

  if (roles.includes("x_swreq.it_support") || roles.includes("x_swreq.admin")) {
    navItems.push({ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard })
    navItems.push({ name: "Fulfillment Queue", href: "/queue", icon: KanbanSquare })
  }

  if (roles.includes("x_swreq.manager") || roles.includes("x_swreq.it_manager") || roles.includes("x_swreq.admin")) {
    navItems.push({ name: "Approvals", href: "/approvals", icon: Inbox })
  }

  if (roles.includes("x_swreq.employee") || roles.includes("x_swreq.admin")) {
    navItems.push({ name: "My Requests", href: "/requests", icon: ListChecks })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="font-semibold text-lg flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs">SR</span>
            Software Request
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm truncate">
            <p className="font-medium text-foreground truncate">{session.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
          </div>
          <Link href="/api/auth/signout" className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <header className="md:hidden border-b border-border bg-card p-4 flex justify-between items-center">
          <span className="font-semibold">Software Request</span>
          <Link href="/api/auth/signout"><LogOut className="w-4 h-4 text-muted-foreground" /></Link>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
