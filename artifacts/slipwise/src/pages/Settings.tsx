import { useUser, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun, CreditCard } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-xl font-bold">{user?.fullName || "User"}</h2>
        <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-2">Preferences</h3>
        
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="font-medium text-sm">Dark Mode</span>
            </div>
            <select 
              className="bg-transparent text-sm font-medium focus:outline-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">Currency</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">USD ($)</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          variant="destructive" 
          className="w-full rounded-xl h-12"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}