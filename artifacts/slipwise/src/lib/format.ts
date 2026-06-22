import type { Currency, CalendarEra, DateFormatType } from "@/contexts/PreferencesContext";

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

const CURRENCY_CONFIG: Record<Currency, { symbol: string; locale: string; decimals: number }> = {
  THB: { symbol: "฿", locale: "th-TH", decimals: 2 },
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  EUR: { symbol: "€", locale: "de-DE", decimals: 2 },
  GBP: { symbol: "£", locale: "en-GB", decimals: 2 },
  JPY: { symbol: "¥", locale: "ja-JP", decimals: 0 },
  SGD: { symbol: "S$", locale: "en-SG", decimals: 2 },
};

export function formatCurrency(amount: number, currency: Currency = "THB"): string {
  const { symbol, locale, decimals } = CURRENCY_CONFIG[currency];
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function getCurrencySymbol(currency: Currency = "THB"): string {
  return CURRENCY_CONFIG[currency].symbol;
}

export function getCurrencyLabel(currency: Currency): string {
  const labels: Record<Currency, string> = {
    THB: "THB — บาทไทย",
    USD: "USD — US Dollar",
    EUR: "EUR — Euro",
    GBP: "GBP — British Pound",
    JPY: "JPY — Japanese Yen",
    SGD: "SGD — Singapore Dollar",
  };
  return labels[currency];
}

// ---------------------------------------------------------------------------
// Date formatting with Buddhist Era support
// ---------------------------------------------------------------------------

const THAI_MONTHS_LONG = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
  "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
  "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function formatDate(
  date: Date | string,
  options: {
    era?: CalendarEra;
    format?: DateFormatType;
    language?: "th" | "en";
  } = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const { era = "gregorian", format = "short", language = "en" } = options;

  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear();
  const bYear = year + 543;
  const displayYear = era === "buddhist" ? bYear : year;

  if (language === "th") {
    if (format === "long") {
      return `${day} ${THAI_MONTHS_LONG[monthIndex]} ${displayYear}`;
    }
    if (format === "short") {
      return `${day} ${THAI_MONTHS_SHORT[monthIndex]} ${String(displayYear).slice(-2)}`;
    }
    // numeric
    return `${String(day).padStart(2, "0")}/${String(monthIndex + 1).padStart(2, "0")}/${displayYear}`;
  }

  // English
  const enMonthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const enMonthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (format === "long") return `${day} ${enMonthsLong[monthIndex]} ${displayYear}`;
  if (format === "short") return `${day} ${enMonthsShort[monthIndex]} ${displayYear}`;
  return `${String(day).padStart(2, "0")}/${String(monthIndex + 1).padStart(2, "0")}/${displayYear}`;
}

export function formatMonthHeader(
  date: Date,
  options: { era?: CalendarEra; language?: "th" | "en" } = {}
): string {
  const { era = "gregorian", language = "en" } = options;
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const displayYear = era === "buddhist" ? year + 543 : year;

  if (language === "th") {
    return `${THAI_MONTHS_LONG[monthIndex]} ${displayYear}`;
  }

  const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${enMonths[monthIndex]} ${displayYear}`;
}

export function formatShortDate(
  date: Date | string,
  options: { era?: CalendarEra; language?: "th" | "en" } = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { language = "en", era = "gregorian" } = options;
  const day = d.getDate();
  const monthIndex = d.getMonth();

  if (language === "th") {
    return `${day} ${THAI_MONTHS_SHORT[monthIndex]}`;
  }

  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${enMonths[monthIndex]}`;
}

// ---------------------------------------------------------------------------
// Export utilities
// ---------------------------------------------------------------------------

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h];
      const str = v == null ? "" : String(v);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM for Excel Thai support
  downloadBlob(bom + csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Thai bank OCR patterns
// ---------------------------------------------------------------------------

export interface OcrResult {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  time: string | null;
  reference: string | null;
  bank: string | null;
  sender: string | null;
  receiver: string | null;
}

const THAI_BANKS: [RegExp, string][] = [
  [/bangkok\s*bank|bbl|ธนาคารกรุงเทพ/i, "Bangkok Bank"],
  [/kasikorn|kbank|กสิกร/i, "KBank (Kasikornbank)"],
  [/scb|ไทยพาณิชย์/i, "SCB"],
  [/krungthai|ktb|กรุงไทย/i, "Krungthai"],
  [/krungsri|bay|กรุงศรี/i, "Krungsri"],
  [/ttb|tmb|ทีเอ็มบี/i, "TTB"],
  [/uob|ยูโอบี/i, "UOB Thailand"],
  [/gsb|ออมสิน/i, "Government Savings Bank"],
  [/baac|ธกส/i, "BAAC"],
  [/cimb|ซีไอเอ็มบี/i, "CIMB Thai"],
  [/lhbank|แลนด์แอนด์เฮาส์/i, "LH Bank"],
  [/kkp|เกียรตินาคิน/i, "KKP"],
  [/icbc|ไอซีบีซี/i, "ICBC Thailand"],
  [/promptpay|พร้อมเพย์/i, "PromptPay"],
];

export function parseThaiOcr(text: string): OcrResult {
  const result: OcrResult = {
    amount: null,
    merchant: null,
    date: null,
    time: null,
    reference: null,
    bank: null,
    sender: null,
    receiver: null,
  };

  // Detect bank
  for (const [pattern, name] of THAI_BANKS) {
    if (pattern.test(text)) {
      result.bank = name;
      break;
    }
  }

  // Amount — Thai slip formats: ฿1,234.56 or 1,234.56 บาท or จำนวนเงิน 1,234.56
  const amountPatterns = [
    /฿\s*([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*บาท/,
    /จำนวนเงิน[:\s]*([\d,]+\.?\d*)/,
    /amount[:\s]*฿?\s*([\d,]+\.?\d*)/i,
    /total[:\s]*฿?\s*([\d,]+\.?\d*)/i,
    /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/,
  ];
  for (const pattern of amountPatterns) {
    const m = text.match(pattern);
    if (m) {
      const cleaned = m[1].replace(/,/g, "");
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) {
        result.amount = val;
        break;
      }
    }
  }

  // Date — various formats
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,       // dd/mm/yyyy or dd-mm-yyyy
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,       // yyyy/mm/dd
    /วันที่\s*(\d{1,2})\s*([^\s]+)\s*(\d{4})/,       // Thai date
    /(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/,
  ];
  for (const pattern of datePatterns) {
    const m = text.match(pattern);
    if (m) {
      result.date = m[0];
      break;
    }
  }

  // Time
  const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) result.time = timeMatch[0];

  // Reference number
  const refPatterns = [
    /ref(?:erence)?(?:\s*no\.?)?[:\s]+(\w+)/i,
    /เลขอ้างอิง[:\s]*(\w+)/,
    /เลขที่[:\s]*(\w+)/,
    /transaction\s*id[:\s]+(\w+)/i,
  ];
  for (const pattern of refPatterns) {
    const m = text.match(pattern);
    if (m) { result.reference = m[1]; break; }
  }

  // Sender/receiver
  const senderMatch = text.match(/(?:จาก|from|ผู้โอน)[:\s]+([^\n]+)/i);
  if (senderMatch) result.sender = senderMatch[1].trim();

  const receiverMatch = text.match(/(?:ไปยัง|ถึง|to|ผู้รับ)[:\s]+([^\n]+)/i);
  if (receiverMatch) result.receiver = receiverMatch[1].trim();

  // Merchant fallback — first non-empty line
  if (!result.merchant) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 2 && !/^\d/.test(l));
    if (lines.length > 0) result.merchant = lines[0].slice(0, 50);
  }

  return result;
}
