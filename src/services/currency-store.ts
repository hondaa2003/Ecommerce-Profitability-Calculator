// Shared currency store - persists to localStorage
// Used by Settings page to save and all other pages to read

export type CurrencyCode = "AED" | "SAR" | "KWD" | "EGP" | "USD" | "EUR" | "GBP" | "QAR" | "OMR" | "BHD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar" },
  { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const STORAGE_KEY = "selected_currency";

export function getCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "AED";
  const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
  const valid = CURRENCIES.some(c => c.code === stored);
  return valid ? stored! : "AED";
}

export function setCurrency(code: CurrencyCode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
}

export function getCurrencyInfo(): CurrencyInfo {
  const code = getCurrency();
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(amount: number): string {
  const info = getCurrencyInfo();
  return `${info.code} ${amount.toLocaleString()}`;
}

export function formatCurrencyDecimal(amount: number): string {
  const info = getCurrencyInfo();
  return `${info.code} ${amount.toFixed(2)}`;
}