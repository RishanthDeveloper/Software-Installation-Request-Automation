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
    navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Analytics' });
    navItems.push({ to: '/queue', icon: Package, label: 'Fulfillment' });
  }

  if (['manager', 'admin'].includes(user.role)) {
    navItems.push({ to: '/approvals', icon: Inbox, label: 'Approvals' });
  }

  // Everyone can see requests
  navItems.push({ to: '/requests', icon: CheckSquare, label: 'My Requests' });

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-surface border-r border-line hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-line">
          <div className="w-8 h-8 bg-ink text-surface flex items-center justify-center font-display text-lg mr-3">SR</div>
          <span className="font-display text-[18px] text-ink tracking-tight">Clearance</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 transition-colors text-[14px] font-medium border-l-[3px] rounded-none
                ${isActive ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-muted hover:bg-black/5 hover:text-ink'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-line flex items-center justify-between px-6 z-10">
          <div className="md:hidden flex items-center">
            <div className="w-8 h-8 bg-ink text-surface flex items-center justify-center font-display mr-3">SR</div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[14px] font-medium text-ink">{user.name}</div>
              <div className="mono-label text-muted">{user.role.replace('_', ' ')}</div>
            </div>
            <div className="w-10 h-10 border border-line bg-background flex items-center justify-center text-ink font-mono text-[14px]">
              {user.initials}
            </div>
            <button onClick={handleLogout} className="p-2 text-muted hover:text-denied hover:bg-black/5 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {/* Mobile Nav */}
        <nav className="md:hidden flex bg-surface border-b border-line overflow-x-auto">
           {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-3 text-[14px] font-medium whitespace-nowrap border-b-[3px] rounded-none
                ${isActive ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-muted hover:bg-black/5'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
