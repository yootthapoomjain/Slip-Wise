import { useUser, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Moon, Sun, CreditCard, Languages, Calendar, Palette, Crown, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { usePreferences, Currency, CalendarEra } from "@/contexts/PreferencesContext";
import { getCurrencyLabel } from "@/lib/format";
import { Link } from "wouter";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage, currency, setCurrency, calendarEra, setCalendarEra } = usePreferences();

  const currencies: Currency[] = ["THB", "USD", "EUR", "GBP", "JPY", "SGD"];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
      </header>

      <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-primary/20">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>
        <h2 className="text-xl font-bold">{user?.fullName || "User"}</h2>
        <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      <Link href="/premium">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">SlipWise Premium</h3>
              <p className="text-white/80 text-xs">{t.premium.subtitle}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-50" />
        </div>
      </Link>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-4">{t.settings.preferences}</h3>
        
        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          {/* Language Picker */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center">
                <Languages className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{t.settings.language}</span>
            </div>
            <select 
              className="bg-transparent text-sm font-semibold focus:outline-none text-primary cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="th">🇹🇭 ภาษาไทย</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          {/* Currency Picker */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{t.settings.currency}</span>
            </div>
            <select 
              className="bg-transparent text-sm font-semibold focus:outline-none text-primary cursor-pointer max-w-[150px]"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {currencies.map(c => (
                <option key={c} value={c}>{getCurrencyLabel(c)}</option>
              ))}
            </select>
          </div>

          {/* Calendar Era Picker */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{t.settings.calendarEra}</span>
            </div>
            <select 
              className="bg-transparent text-sm font-semibold focus:outline-none text-primary cursor-pointer"
              value={calendarEra}
              onChange={(e) => setCalendarEra(e.target.value as CalendarEra)}
            >
              <option value="buddhist">{t.settings.buddhistEra}</option>
              <option value="gregorian">{t.settings.gregorian}</option>
            </select>
          </div>

          {/* Theme Picker */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{t.settings.theme}</span>
            </div>
            <select 
              className="bg-transparent text-sm font-semibold focus:outline-none text-primary cursor-pointer"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="light">{t.settings.themeLight}</option>
              <option value="dark">{t.settings.themeDark}</option>
              <option value="system">{t.settings.themeSystem}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full rounded-2xl h-14 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive font-bold transition-colors"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t.settings.signOut}
        </Button>
      </div>
    </div>
  );
}