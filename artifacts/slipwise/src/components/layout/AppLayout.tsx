import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Receipt, PieChart, Settings, ScanLine } from "lucide-react";
import { useAuth } from "@clerk/react";
import { Redirect } from "wouter";
import { usePreferences } from "@/contexts/PreferencesContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { t } = usePreferences();

  if (isLoaded && !isSignedIn) {
    return <Redirect to="/sign-in" />;
  }

  const leftTabs = [
    { name: t.nav.home, path: "/", icon: Home },
    { name: t.nav.expenses, path: "/expenses", icon: Receipt },
  ];

  const rightTabs = [
    { name: t.nav.reports, path: "/reports", icon: PieChart },
    { name: t.nav.settings, path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const isScanActive = location === "/scan";

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-20">
      <main className="flex-1 w-full max-w-lg mx-auto relative p-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around z-50 max-w-lg mx-auto px-2">
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}

        {/* Center Scan FAB */}
        <div className="relative -top-5 flex-shrink-0">
          <Link
            href="/scan"
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-200 active:scale-95 ${
              isScanActive
                ? "bg-primary text-primary-foreground shadow-primary/40"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <ScanLine className="w-6 h-6" />
          </Link>
          <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap ${isScanActive ? "text-primary" : "text-muted-foreground"}`}>
            {t.scanner.title}
          </span>
        </div>

        {rightTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
