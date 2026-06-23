import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine, Camera, ImageIcon, CheckCircle2, AlertCircle,
  ArrowRight, RefreshCw, Lightbulb, Banknote, Store,
  CalendarDays, Hash, User, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/contexts/PreferencesContext";
import { parseThaiOcr } from "@/lib/format";
import { useLocation } from "wouter";
import Tesseract from "tesseract.js";

type ScanState = "idle" | "scanning" | "done" | "error";

interface ScanResult {
  amount?: number;
  merchant?: string;
  date?: string;
  time?: string;
  bank?: string;
  reference?: string;
  sender?: string;
  receiver?: string;
}

export default function Scanner() {
  const { t } = usePreferences();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setState("scanning");
    setProgress(0);
    setResult(null);

    try {
      const { data } = await Tesseract.recognize(file, "tha+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });

      const parsed = parseThaiOcr(data.text);
      setResult({
        amount: parsed.amount ?? undefined,
        merchant: parsed.merchant ?? undefined,
        date: parsed.date ?? undefined,
        time: parsed.time ?? undefined,
        bank: parsed.bank ?? undefined,
        reference: parsed.reference ?? undefined,
        sender: parsed.sender ?? undefined,
        receiver: parsed.receiver ?? undefined,
      });
      setState("done");
    } catch {
      setState("error");
    }

    // reset file input so user can pick same file again
    e.target.value = "";
  }

  function handleReset() {
    setState("idle");
    setImageUrl(null);
    setResult(null);
    setProgress(0);
  }

  function handleAddAsExpense() {
    if (!result) return;
    sessionStorage.setItem(
      "scanner_prefill",
      JSON.stringify({
        amount: result.amount,
        merchant: result.merchant,
        date: result.date,
        note: [
          result.bank && `${t.scanner.bank}: ${result.bank}`,
          result.reference && `${t.scanner.reference}: ${result.reference}`,
          result.sender && `${t.scanner.sender}: ${result.sender}`,
          result.receiver && `${t.scanner.receiver}: ${result.receiver}`,
        ]
          .filter(Boolean)
          .join(" | "),
      })
    );
    setLocation("/expenses/new");
  }

  const hasData = result && (result.amount || result.merchant || result.bank);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">{t.scanner.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.scanner.tapToSelect} · {t.scanner.orTakePhoto}
        </p>
      </header>

      {/* Image area */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] bg-card border-2 border-dashed border-border/60 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
              <ScanLine className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{t.scanner.tapToSelect}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.scanner.orTakePhoto}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-secondary rounded-2xl px-4 py-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Gallery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary rounded-2xl px-4 py-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Camera</span>
              </div>
            </div>
          </motion.button>
        )}

        {(state === "scanning" || state === "done" || state === "error") && imageUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black"
          >
            <img
              src={imageUrl}
              alt="receipt"
              className="w-full h-full object-contain"
            />
            {state === "scanning" && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <ScanLine className="w-12 h-12 text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
                </div>
                <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white text-sm font-medium">{t.scanner.scanning} {progress}%</p>
              </div>
            )}
            {state === "done" && (
              <div className="absolute top-3 right-3">
                <div className="bg-green-500 rounded-full p-1.5 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            {state === "error" && (
              <div className="absolute top-3 right-3">
                <div className="bg-destructive rounded-full p-1.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {state === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {hasData ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="font-bold text-lg">{t.scanner.scanComplete}</h2>
                </div>

                <div className="bg-card border border-border/50 rounded-3xl divide-y divide-border/50 overflow-hidden shadow-sm">
                  {result?.amount && (
                    <ResultRow
                      icon={<Banknote className="w-4 h-4 text-green-500" />}
                      label={t.scanner.amount}
                      value={`฿${result.amount.toLocaleString()}`}
                      highlight
                    />
                  )}
                  {result?.merchant && (
                    <ResultRow
                      icon={<Store className="w-4 h-4 text-blue-500" />}
                      label={t.scanner.merchant}
                      value={result.merchant}
                    />
                  )}
                  {result?.date && (
                    <ResultRow
                      icon={<CalendarDays className="w-4 h-4 text-purple-500" />}
                      label={t.scanner.date}
                      value={result.date + (result.time ? ` ${result.time}` : "")}
                    />
                  )}
                  {result?.bank && (
                    <ResultRow
                      icon={<Building2 className="w-4 h-4 text-orange-500" />}
                      label={t.scanner.bank}
                      value={result.bank}
                    />
                  )}
                  {result?.sender && (
                    <ResultRow
                      icon={<User className="w-4 h-4 text-muted-foreground" />}
                      label={t.scanner.sender}
                      value={result.sender}
                    />
                  )}
                  {result?.receiver && (
                    <ResultRow
                      icon={<User className="w-4 h-4 text-muted-foreground" />}
                      label={t.scanner.receiver}
                      value={result.receiver}
                    />
                  )}
                  {result?.reference && (
                    <ResultRow
                      icon={<Hash className="w-4 h-4 text-muted-foreground" />}
                      label={t.scanner.reference}
                      value={result.reference}
                    />
                  )}
                </div>

                <Button
                  className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 gap-2"
                  onClick={handleAddAsExpense}
                >
                  {t.scanner.addAsExpense}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="bg-card border border-border/50 rounded-3xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto" />
                <p className="font-semibold">{t.scanner.nothingDetected}</p>
                <p className="text-sm text-muted-foreground">{t.scanner.tip1}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl gap-2"
              onClick={handleReset}
            >
              <RefreshCw className="w-4 h-4" />
              {t.scanner.scanAnother}
            </Button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="font-semibold text-destructive">{t.common.error}</p>
            </div>
            <Button variant="outline" className="w-full h-12 rounded-2xl gap-2" onClick={handleReset}>
              <RefreshCw className="w-4 h-4" />
              {t.scanner.tryAgain}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips — show only on idle */}
      {state === "idle" && (
        <div className="bg-secondary/50 rounded-3xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">{t.scanner.tips}</span>
          </div>
          <ul className="space-y-1.5">
            {[t.scanner.tip1, t.scanner.tip2, t.scanner.tip3].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function ResultRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-semibold truncate ${highlight ? "text-lg text-primary" : "text-sm"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
