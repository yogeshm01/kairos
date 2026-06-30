import type { ReactNode } from "react";
import { LogOut, Plus, Radar, User } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/authStore";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050608]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050608]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
              <Radar className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient">Kairos</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>
              Command Center
            </NavLink>
            <NavLink to="/profile" active={location.pathname === "/profile"}>
              Profile
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/missions/new"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/30 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New Mission
            </Link>

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-9 w-9 rounded-full ring-2 ring-cyan-500/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
                <User className="h-4 w-4 text-cyan-400" />
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => void logout()}
              className="rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
        active 
          ? "text-cyan-400 bg-cyan-500/10" 
          : "text-gray-400 hover:text-white hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
}
