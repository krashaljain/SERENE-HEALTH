import { Outlet, NavLink, useLocation } from 'react-router';
import { Home, FolderOpen, Activity, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: FolderOpen, label: 'Vault', path: '/vault' },
  { icon: Activity, label: 'Analyze', path: '/analyze' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function Layout() {
  const location = useLocation();
  
  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-pastel-bg relative">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pastel-lavender/40 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pastel-mint/30 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-pastel-surface/60 backdrop-blur-xl border-r border-black/[0.03] z-10">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pastel-lavender to-pastel-blue flex items-center justify-center">
            <Activity className="w-4 h-4 text-text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">SereneHealth</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-black/5"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-black/[0.02]"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary")} />
                  <span className="font-medium relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 z-10 relative">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-pastel-surface/80 backdrop-blur-xl border-t border-black/[0.03] z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center p-2 relative"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-pastel-lavender/50 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10 mb-1 transition-colors", isActive ? "text-text-primary" : "text-text-secondary")} />
                  <span className={cn("text-[10px] font-medium relative z-10 transition-colors", isActive ? "text-text-primary" : "text-text-secondary")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
