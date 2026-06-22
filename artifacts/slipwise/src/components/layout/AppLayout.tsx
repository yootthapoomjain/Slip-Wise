import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Receipt, PieChart, Target, Settings, Plus } from "lucide-react";
import { useAuth } from "@clerk/react";
import { Redirect } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && !isSignedIn) {
    return <Redirect to="/sign-in" />;
  }

  const tabs = [
    { name: "Home", path: "/", icon: Home },
    { name: "Expenses", path: "/expenses", icon: Receipt },
    { name: "Reports", path: "/reports", icon: PieChart },
    { name: "Goals", path: "/goals", icon: Target },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-20">
      <main className="flex-1 w-full max-w-lg mx-auto relative p-4">
        {children}
      </main>
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-t border-border flex items-center justify-around z-50 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <Link key={tab.path} href={tab.path} className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* FAB - Show only on Dashboard and Expenses list */}
      {(location === "/" || location === "/expenses") && (
        <div className="fixed bottom-20 right-4 md:right-[calc(50%-220px)] z-50">
          <Link href="/expenses/new" className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      )}
    </div>
  );
}