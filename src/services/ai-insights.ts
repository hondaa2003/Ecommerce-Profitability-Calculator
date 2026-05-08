/**
 * AI Insights Engine
 * Provides smart recommendations based on product and campaign data
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  cogs: number;
  shipping: number;
  returnCost: number;
  cod: number;
  packaging: number;
  vat: number;
  profit: number;
  margin: number;
  status: 'winning' | 'breakeven' | 'losing';
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  revenue: number;
  orders: number;
  roas: number;
  cpa: number;
}

export interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'info';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionable: boolean;
  action?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  metric?: string;
  value?: number | string;
}

export class AIInsightsEngine {
  /**
   * Generate insights from products data
   */
  static analyzeProducts(products: Product[]): Insight[] {
    const insights: Insight[] = [];

    if (products.length === 0) {
      return insights;
    }

    // Calculate statistics
    const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
    const avgMargin = products.reduce((sum, p) => sum + p.margin, 0) / products.length;
    const winningProducts = products.filter((p) => p.status === 'winning');
    const losingProducts = products.filter((p) => p.status === 'losing');

    // Insight 1: Low margin products
    const lowMarginProducts = products.filter((p) => p.margin < 15);
    if (lowMarginProducts.length > 0) {
      insights.push({
        id: 'low-margin-products',
        type: 'warning',
        title: `${lowMarginProducts.length} products have low margins`,
        titleAr: `${lowMarginProducts.length} منتجات لديها هوامش منخفضة`,
        description: `Products with margins below 15% are risky. Consider increasing prices or reducing costs.`,
        descriptionAr: `المنتجات التي يقل هامشها عن 15% محفوفة بالمخاطر. فكر في زيادة الأسعار أو تقليل التكاليف.`,
        actionable: true,
        action: 'review-products',
        actionLabel: 'Review Products',
        actionLabelAr: 'مراجعة المنتجات',
        priority: 'high',
        impact: 'high',
        metric: 'Margin',
        value: '< 15%',
      });
    }

    // Insight 2: High performing products
    if (winningProducts.length > 0) {
      const topProduct = winningProducts.reduce((prev, current) =>
        current.profit > prev.profit ? current : prev
      );
      insights.push({
        id: 'top-performing-product',
        type: 'success',
        title: `Your top product: ${topProduct.name}`,
        titleAr: `أفضل منتج لديك: ${topProduct.name}`,
        description: `This product is performing well with a ${topProduct.margin.toFixed(1)}% margin. Consider increasing its marketing budget.`,
        descriptionAr: `هذا المنتج يؤدي بشكل جيد بهامش ${topProduct.margin.toFixed(1)}%. فكر في زيادة ميزانيته الإعلانية.`,
        actionable: true,
        action: 'boost-marketing',
        actionLabel: 'Boost Marketing',
        actionLabelAr: 'زيادة التسويق',
        priority: 'medium',
        impact: 'high',
        metric: 'Margin',
        value: `${topProduct.margin.toFixed(1)}%`,
      });
    }

    // Insight 3: Products to discontinue
    if (losingProducts.length > 0) {
      insights.push({
        id: 'losing-products',
        type: 'warning',
        title: `${losingProducts.length} products are losing money`,
        titleAr: `${losingProducts.length} منتجات تخسر المال`,
        description: `These products have negative or very low profit margins. Consider discontinuing or repricing them.`,
        descriptionAr: `هذه المنتجات لديها هوامش ربح سالبة أو منخفضة جداً. فكر في إيقافها أو إعادة تسعيرها.`,
        actionable: true,
        action: 'review-losing',
        actionLabel: 'Review Losing Products',
        actionLabelAr: 'مراجعة المنتجات الخاسرة',
        priority: 'high',
        impact: 'high',
      });
    }

    // Insight 4: Price optimization opportunity
    const underpriced = products.filter((p) => p.margin < avgMargin * 0.7);
    if (underpriced.length > 0) {
      insights.push({
        id: 'price-optimization',
        type: 'opportunity',
        title: `Opportunity: Increase prices on ${underpriced.length} products`,
        titleAr: `فرصة: زيادة أسعار ${underpriced.length} منتجات`,
        description: `These products are priced below your average margin. A 5-10% price increase could significantly boost profits.`,
        descriptionAr: `هذه المنتجات مسعرة أقل من متوسط هامشك. زيادة السعر بنسبة 5-10% يمكن أن تعزز الأرباح بشكل كبير.`,
        actionable: true,
        action: 'price-increase',
        actionLabel: 'Simulate Price Increase',
        actionLabelAr: 'محاكاة زيادة السعر',
        priority: 'medium',
        impact: 'high',
      });
    }

    return insights;
  }

  /**
   * Generate insights from campaigns data
   */
  static analyzeCampaigns(campaigns: Campaign[]): Insight[] {
    const insights: Insight[] = [];

    if (campaigns.length === 0) {
      return insights;
    }

    // Calculate statistics
    const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;
    const avgCpa = campaigns.reduce((sum, c) => sum + c.cpa, 0) / campaigns.length;
    const highRoasCampaigns = campaigns.filter((c) => c.roas > avgRoas * 1.2);
    const lowRoasCampaigns = campaigns.filter((c) => c.roas < avgRoas * 0.8);

    // Insight 1: High ROAS campaigns
    if (highRoasCampaigns.length > 0) {
      const topCampaign = highRoasCampaigns.reduce((prev, current) =>
        current.roas > prev.roas ? current : prev
      );
      insights.push({
        id: 'high-roas-campaign',
        type: 'success',
        title: `Top campaign: ${topCampaign.name}`,
        titleAr: `أفضل حملة: ${topCampaign.name}`,
        description: `This campaign has a ${topCampaign.roas.toFixed(2)}x ROAS. Consider increasing its budget.`,
        descriptionAr: `هذه الحملة لديها عائد ${topCampaign.roas.toFixed(2)}x. فكر في زيادة ميزانيتها.`,
        actionable: true,
        action: 'scale-campaign',
        actionLabel: 'Scale Campaign',
        actionLabelAr: 'توسيع الحملة',
        priority: 'medium',
        impact: 'high',
        metric: 'ROAS',
        value: `${topCampaign.roas.toFixed(2)}x`,
      });
    }

    // Insight 2: Low ROAS campaigns
    if (lowRoasCampaigns.length > 0) {
      insights.push({
        id: 'low-roas-campaign',
        type: 'warning',
        title: `${lowRoasCampaigns.length} campaigns have low ROAS`,
        titleAr: `${lowRoasCampaigns.length} حملات لديها عائد منخفض`,
        description: `These campaigns are underperforming. Consider pausing them or optimizing targeting.`,
        descriptionAr: `هذه الحملات تؤدي بشكل سيء. فكر في إيقافها أو تحسين استهدافها.`,
        actionable: true,
        action: 'optimize-campaign',
        actionLabel: 'Optimize Campaign',
        actionLabelAr: 'تحسين الحملة',
        priority: 'high',
        impact: 'high',
      });
    }

    // Insight 3: Budget allocation opportunity
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const underbudgeted = campaigns.filter((c) => c.roas > avgRoas && c.spend < totalSpend / campaigns.length);
    if (underbudgeted.length > 0) {
      insights.push({
        id: 'budget-reallocation',
        type: 'opportunity',
        title: `Reallocate budget to high-performing campaigns`,
        titleAr: `إعادة تخصيص الميزانية للحملات عالية الأداء`,
        description: `Move budget from low-ROAS to high-ROAS campaigns to maximize ROI.`,
        descriptionAr: `انقل الميزانية من الحملات منخفضة العائد إلى الحملات عالية العائد لتعظيم العائد.`,
        actionable: true,
        action: 'reallocate-budget',
        actionLabel: 'Reallocate Budget',
        actionLabelAr: 'إعادة تخصيص الميزانية',
        priority: 'medium',
        impact: 'high',
      });
    }

    return insights;
  }

  /**
   * Generate combined insights from all data
   */
  static generateAllInsights(products: Product[], campaigns: Campaign[]): Insight[] {
    const productInsights = this.analyzeProducts(products);
    const campaignInsights = this.analyzeCampaigns(campaigns);

    // Sort by priority and impact
    const allInsights = [...productInsights, ...campaignInsights].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const impactOrder = { high: 0, medium: 1, low: 2 };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return impactOrder[a.impact] - impactOrder[b.impact];
    });

    return allInsights;
  }
}
