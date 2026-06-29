import type { ReactNode } from "react";
import { LogOut, Plus, Radar } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/authStore";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Radar className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Mission Control</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>
              Command Center
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/missions/new"
              className="hidden items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/20 sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              New Mission
            </Link>

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-7 w-7 rounded-full ring-1 ring-border"
              />
            ) : null}

            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
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
        "rounded-lg px-3 py-1.5 text-sm transition",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
