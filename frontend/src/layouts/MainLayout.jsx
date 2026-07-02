import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Video,
  Moon,
  Sun
} from "lucide-react";

export function MainLayout() {
  const location = useLocation();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      return "relative rounded-lg bg-[#1C2535] flex px-3 py-2.5 items-center gap-3 font-medium text-gray-300 text-[13px]";
    }
    return "rounded-lg flex px-3 py-2.5 items-center gap-3 text-gray-500 text-[13px]";
  };

  const getIconClass = (path) => {
    return location.pathname === path ? "size-4 text-[#2A6B7C]" : "size-4 text-gray-500";
  };

  return (
    <div className="bg-zinc-950 text-neutral-50 flex w-full min-h-screen">
      <aside className="shrink-0 bg-[#0D1017] border-[#1E2530] border-t-0 border-r-1 border-b-0 border-l-0 border-solid flex p-4 flex-col gap-6 w-55">
        <div className="flex px-2 pt-2 items-center gap-2">
          <div className="size-9 rounded-xl bg-[#1C2535] flex justify-center items-center">
            <ShieldCheck className="size-5 text-[#6B8A99]" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-semibold text-gray-400 text-sm leading-5">
              VisionGuard
            </span>
            <span className="leading-tight text-[#4A5568] text-[11px]">
              AI Enforcement
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <Link to="/" className={getLinkClass("/")}>
            <LayoutDashboard className={getIconClass("/")} />
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
        </nav>
        <div className="flex flex-col gap-2 mt-auto">
          <button 
            onClick={toggleTheme}
            className="rounded-xl bg-[#0F1115] border-[#1E2530] border-1 border-solid flex p-3 items-center justify-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {isLightMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
            <span className="text-[13px] font-medium">{isLightMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          
          <div className="rounded-xl bg-[#0F1115] border-[#1E2530] border-1 border-solid flex p-3 items-center gap-3">
            <div className="size-9 rounded-full bg-[#1E2A38] flex justify-center items-center">
              <span className="font-medium text-gray-400 text-xs">RS</span>
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-gray-400 text-[13px]">
                Insp. R. Sharma
              </span>
              <span className="leading-tight text-[#4A5568] text-[11px]">
                Traffic Officer
              </span>
            </div>
          </div>
        </div>
      </aside>
      <main className="bg-[#0F1115] flex flex-col flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
