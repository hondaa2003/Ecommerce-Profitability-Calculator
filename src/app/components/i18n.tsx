import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const dict: Dict = {
  // Brand & nav
  "brand.tagline": { en: "GCC · MENA", ar: "الخليج · الشرق الأوسط" },
  "nav.features": { en: "Features", ar: "المزايا" },
  "nav.calculator": { en: "Calculator", ar: "الحاسبة" },
  "nav.pricing": { en: "Pricing", ar: "الأسعار" },
  "nav.faq": { en: "FAQ", ar: "الأسئلة الشائعة" },
  "nav.signin": { en: "Sign In", ar: "تسجيل الدخول" },

  // CTA
  "cta.startTrial": { en: "Start Free Trial", ar: "ابدأ التجربة المجانية" },
  "cta.bookDemo": { en: "Book Demo", ar: "احجز عرضاً تجريبياً" },
  "cta.upgrade": { en: "Upgrade", ar: "ترقية" },
  "cta.contactSales": { en: "Contact Sales", ar: "تواصل مع المبيعات" },

  // Landing
  "hero.badge": { en: "Built for GCC & MENA Sellers", ar: "مصمم لتجار الخليج والشرق الأوسط" },
  "hero.title": { en: "Know Your Real Profit Before Scaling Your Store", ar: "اعرف ربحك الحقيقي قبل توسيع متجرك" },
  "hero.sub": {
    en: "Track product profitability, ad performance, and true margins in one powerful dashboard built for ecommerce store owners, dropshippers, and media buyers.",
    ar: "تتبّع ربحية المنتجات وأداء الإعلانات والهوامش الحقيقية في لوحة تحكم واحدة قوية مصممة لأصحاب المتاجر والدروبشيبر ومسوقي الأداء.",
  },
  "hero.noCard": { en: "No credit card", ar: "بدون بطاقة ائتمان" },
  "hero.bilingual": { en: "Arabic & English", ar: "عربي وإنجليزي" },
  "hero.trial": { en: "14-day free trial", ar: "تجربة مجانية 14 يوماً" },

  "features.badge": { en: "Features", ar: "المزايا" },
  "features.title": { en: "Everything you need to find your real margin", ar: "كل ما تحتاجه لمعرفة هامشك الحقيقي" },
  "features.sub": {
    en: "From manual entries to API-powered automation — built around the metrics that actually move profit.",
    ar: "من الإدخال اليدوي إلى الأتمتة عبر الواجهات البرمجية — مبني حول المؤشرات التي تؤثر فعلياً على الربح.",
  },

  "calc.badge": { en: "Profit Calculator", ar: "حاسبة الربح" },
  "calc.title": { en: "See profit per order before you scale", ar: "اعرف الربح لكل طلب قبل التوسع" },
  "calc.sub": {
    en: "Plug in your selling price, product cost, ad spend, and fees. We compute your true profit, margin, and Break-even ROAS — instantly.",
    ar: "أدخل سعر البيع، تكلفة المنتج، الإنفاق الإعلاني والرسوم. نحسب ربحك الحقيقي، الهامش، ونقطة التعادل لعائد الإعلان — فوراً.",
  },
  "calc.profitOrder": { en: "Profit / Order", ar: "الربح لكل طلب" },

  "testimonials.badge": { en: "Loved by sellers", ar: "محبوب من التجار" },
  "testimonials.title": { en: "What our users say", ar: "ماذا يقول عملاؤنا" },

  "pricing.badge": { en: "Pricing", ar: "الأسعار" },
  "pricing.title": { en: "Simple, transparent plans", ar: "خطط بسيطة وشفافة" },
  "pricing.sub": { en: "Start free. Upgrade when your store grows.", ar: "ابدأ مجاناً. ترقّى عندما ينمو متجرك." },
  "pricing.popular": { en: "Most Popular", ar: "الأكثر شعبية" },
  "pricing.month": { en: "/mo", ar: "/شهرياً" },

  "faq.badge": { en: "FAQ", ar: "الأسئلة الشائعة" },
  "faq.title": { en: "Common questions", ar: "أسئلة شائعة" },

  "ctaFinal.title": { en: "Stop scaling blind. Start scaling profitably.", ar: "توقف عن التوسع بدون رؤية. ابدأ التوسع بربحية." },
  "ctaFinal.sub": {
    en: "Join hundreds of GCC sellers tracking real profit, not just revenue.",
    ar: "انضم لمئات التجار في الخليج الذين يتتبعون الربح الحقيقي، وليس الإيرادات فقط.",
  },

  // App shell
  "app.search": { en: "Search products, campaigns, orders…", ar: "ابحث عن المنتجات، الحملات، الطلبات…" },
  "app.workspace": { en: "Workspace", ar: "مساحة العمل" },
  "app.account": { en: "Account", ar: "الحساب" },
  "app.trial": { en: "Pro Trial · 9 days left", ar: "تجربة Pro · 9 أيام متبقية" },
  "app.trialDesc": { en: "Unlock campaign tracking and reports.", ar: "افتح تتبّع الحملات والتقارير." },

  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.products": { en: "Products", ar: "المنتجات" },
  "nav.campaigns": { en: "Campaigns", ar: "الحملات" },
  "nav.orders": { en: "Orders", ar: "الطلبات" },
  "nav.reports": { en: "Reports", ar: "التقارير" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },
  "nav.future": { en: "Coming Soon", ar: "قريباً" },
  "nav.new": { en: "New", ar: "جديد" },

  // Dashboard
  "dash.welcome": { en: "Welcome back, Ahmed 👋", ar: "مرحباً بعودتك، أحمد 👋" },
  "dash.weekSummary": { en: "Here's how your store performed this week.", ar: "إليك أداء متجرك هذا الأسبوع." },
  "dash.last7": { en: "Last 7 days", ar: "آخر 7 أيام" },
  "dash.addOrder": { en: "+ Add Order", ar: "+ إضافة طلب" },
  "dash.revenueProfit": { en: "Revenue & Profit Trend", ar: "اتجاه الإيرادات والأرباح" },
  "dash.spendVsProfit": { en: "Spend vs Profit", ar: "الإنفاق مقابل الربح" },
  "dash.topWinning": { en: "Top Winning Products", ar: "أفضل المنتجات الرابحة" },
  "dash.byProfit": { en: "Sorted by net profit", ar: "مرتبة حسب صافي الربح" },
  "dash.viewAll": { en: "View all", ar: "عرض الكل" },
  "dash.losing": { en: "Losing Products Alerts", ar: "تنبيهات المنتجات الخاسرة" },
  "dash.actionRec": { en: "Action recommended", ar: "يُنصح باتخاذ إجراء" },
  "dash.activity": { en: "Recent Activity", ar: "النشاط الأخير" },
  "dash.notifications": { en: "Notifications", ar: "الإشعارات" },

  // KPI labels
  "kpi.revenue": { en: "Total Revenue", ar: "إجمالي الإيرادات" },
  "kpi.netProfit": { en: "Net Profit", ar: "صافي الربح" },
  "kpi.roas": { en: "ROAS", ar: "عائد الإعلان" },
  "kpi.maxCpp": { en: "Max CPP", ar: "أقصى تكلفة لكل عملية شراء" },
  "kpi.orders": { en: "Orders", ar: "الطلبات" },
  "kpi.delivered": { en: "Delivered Rate", ar: "نسبة التوصيل" },
  "kpi.returnRate": { en: "Return Rate", ar: "نسبة الإرجاع" },
  "kpi.margin": { en: "Margin", ar: "الهامش" },
  "kpi.breakEven": { en: "Break-even ROAS", ar: "نقطة تعادل عائد الإعلان" },
  "kpi.spend": { en: "Spend", ar: "الإنفاق" },
  "kpi.totalSpend": { en: "Total Spend", ar: "إجمالي الإنفاق" },
  "kpi.cpa": { en: "CPA", ar: "تكلفة الاستحواذ" },
  "kpi.mer": { en: "MER", ar: "كفاءة التسويق" },
  "kpi.profit": { en: "Profit", ar: "الربح" },
  "kpi.successRate": { en: "Success Rate", ar: "نسبة النجاح" },

  // Status
  "status.winning": { en: "Winning", ar: "رابح" },
  "status.breakeven": { en: "Break-even", ar: "تعادل" },
  "status.losing": { en: "Losing", ar: "خاسر" },
  "status.delivered": { en: "Delivered", ar: "تم التوصيل" },
  "status.returned": { en: "Returned", ar: "مرتجع" },
  "status.pending": { en: "Pending", ar: "معلّق" },
  "status.healthy": { en: "Healthy", ar: "صحي" },
  "status.profitable": { en: "Profitable", ar: "مربح" },
  "status.soon": { en: "Soon", ar: "قريباً" },

  // Products
  "products.title": { en: "Products", ar: "المنتجات" },
  "products.sub": { en: "Manage your catalog and auto-calculate profitability per product.", ar: "أدر كتالوجك واحسب ربحية كل منتج تلقائياً." },
  "products.add": { en: "Add Product", ar: "إضافة منتج" },
  "products.addNew": { en: "Add New Product", ar: "إضافة منتج جديد" },
  "products.name": { en: "Product Name", ar: "اسم المنتج" },
  "products.url": { en: "Product URL", ar: "رابط المنتج" },
  "products.image": { en: "Product Image", ar: "صورة المنتج" },
  "products.uploadHint": { en: "Upload or paste URL", ar: "ارفع الصورة أو الصق الرابط" },
  "products.sellingPrice": { en: "Selling Price", ar: "سعر البيع" },
  "products.cogs": { en: "COGS", ar: "تكلفة البضاعة المباعة" },
  "products.shipping": { en: "Shipping Cost", ar: "تكلفة الشحن" },
  "products.returnCost": { en: "Return Cost", ar: "تكلفة الإرجاع" },
  "products.cod": { en: "COD Fees", ar: "رسوم الدفع عند الاستلام" },
  "products.packaging": { en: "Packaging Fees", ar: "رسوم التغليف" },
  "products.vat": { en: "VAT", ar: "ضريبة القيمة المضافة" },
  "products.autoCalc": { en: "Auto Profit Calculator", ar: "حاسبة الربح التلقائية" },
  "products.totalCost": { en: "Total Cost", ar: "إجمالي التكلفة" },
  "products.save": { en: "Save Product", ar: "حفظ المنتج" },
  "products.cancel": { en: "Cancel", ar: "إلغاء" },
  "products.product": { en: "Product", ar: "المنتج" },
  "products.sku": { en: "SKU", ar: "رمز التخزين" },
  "products.price": { en: "Price", ar: "السعر" },
  "products.beRoas": { en: "B/E ROAS", ar: "عائد التعادل" },
  "products.actions": { en: "Actions", ar: "إجراءات" },
  "products.statusCol": { en: "Status", ar: "الحالة" },

  // Campaigns
  "camp.title": { en: "Campaign Tracking", ar: "تتبّع الحملات" },
  "camp.sub": { en: "Log ad spend manually today, connect APIs tomorrow.", ar: "سجّل الإنفاق الإعلاني يدوياً اليوم، واربط الواجهات البرمجية لاحقاً." },
  "camp.manual": { en: "Manual Ad Spend Entry", ar: "إدخال يدوي للإنفاق الإعلاني" },
  "camp.manualDesc": { en: "Add a campaign and its results.", ar: "أضف حملة ونتائجها." },
  "camp.name": { en: "Campaign Name", ar: "اسم الحملة" },
  "camp.platform": { en: "Platform", ar: "المنصة" },
  "camp.add": { en: "Add Campaign", ar: "إضافة حملة" },
  "camp.daily": { en: "Daily Performance", ar: "الأداء اليومي" },
  "camp.apiTitle": { en: "API Integrations", ar: "تكاملات الواجهات البرمجية" },
  "camp.apiDesc": { en: "Connect your ad accounts (coming soon).", ar: "اربط حساباتك الإعلانية (قريباً)." },
  "camp.autoSync": { en: "Auto-sync spend & ROAS", ar: "مزامنة الإنفاق وعائد الإعلان تلقائياً" },
  "camp.all": { en: "All Campaigns", ar: "جميع الحملات" },
  "camp.campaign": { en: "Campaign", ar: "الحملة" },

  // Orders
  "orders.title": { en: "Orders & Fulfillment", ar: "الطلبات والتنفيذ" },
  "orders.sub": { en: "Track delivery success, returns, and overall fulfillment health.", ar: "تتبّع نجاح التوصيل والإرجاع وصحة التنفيذ العامة." },
  "orders.totalOrders": { en: "Total Orders", ar: "إجمالي الطلبات" },
  "orders.manual": { en: "Manual Order Entry", ar: "إدخال يدوي للطلبات" },
  "orders.manualDesc": { en: "Add orders not yet synced from your store.", ar: "أضف الطلبات التي لم تُزامن بعد من متجرك." },
  "orders.customer": { en: "Customer", ar: "العميل" },
  "orders.amount": { en: "Amount", ar: "المبلغ" },
  "orders.date": { en: "Date", ar: "التاريخ" },
  "orders.add": { en: "Add Order", ar: "إضافة طلب" },
  "orders.id": { en: "Order ID", ar: "رقم الطلب" },
  "orders.storeIntegrations": { en: "Store Integrations", ar: "تكاملات المتاجر" },
  "orders.comingSoon": { en: "Coming soon", ar: "قريباً" },

  // Reports
  "reports.title": { en: "Reports", ar: "التقارير" },
  "reports.sub": { en: "Profitability summaries across products, campaigns, and time.", ar: "ملخصات الربحية عبر المنتجات والحملات والوقت." },
  "reports.daily": { en: "Daily", ar: "يومي" },
  "reports.weekly": { en: "Weekly", ar: "أسبوعي" },
  "reports.monthly": { en: "Monthly", ar: "شهري" },
  "reports.export": { en: "Export", ar: "تصدير" },
  "reports.profitSummary": { en: "Profit Summary", ar: "ملخص الربح" },
  "reports.profitSummaryDesc": { en: "Comparing revenue vs net profit", ar: "مقارنة الإيرادات بصافي الربح" },
  "reports.productProfit": { en: "Product Profitability", ar: "ربحية المنتجات" },
  "reports.campPerf": { en: "Campaign Performance", ar: "أداء الحملات" },

  // Settings
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.sub": { en: "Manage your store, team, integrations, and billing.", ar: "أدر متجرك وفريقك وتكاملاتك وفواتيرك." },
  "settings.store": { en: "Store", ar: "المتجر" },
  "settings.team": { en: "Team", ar: "الفريق" },
  "settings.integrations": { en: "Integrations", ar: "التكاملات" },
  "settings.billing": { en: "Billing", ar: "الفوترة" },
  "settings.storeInfo": { en: "Store Information", ar: "معلومات المتجر" },
  "settings.storeName": { en: "Store Name", ar: "اسم المتجر" },
  "settings.storeUrl": { en: "Store URL", ar: "رابط المتجر" },
  "settings.currency": { en: "Currency", ar: "العملة" },
  "settings.defaults": { en: "Default Costs", ar: "التكاليف الافتراضية" },
  "settings.applyDefaults": { en: "Apply defaults to new products", ar: "تطبيق الافتراضات على المنتجات الجديدة" },
  "settings.applyDefaultsDesc": { en: "Products will be pre-filled with these values.", ar: "ستُملأ المنتجات بهذه القيم تلقائياً." },
  "settings.teamMembers": { en: "Team Members", ar: "أعضاء الفريق" },
  "settings.invite": { en: "Invite", ar: "دعوة" },
  "settings.storeApis": { en: "Store APIs", ar: "واجهات المتاجر" },
  "settings.storeApisDesc": { en: "Connect your storefront for automatic order sync.", ar: "اربط متجرك لمزامنة الطلبات تلقائياً." },
  "settings.adApis": { en: "Ad Platform APIs", ar: "واجهات منصات الإعلانات" },
  "settings.adApisDesc": { en: "Pull spend, ROAS, and campaign data automatically.", ar: "اسحب الإنفاق وعائد الإعلان وبيانات الحملات تلقائياً." },
  "settings.subscription": { en: "Subscription", ar: "الاشتراك" },
  "settings.subDesc": { en: "You are on the Pro plan trial.", ar: "أنت في تجربة خطة Pro." },
  "settings.connect": { en: "Connect", ar: "اتصال" },
  "settings.availableSoon": { en: "Available soon", ar: "متاح قريباً" },
  "settings.manage": { en: "Manage", ar: "إدارة" },
  "settings.downgrade": { en: "Downgrade", ar: "تخفيض" },

  // Future
  "future.title": { en: "Coming Soon", ar: "قريباً" },
  "future.sub": { en: "A peek at what we're building next. Vote and join the beta.", ar: "نظرة على ما نبنيه قادماً. صوّت وانضم للنسخة التجريبية." },
  "future.waitlist": { en: "Join Beta Waitlist", ar: "انضم لقائمة الانتظار" },

  // Storefront
  "store.title": { en: "ProfitPilot Store", ar: "متجر بروفت بايلوت" },
  "store.tagline": { en: "Smart gadgets & lifestyle, delivered across the GCC.", ar: "أجهزة ذكية ومنتجات أسلوب حياة، توصيل لكل دول الخليج." },
  "store.shop": { en: "Shop", ar: "تسوق" },
  "store.cart": { en: "Cart", ar: "السلة" },
  "store.signin": { en: "Sign In", ar: "تسجيل الدخول" },
  "store.signup": { en: "Create Account", ar: "إنشاء حساب" },
  "store.signout": { en: "Sign Out", ar: "تسجيل الخروج" },
  "store.email": { en: "Email", ar: "البريد الإلكتروني" },
  "store.password": { en: "Password", ar: "كلمة المرور" },
  "store.fullName": { en: "Full Name", ar: "الاسم الكامل" },
  "store.welcome": { en: "Welcome back", ar: "مرحباً بعودتك" },
  "store.welcomeSub": { en: "Sign in to track your orders.", ar: "سجّل الدخول لمتابعة طلباتك." },
  "store.joinTitle": { en: "Join ProfitPilot", ar: "انضم لبروفت بايلوت" },
  "store.joinSub": { en: "Create an account in seconds.", ar: "أنشئ حساباً في ثوانٍ." },
  "store.haveAccount": { en: "Already have an account?", ar: "عندك حساب بالفعل؟" },
  "store.noAccount": { en: "New here?", ar: "أول مرة هنا؟" },
  "store.addToCart": { en: "Add to Cart", ar: "أضف للسلة" },
  "store.added": { en: "Added", ar: "تمت الإضافة" },
  "store.empty": { en: "Your cart is empty", ar: "سلتك فارغة" },
  "store.startShopping": { en: "Start Shopping", ar: "ابدأ التسوق" },
  "store.subtotal": { en: "Subtotal", ar: "المجموع" },
  "store.checkout": { en: "Checkout", ar: "إتمام الشراء" },
  "store.placeOrder": { en: "Place Order", ar: "تأكيد الطلب" },
  "store.orderPlaced": { en: "Order placed successfully!", ar: "تم تأكيد طلبك بنجاح!" },
  "store.signinFirst": { en: "Sign in to checkout", ar: "سجّل الدخول لإتمام الشراء" },
  "store.qty": { en: "Qty", ar: "الكمية" },
  "store.remove": { en: "Remove", ar: "حذف" },
  "store.featured": { en: "Featured Products", ar: "منتجات مميزة" },
  "store.featuredSub": { en: "Hand-picked by our team.", ar: "اختارها فريقنا بعناية." },
  "store.heroTitle": { en: "Shop smarter. Live better.", ar: "تسوّق بذكاء. عِش أفضل." },
  "store.heroSub": { en: "Free shipping across the GCC. Cash on delivery available.", ar: "شحن مجاني لكل دول الخليج. الدفع عند الاستلام متاح." },
  "store.shopNow": { en: "Shop Now", ar: "تسوق الآن" },
  "store.sellerLogin": { en: "Seller Dashboard", ar: "لوحة البائع" },
  "store.customerLogin": { en: "Storefront", ar: "المتجر" },
  "store.address": { en: "Delivery Address", ar: "عنوان التوصيل" },
  "store.phone": { en: "Phone", ar: "رقم الجوال" },
  "store.payCod": { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  "store.continue": { en: "Continue", ar: "متابعة" },
  "store.back": { en: "Back", ar: "رجوع" },
  "store.hi": { en: "Hi", ar: "أهلاً" },
  "store.myOrders": { en: "My Orders", ar: "طلباتي" },
  "store.noOrders": { en: "No orders yet.", ar: "لا توجد طلبات بعد." },
  "store.orderNum": { en: "Order", ar: "طلب رقم" },
  "store.status": { en: "Status", ar: "الحالة" },
  "store.total": { en: "Total", ar: "الإجمالي" },

  // Common
  "common.profitable": { en: "Profitable", ar: "مربح" },
  "common.thisWeek": { en: "this week", ar: "هذا الأسبوع" },
  "common.weeklyTrend": { en: "Weekly Profit Trend", ar: "اتجاه الربح الأسبوعي" },
  "common.trustedBy": { en: "Trusted by sellers using", ar: "موثوق به من تجار يستخدمون" },

  // Empty states
  "empty.noProducts": { en: "No products yet", ar: "لا توجد منتجات بعد" },
  "empty.noProductsSub": { en: "Click \"Add Product\" to start tracking profitability", ar: "اضغط \"إضافة منتج\" لبدء تتبع الربحية" },
  "empty.noCampaigns": { en: "No campaigns yet", ar: "لا توجد حملات بعد" },
  "empty.noCampaignsSub": { en: "Add your first campaign above to track ROAS", ar: "أضف حملتك الأولى أعلاه لتتبع عائد الإعلان" },
  "empty.noOrders": { en: "No orders yet", ar: "لا توجد طلبات بعد" },
  "empty.noOrdersSub": { en: "Start adding orders to track fulfillment", ar: "ابدأ بإضافة الطلبات لتتبع التنفيذ" },
  "empty.loading": { en: "Loading", ar: "جاري التحميل" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<Ctx>({
  lang: "ar",
  setLang: () => {},
  t: (k) => k,
  dir: "rtl",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Lang | null;
      if (stored === "en" || stored === "ar") return stored;
    }
    return "ar";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", l);
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang];
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
