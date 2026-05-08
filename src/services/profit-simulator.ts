/**
 * Profit Simulator
 * Allows users to simulate "what-if" scenarios and see impact on profitability
 */

export interface SimulationScenario {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  variables: SimulationVariable[];
  results: SimulationResults;
}

export interface SimulationVariable {
  key: string;
  label: string;
  labelAr: string;
  type: 'percentage' | 'absolute' | 'multiplier';
  currentValue: number;
  newValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface SimulationResults {
  originalProfit: number;
  newProfit: number;
  profitChange: number;
  profitChangePercentage: number;
  originalMargin: number;
  newMargin: number;
  marginChange: number;
  breakEvenPrice?: number;
  recommendation: string;
  recommendationAr: string;
}

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
}

export interface Campaign {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  orders: number;
}

export class ProfitSimulator {
  /**
   * Calculate profit for a product
   */
  static calculateProductProfit(product: Product): number {
    return product.price - (product.cogs + product.shipping + product.returnCost + product.cod + product.packaging + product.vat);
  }

  /**
   * Calculate margin for a product
   */
  static calculateProductMargin(product: Product): number {
    const profit = this.calculateProductProfit(product);
    return (profit / product.price) * 100;
  }

  /**
   * Simulate price change
   */
  static simulatePriceChange(product: Product, priceChangePercentage: number): SimulationResults {
    const originalProfit = this.calculateProductProfit(product);
    const originalMargin = this.calculateProductMargin(product);

    const newPrice = product.price * (1 + priceChangePercentage / 100);
    const newProduct = { ...product, price: newPrice };
    const newProfit = this.calculateProductProfit(newProduct);
    const newMargin = this.calculateProductMargin(newProduct);

    const profitChange = newProfit - originalProfit;
    const profitChangePercentage = (profitChange / Math.abs(originalProfit)) * 100;

    let recommendation = '';
    let recommendationAr = '';

    if (priceChangePercentage > 0) {
      recommendation = `Increasing price by ${priceChangePercentage.toFixed(1)}% would increase profit by ${profitChange.toFixed(2)} per unit.`;
      recommendationAr = `زيادة السعر بنسبة ${priceChangePercentage.toFixed(1)}% ستزيد الربح بمقدار ${profitChange.toFixed(2)} لكل وحدة.`;
    } else {
      recommendation = `Decreasing price by ${Math.abs(priceChangePercentage).toFixed(1)}% would decrease profit by ${Math.abs(profitChange).toFixed(2)} per unit.`;
      recommendationAr = `خفض السعر بنسبة ${Math.abs(priceChangePercentage).toFixed(1)}% سيقلل الربح بمقدار ${Math.abs(profitChange).toFixed(2)} لكل وحدة.`;
    }

    return {
      originalProfit,
      newProfit,
      profitChange,
      profitChangePercentage,
      originalMargin,
      newMargin,
      marginChange: newMargin - originalMargin,
      breakEvenPrice: product.cogs + product.shipping + product.returnCost + product.cod + product.packaging + product.vat,
      recommendation,
      recommendationAr,
    };
  }

  /**
   * Simulate COGS change
   */
  static simulateCogsChange(product: Product, cogsChangePercentage: number): SimulationResults {
    const originalProfit = this.calculateProductProfit(product);
    const originalMargin = this.calculateProductMargin(product);

    const newCogs = product.cogs * (1 + cogsChangePercentage / 100);
    const newProduct = { ...product, cogs: newCogs };
    const newProfit = this.calculateProductProfit(newProduct);
    const newMargin = this.calculateProductMargin(newProduct);

    const profitChange = newProfit - originalProfit;
    const profitChangePercentage = (profitChange / Math.abs(originalProfit)) * 100;

    let recommendation = '';
    let recommendationAr = '';

    if (cogsChangePercentage < 0) {
      recommendation = `Reducing COGS by ${Math.abs(cogsChangePercentage).toFixed(1)}% would increase profit by ${Math.abs(profitChange).toFixed(2)} per unit.`;
      recommendationAr = `تقليل تكلفة المنتج بنسبة ${Math.abs(cogsChangePercentage).toFixed(1)}% سيزيد الربح بمقدار ${Math.abs(profitChange).toFixed(2)} لكل وحدة.`;
    } else {
      recommendation = `Increasing COGS by ${cogsChangePercentage.toFixed(1)}% would decrease profit by ${profitChange.toFixed(2)} per unit.`;
      recommendationAr = `زيادة تكلفة المنتج بنسبة ${cogsChangePercentage.toFixed(1)}% ستقلل الربح بمقدار ${profitChange.toFixed(2)} لكل وحدة.`;
    }

    return {
      originalProfit,
      newProfit,
      profitChange,
      profitChangePercentage,
      originalMargin,
      newMargin,
      marginChange: newMargin - originalMargin,
      breakEvenPrice: product.cogs + product.shipping + product.returnCost + product.cod + product.packaging + product.vat,
      recommendation,
      recommendationAr,
    };
  }

  /**
   * Simulate shipping cost change
   */
  static simulateShippingChange(product: Product, shippingChangeAbsolute: number): SimulationResults {
    const originalProfit = this.calculateProductProfit(product);
    const originalMargin = this.calculateProductMargin(product);

    const newShipping = product.shipping + shippingChangeAbsolute;
    const newProduct = { ...product, shipping: Math.max(0, newShipping) };
    const newProfit = this.calculateProductProfit(newProduct);
    const newMargin = this.calculateProductMargin(newProduct);

    const profitChange = newProfit - originalProfit;
    const profitChangePercentage = (profitChange / Math.abs(originalProfit)) * 100;

    let recommendation = '';
    let recommendationAr = '';

    if (shippingChangeAbsolute < 0) {
      recommendation = `Reducing shipping cost by ${Math.abs(shippingChangeAbsolute).toFixed(2)} would increase profit by ${Math.abs(profitChange).toFixed(2)} per unit.`;
      recommendationAr = `تقليل تكلفة الشحن بمقدار ${Math.abs(shippingChangeAbsolute).toFixed(2)} سيزيد الربح بمقدار ${Math.abs(profitChange).toFixed(2)} لكل وحدة.`;
    } else {
      recommendation = `Increasing shipping cost by ${shippingChangeAbsolute.toFixed(2)} would decrease profit by ${profitChange.toFixed(2)} per unit.`;
      recommendationAr = `زيادة تكلفة الشحن بمقدار ${shippingChangeAbsolute.toFixed(2)} ستقلل الربح بمقدار ${profitChange.toFixed(2)} لكل وحدة.`;
    }

    return {
      originalProfit,
      newProfit,
      profitChange,
      profitChangePercentage,
      originalMargin,
      newMargin,
      marginChange: newMargin - originalMargin,
      breakEvenPrice: product.cogs + product.shipping + product.returnCost + product.cod + product.packaging + product.vat,
      recommendation,
      recommendationAr,
    };
  }

  /**
   * Simulate campaign budget change
   */
  static simulateCampaignBudgetChange(campaign: Campaign, budgetChangePercentage: number): SimulationResults {
    const originalRoas = campaign.revenue / campaign.spend;
    const originalProfit = campaign.revenue - campaign.spend;

    const newSpend = campaign.spend * (1 + budgetChangePercentage / 100);
    // Assume ROAS remains constant
    const newRevenue = newSpend * originalRoas;
    const newProfit = newRevenue - newSpend;

    const profitChange = newProfit - originalProfit;
    const profitChangePercentage = (profitChange / Math.abs(originalProfit)) * 100;

    let recommendation = '';
    let recommendationAr = '';

    if (budgetChangePercentage > 0) {
      recommendation = `Increasing budget by ${budgetChangePercentage.toFixed(1)}% would increase profit by ${profitChange.toFixed(2)} (assuming constant ROAS).`;
      recommendationAr = `زيادة الميزانية بنسبة ${budgetChangePercentage.toFixed(1)}% ستزيد الربح بمقدار ${profitChange.toFixed(2)} (مع افتراض ثبات العائد).`;
    } else {
      recommendation = `Decreasing budget by ${Math.abs(budgetChangePercentage).toFixed(1)}% would decrease profit by ${Math.abs(profitChange).toFixed(2)}.`;
      recommendationAr = `خفض الميزانية بنسبة ${Math.abs(budgetChangePercentage).toFixed(1)}% سيقلل الربح بمقدار ${Math.abs(profitChange).toFixed(2)}.`;
    }

    return {
      originalProfit,
      newProfit,
      profitChange,
      profitChangePercentage,
      originalMargin: originalRoas,
      newMargin: newRevenue / newSpend,
      marginChange: (newRevenue / newSpend) - originalRoas,
      recommendation,
      recommendationAr,
    };
  }

  /**
   * Create a price optimization scenario
   */
  static createPriceOptimizationScenario(product: Product): SimulationScenario {
    const currentPrice = product.price;
    const priceChangePercentage = 5; // Default 5% increase

    return {
      id: `price-opt-${product.id}`,
      name: `Price Optimization: ${product.name}`,
      nameAr: `تحسين السعر: ${product.name}`,
      description: `Simulate the impact of changing the price of ${product.name}`,
      descriptionAr: `محاكاة تأثير تغيير سعر ${product.name}`,
      variables: [
        {
          key: 'priceChange',
          label: 'Price Change',
          labelAr: 'تغيير السعر',
          type: 'percentage',
          currentValue: 0,
          newValue: priceChangePercentage,
          min: -50,
          max: 50,
          step: 1,
          unit: '%',
        },
      ],
      results: this.simulatePriceChange(product, priceChangePercentage),
    };
  }

  /**
   * Create a cost reduction scenario
   */
  static createCostReductionScenario(product: Product): SimulationScenario {
    const cogsChangePercentage = -5; // Default 5% reduction

    return {
      id: `cost-red-${product.id}`,
      name: `Cost Reduction: ${product.name}`,
      nameAr: `تقليل التكاليف: ${product.name}`,
      description: `Simulate the impact of reducing costs for ${product.name}`,
      descriptionAr: `محاكاة تأثير تقليل تكاليف ${product.name}`,
      variables: [
        {
          key: 'cogsChange',
          label: 'COGS Change',
          labelAr: 'تغيير تكلفة المنتج',
          type: 'percentage',
          currentValue: 0,
          newValue: cogsChangePercentage,
          min: -50,
          max: 50,
          step: 1,
          unit: '%',
        },
      ],
      results: this.simulateCogsChange(product, cogsChangePercentage),
    };
  }

  /**
   * Create a campaign scaling scenario
   */
  static createCampaignScalingScenario(campaign: Campaign): SimulationScenario {
    const budgetChangePercentage = 20; // Default 20% increase

    return {
      id: `scale-${campaign.id}`,
      name: `Scale Campaign: ${campaign.name}`,
      nameAr: `توسيع الحملة: ${campaign.name}`,
      description: `Simulate the impact of increasing budget for ${campaign.name}`,
      descriptionAr: `محاكاة تأثير زيادة ميزانية ${campaign.name}`,
      variables: [
        {
          key: 'budgetChange',
          label: 'Budget Change',
          labelAr: 'تغيير الميزانية',
          type: 'percentage',
          currentValue: 0,
          newValue: budgetChangePercentage,
          min: -50,
          max: 100,
          step: 5,
          unit: '%',
        },
      ],
      results: this.simulateCampaignBudgetChange(campaign, budgetChangePercentage),
    };
  }
}
