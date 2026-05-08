import { Languages } from "lucide-react";
import { Button } from "./ui/button";
import { useI18n } from "./i18n";

export function LangToggle({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="text-slate-600 gap-1.5"
    >
      <Languages className="w-4 h-4" />
      {lang === "en" ? "العربية" : "English"}
    </Button>
  );
}
