import type { Lang } from "./i18n";

interface TipDef {
  title: { en: string; ar: string };
  content: { en: string; ar: string };
}

const defs: Record<string, TipDef> = {
  revenue: {
    title: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
    content: {
      en: "The total money generated from sales before any costs or fees are subtracted.",
      ar: "إجمالي الأموال الناتجة عن المبيعات قبل خصم أي تكاليف أو رسوم.",
    },
  },
  netProfit: {
    title: { en: "Net Profit", ar: "صافي الربح" },
    content: {
      en: "What you actually keep after subtracting product costs, ad spend, shipping, fees, and taxes.",
      ar: "ما تحتفظ به فعلياً بعد خصم تكاليف المنتج والإعلانات والشحن والرسوم والضرائب.",
    },
  },
  roas: {
    title: { en: "ROAS — Return On Ad Spend", ar: "ROAS — عائد الإنفاق الإعلاني" },
    content: {
      en: "Revenue generated for every dollar spent on advertising. Higher is better.",
      ar: "الإيرادات الناتجة عن كل دولار يُنفق على الإعلانات. كلما زاد كان أفضل.",
    },
  },
  maxCpp: {
    title: { en: "Max CPP — Max Cost Per Purchase", ar: "أقصى تكلفة لكل عملية شراء" },
    content: {
      en: "The highest amount you can spend on ads per order while staying profitable.",
      ar: "أعلى مبلغ يمكنك إنفاقه على الإعلانات لكل طلب مع البقاء مربحاً.",
    },
  },
  cpa: {
    title: { en: "CPA — Cost Per Acquisition", ar: "CPA — تكلفة الاستحواذ" },
    content: {
      en: "How much you actually paid in ads to get one new customer or order.",
      ar: "كم دفعت فعلياً في الإعلانات للحصول على عميل أو طلب جديد.",
    },
  },
  mer: {
    title: { en: "MER — Marketing Efficiency Ratio", ar: "MER — نسبة كفاءة التسويق" },
    content: {
      en: "Total revenue divided by total marketing spend across all channels.",
      ar: "إجمالي الإيرادات مقسوماً على إجمالي الإنفاق التسويقي عبر جميع القنوات.",
    },
  },
  orders: {
    title: { en: "Orders", ar: "الطلبات" },
    content: {
      en: "Total number of purchases placed in your store during the selected period.",
      ar: "إجمالي عدد المشتريات التي تمت في متجرك خلال الفترة المحددة.",
    },
  },
  delivered: {
    title: { en: "Delivered Rate", ar: "نسبة التوصيل" },
    content: {
      en: "Percentage of orders that were successfully delivered to customers.",
      ar: "نسبة الطلبات التي تم توصيلها بنجاح إلى العملاء.",
    },
  },
  returnRate: {
    title: { en: "Return Rate", ar: "نسبة الإرجاع" },
    content: {
      en: "Percentage of customer orders returned, refunded, or rejected.",
      ar: "نسبة طلبات العملاء التي تم إرجاعها أو ردها أو رفضها.",
    },
  },
  margin: {
    title: { en: "Margin", ar: "الهامش" },
    content: {
      en: "Your percentage profit after all costs. Margin = Profit ÷ Revenue × 100.",
      ar: "نسبة ربحك المئوية بعد كل التكاليف. الهامش = الربح ÷ الإيرادات × 100.",
    },
  },
  breakEvenRoas: {
    title: { en: "Break-even ROAS", ar: "عائد الإعلان عند نقطة التعادل" },
    content: {
      en: "The minimum ROAS required to cover your costs and avoid losses.",
      ar: "الحد الأدنى لعائد الإعلان المطلوب لتغطية تكاليفك وتجنّب الخسائر.",
    },
  },
  cogs: {
    title: { en: "COGS — Cost of Goods Sold", ar: "تكلفة البضاعة المباعة" },
    content: {
      en: "Your base product purchase cost — what you pay your supplier per unit.",
      ar: "تكلفة شراء المنتج الأساسية — ما تدفعه للمورد لكل وحدة.",
    },
  },
  shipping: {
    title: { en: "Shipping Cost", ar: "تكلفة الشحن" },
    content: {
      en: "What it costs you to deliver one order to a customer.",
      ar: "التكلفة التي تتحملها لتوصيل طلب واحد إلى العميل.",
    },
  },
  returnCost: {
    title: { en: "Return Cost", ar: "تكلفة الإرجاع" },
    content: {
      en: "Average cost incurred when an order is returned (re-shipping, lost product, fees).",
      ar: "متوسط التكلفة عند إرجاع الطلب (إعادة الشحن، فقدان المنتج، رسوم).",
    },
  },
  cod: {
    title: { en: "COD Fees", ar: "رسوم الدفع عند الاستلام" },
    content: {
      en: "Cash-on-Delivery service fees charged by your courier or payment processor.",
      ar: "رسوم خدمة الدفع عند الاستلام التي يفرضها الناقل أو معالج الدفع.",
    },
  },
  packaging: {
    title: { en: "Packaging Fees", ar: "رسوم التغليف" },
    content: {
      en: "Cost of boxes, fillers, labels, and other materials used to package an order.",
      ar: "تكلفة الصناديق والحشوات والملصقات والمواد المستخدمة لتغليف الطلب.",
    },
  },
  vat: {
    title: { en: "VAT", ar: "ضريبة القيمة المضافة" },
    content: {
      en: "Value-Added Tax. The percentage of tax that must be paid on each sale.",
      ar: "ضريبة القيمة المضافة. النسبة المئوية للضريبة المستحقة على كل عملية بيع.",
    },
  },
  sellingPrice: {
    title: { en: "Selling Price", ar: "سعر البيع" },
    content: {
      en: "The price the customer pays for your product, before VAT and discounts.",
      ar: "السعر الذي يدفعه العميل للمنتج قبل ضريبة القيمة المضافة والخصومات.",
    },
  },
  adSpend: {
    title: { en: "Ad Spend", ar: "الإنفاق الإعلاني" },
    content: {
      en: "The total amount you have spent on a paid advertising campaign.",
      ar: "إجمالي المبلغ الذي أنفقته على حملة إعلانية مدفوعة.",
    },
  },
  campaign: {
    title: { en: "Campaign", ar: "الحملة" },
    content: {
      en: "A specific ad set or marketing initiative you launch on a platform.",
      ar: "مجموعة إعلانية أو مبادرة تسويقية محددة تطلقها على منصة معينة.",
    },
  },
  sku: {
    title: { en: "SKU — Stock Keeping Unit", ar: "SKU — رمز التخزين" },
    content: {
      en: "A unique code you assign to each product to identify and track it.",
      ar: "رمز فريد تخصصه لكل منتج للتعرف عليه وتتبعه.",
    },
  },
  successRate: {
    title: { en: "Success Rate", ar: "نسبة النجاح" },
    content: {
      en: "Percentage of orders successfully delivered out of all attempted deliveries.",
      ar: "نسبة الطلبات التي تم توصيلها بنجاح من إجمالي محاولات التوصيل.",
    },
  },
  pending: {
    title: { en: "Pending Orders", ar: "الطلبات المعلّقة" },
    content: {
      en: "Orders that have been placed but are not yet delivered or fulfilled.",
      ar: "الطلبات التي تم تقديمها ولكن لم يتم توصيلها أو تنفيذها بعد.",
    },
  },
};

export type TipKey = keyof typeof defs;

export function getTip(key: TipKey, lang: Lang) {
  const d = defs[key];
  return { title: d.title[lang], content: d.content[lang] };
}

// Backwards compatible: returns english by default for any non-i18n callers
export const tips = Object.fromEntries(
  Object.entries(defs).map(([k, v]) => [k, { title: v.title.en, content: v.content.en }])
) as Record<TipKey, { title: string; content: string }>;
