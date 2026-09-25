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
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 md:static md:w-64 md:border-r border-t md:border-t-0 border-border bg-card flex md:flex-col pb-safe md:pb-0">
        <div className="hidden md:flex p-4 border-b border-border items-center">
          <Link href="/" className="font-semibold text-lg flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs">SR</span>
            Software Request
          </Link>
        </div>
        <nav className="flex-1 flex md:flex-col p-2 md:p-4 justify-around md:justify-start gap-1 md:space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-md text-[10px] md:text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <item.icon className="w-5 h-5 md:w-4 md:h-4" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex p-4 border-t border-border items-center justify-between">
          <div className="text-sm truncate pr-2">
            <p className="font-medium text-foreground truncate">{session.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
          </div>
          <Link href="/api/auth/signout" className="text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background mb-16 md:mb-0">
        <header className="md:hidden border-b border-border bg-card p-4 flex justify-between items-center sticky top-0 z-40">
          <Link href="/" className="font-semibold flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <span className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs">SR</span>
            Software Request
          </Link>
          <Link href="/api/auth/signout" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
          </Link>
        </header>
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
