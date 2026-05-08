import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useI18n } from "./i18n";
import { customerApi } from "./api";
import { getSupabase } from "./supabase-client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  onAuthed: () => void;
  onBack: () => void;
}

export function Auth({ onAuthed, onBack }: Props) {
  const { t, dir } = useI18n();
  const supabase = getSupabase();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 6) {
      toast.error("كلمة المرور لازم تكون 6 أحرف على الأقل");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        // Server endpoint creates the user with email auto-confirmed
        await customerApi.signup(email, password, name);
        toast.success("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      toast.success(`${t("store.hi")} ${data.user?.user_metadata?.name || ""}`);
      onAuthed();
    } catch (err: any) {
      console.error("Auth failed:", err);
      const msg = String(err?.message || "");

      if (/rate limit|after \d+ seconds/i.test(msg)) {
        toast.error("استنى دقيقة قبل محاولة جديدة (تجاوزت حد المحاولات).");
      } else if (/email not confirmed/i.test(msg)) {
        toast.error("الإيميل محتاج تأكيد. لو المشكلة مستمرة، جرّب إيميل تاني.");
      } else if (/already been registered/i.test(msg)) {
        toast.error("الإيميل ده مسجل من قبل. استخدم تسجيل الدخول بدلاً من إنشاء حساب جديد.");
      } else if (/Invalid login credentials/i.test(msg)) {
        toast.error("بيانات الدخول غير صحيحة. تأكد من الإيميل وكلمة المرور.");
      } else {
        toast.error(msg || (mode === "signup" ? "تعذر إنشاء الحساب" : "بيانات الدخول غير صحيحة"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 rounded-2xl border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-900">ProfitPilot</div>
            <div className="text-xs text-slate-500">{t("brand.tagline")}</div>
          </div>
        </div>

        <h1 className="text-slate-900 mb-1" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          {mode === "signup" ? t("store.joinTitle") : t("store.welcome")}
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          {mode === "signup" ? t("store.joinSub") : t("store.welcomeSub")}
        </p>

        <div className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label className="mb-1">{t("store.fullName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="أحمد محمد" />
            </div>
          )}
          <div>
            <Label className="mb-1">{t("store.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label className="mb-1">{t("store.password")}</Label>
            <Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <div className="text-xs text-slate-400 mt-1">6 أحرف على الأقل</div>
          </div>
        </div>

        <Button
          disabled={busy || !email || !password || (mode === "signup" && !name)}
          onClick={submit}
          className="w-full bg-blue-700 hover:bg-blue-800 mt-5"
        >
          {busy && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
          {mode === "signup" ? t("store.signup") : t("store.signin")}
        </Button>

        <div className="text-center text-sm text-slate-500 mt-4">
          {mode === "signup" ? t("store.haveAccount") : t("store.noAccount")}{" "}
          <button className="text-blue-700" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? t("store.signin") : t("store.signup")}
          </button>
        </div>
        <div className="text-center mt-2">
          <button className="text-xs text-slate-400 hover:text-slate-600" onClick={onBack}>
            {t("store.back")}
          </button>
        </div>
      </Card>
    </div>
  );
}
