import { motion } from "framer-motion";
import { Crown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useToast } from "@/hooks/use-toast";

const FREE_FEATURES = [
  "unlimitedExpenses",
  "ocr30",
  "dashboard",
  "reports",
  "budget",
  "cloudSync",
] as const;

const PREMIUM_FEATURES = [
  "unlimitedExpenses",
  "ocrUnlimited",
  "dashboard",
  "reports",
  "budget",
  "cloudSync",
  "aiInsights",
  "unlimitedExport",
  "unlimitedBackup",
  "smartCategories",
  "advancedAnalytics",
  "familySharing",
  "multiDevice",
] as const;

export default function Premium() {
  const { t, language } = usePreferences();
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({ title: t.common.premium, description: language === "th" ? "เร็วๆ นี้!" : "Coming soon!" });
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t.premium.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.premium.subtitle}</p>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary via-blue-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-6 h-6 text-yellow-300" />
            <Sparkles className="w-4 h-4 text-yellow-200" />
          </div>
          <h2 className="text-2xl font-bold mb-1">SlipWise Premium</h2>
          <p className="text-white/80 text-sm">{t.premium.subtitle}</p>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="space-y-4">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">{t.premium.freePlan}</h3>
              <p className="text-2xl font-bold mt-1">{t.common.free}</p>
            </div>
            <span className="text-xs bg-secondary text-muted-foreground px-3 py-1 rounded-full font-medium">
              {t.premium.currentPlan}
            </span>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{t.premium.features[key as keyof typeof t.premium.features]}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-card rounded-3xl p-5 shadow-xl overflow-hidden border border-primary/20"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-blue-500/5 -z-10" />
          
          <div className="flex items-center justify-between mb-4 relative">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{t.premium.premiumPlan}</h3>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                  {language === "th" ? "แนะนำ" : "Recommended"}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-bold">฿99</p>
                <span className="text-sm text-muted-foreground">{t.common.perMonth}</span>
              </div>
            </div>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>

          <ul className="space-y-2 mb-5 relative">
            {PREMIUM_FEATURES.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>{t.premium.features[key as keyof typeof t.premium.features]}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full h-12 rounded-2xl font-semibold text-base shadow-lg shadow-primary/20 bg-gradient-to-r from-blue-600 to-indigo-700 hover:scale-[1.02] transition-transform relative"
            onClick={handleUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            {t.premium.upgrade}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
