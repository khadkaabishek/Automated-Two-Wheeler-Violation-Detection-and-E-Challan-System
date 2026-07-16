import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Video,
  Moon,
  Sun,
  LogIn,
  LogOut
} from "lucide-react";

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const email = localStorage.getItem("userEmail") || "officer.id@morth.gov.in";

  const getDisplayName = (emailStr) => {
    const namePart = emailStr.split('@')[0];
    return namePart
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = getDisplayName(email);
  const initials = getInitials(displayName);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    navigate("/", { replace: true });
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      return "relative rounded-lg bg-secondary flex px-3 py-2.5 items-center gap-3 font-semibold text-primary text-[13px]";
    }
    return "rounded-lg flex px-3 py-2.5 items-center gap-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-[13px]";
  };

  const getIconClass = (path) => {
    return location.pathname === path ? "size-4 text-primary" : "size-4 text-muted-foreground";
  };

  return (
    <div className="bg-background text-foreground flex w-full min-h-screen">
      <aside className="shrink-0 bg-card border-r border-border flex p-4 flex-col gap-6 w-55">
        <div className="flex px-2 pt-2 items-center gap-2">
          <div className="size-9 rounded-xl bg-secondary flex justify-center items-center">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-semibold text-foreground text-sm leading-5">
              VisionGuard
            </span>
            <span className="leading-tight text-muted-foreground text-[11px]">
              AI Enforcement
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <Link to="/dashboard" className={getLinkClass("/dashboard")}>
            <LayoutDashboard className={getIconClass("/dashboard")} />
            <span>Dashboard</span>
          </Link>
          <Link to="/live-monitoring" className={getLinkClass("/live-monitoring")}>
            <Video className={getIconClass("/live-monitoring")} />
            <span>Live Monitoring</span>
          </Link>
          <Link to="/violations" className={getLinkClass("/violations")}>
            <AlertCircle className={getIconClass("/violations")} />
            <span>Violations</span>
          </Link>
          <Link to="/challan-management" className={getLinkClass("/challan-management")}>
            <FileText className={getIconClass("/challan-management")} />
            <span>E-Challans</span>
          </Link>
          <Link to="/analytics" className={getLinkClass("/analytics")}>
            <BarChart3 className={getIconClass("/analytics")} />
            <span>Analytics</span>
          </Link>
          <Link to="/" className={getLinkClass("/")}>
            <LogIn className={getIconClass("/")} />
            <span>Login Portal</span>
          </Link>
        </nav>
        <div className="flex flex-col gap-2 mt-auto">
          <button 
            onClick={toggleTheme}
            className="rounded-xl bg-background border border-border flex p-3 items-center justify-center gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="text-[13px] font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="rounded-xl bg-background border border-border flex p-3 items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-secondary flex justify-center items-center">
                <span className="font-semibold text-primary text-xs">{initials}</span>
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-foreground text-[13px] font-semibold truncate max-w-[120px]" title={displayName}>
                  {displayName}
                </span>
                <span className="leading-tight text-muted-foreground text-[11px]">
                  Traffic Officer
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer" 
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="bg-background flex flex-col flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
