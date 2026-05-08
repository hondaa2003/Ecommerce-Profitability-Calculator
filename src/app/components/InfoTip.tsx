import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useI18n } from "./i18n";
import { getTip, TipKey } from "./glossary";

interface InfoTipProps {
  // New API: pass a tip key and we look up the localized text.
  tipKey?: TipKey;
  // Legacy API: pass explicit title/content.
  title?: string;
  content?: string;
  className?: string;
}

export function InfoTip({ tipKey, title, content, className = "" }: InfoTipProps) {
  const { lang } = useI18n();
  let _title = title;
  let _content = content;
  if (tipKey) {
    const t = getTip(tipKey, lang);
    _title = t.title;
    _content = t.content;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More info"
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="max-w-xs text-sm leading-relaxed border border-slate-200 shadow-lg bg-white rounded-xl p-3"
      >
        {_title && <div className="text-blue-700 mb-1">{_title}</div>}
        {_content && <p className="text-slate-600 m-0">{_content}</p>}
      </PopoverContent>
    </Popover>
  );
}
