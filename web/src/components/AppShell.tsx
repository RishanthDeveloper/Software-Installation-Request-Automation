
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LayoutDashboard, Inbox, CheckSquare, LogOut, Package } from 'lucide-react';

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [];

  if (['it_support', 'admin'].includes(user.role)) {
    navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
    navItems.push({ to: '/queue', icon: Package, label: 'Fulfillment Queue' });
  }

  if (['manager', 'admin'].includes(user.role)) {
    navItems.push({ to: '/approvals', icon: Inbox, label: 'Approvals' });
  }

  // Everyone can see requests
  navItems.push({ to: '/requests', icon: CheckSquare, label: 'My Requests' });

  return (
    <div className="flex h-screen bg-muted flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold mr-3">SR</div>
          <span className="font-semibold text-foreground">Software Request</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10">
          <div className="md:hidden flex items-center">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold mr-3">SR</div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground font-mono uppercase">{user.role.replace('_', ' ')}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold border border-border">
              {user.initials}
            </div>
            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {/* Mobile Nav */}
        <nav className="md:hidden flex bg-card border-b border-border overflow-x-auto">
           {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2
                ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
