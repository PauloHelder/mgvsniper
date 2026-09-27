import { Currency, FilterOptions, Order, SimulationConfig, SimulationResult, SimulationStep } from '../types';

export const formatCurrency = (amount: number, currency: Currency = 'USDT'): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  
  if (currency === 'USDT') {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    return `${formatted} USDT`;
  }

  const locale = currency === 'BRL' ? 'pt-BR' : currency === 'USD' ? 'en-US' : 'de-DE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

export const formatKz = (amountInBaseCurrency: number, exchangeRateUsdtKz: number = 950): string => {
  const safeAmount = isNaN(amountInBaseCurrency) ? 0 : amountInBaseCurrency;
  const safeRate = isNaN(exchangeRateUsdtKz) || exchangeRateUsdtKz <= 0 ? 950 : exchangeRateUsdtKz;
  const totalKz = safeAmount * safeRate;

  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalKz);

  return `${formatted} Kz`;
};

export const formatPercent = (value: number): string => {
  const safeValue = isNaN(value) ? 0 : value;
  return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(2).replace('.', ',')}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export const calculateOrderMetrics = (
  appliedAmount: number,
  profitPercentage: number,
  withdrawalCost: number = 0
) => {
  const safeApplied = Math.max(0, appliedAmount || 0);
  const safePct = profitPercentage || 0;
  const safeCost = Math.max(0, withdrawalCost || 0);

  const profitAmount = safeApplied * (safePct / 100);
  const totalReturn = safeApplied + profitAmount;
  const netProfit = profitAmount - safeCost;
  const netReturn = totalReturn - safeCost;

  return {
    appliedAmount: safeApplied,
    profitPercentage: safePct,
    withdrawalCost: safeCost,
    profitAmount,
    totalReturn,
    netProfit,
    netReturn,
  };
};

export const isOrderInPeriod = (orderDate: string, filter: FilterOptions): boolean => {
  if (!orderDate) return false;
  if (filter.period === 'all') return true;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const orderD = new Date(orderDate + 'T00:00:00');

  switch (filter.period) {
    case 'today':
      return orderDate === todayStr;

    case '7days': {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderD >= sevenDaysAgo && orderD <= now;
    }

    case '30days': {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return orderD >= thirtyDaysAgo && orderD <= now;
    }

    case 'this_month': {
      return (
        orderD.getFullYear() === now.getFullYear() &&
        orderD.getMonth() === now.getMonth()
      );
    }

    case 'last_month': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        orderD.getFullYear() === lastMonth.getFullYear() &&
        orderD.getMonth() === lastMonth.getMonth()
      );
    }

    case 'this_year': {
      return orderD.getFullYear() === now.getFullYear();
    }

    case 'custom': {
      if (filter.startDate && orderDate < filter.startDate) return false;
      if (filter.endDate && orderDate > filter.endDate) return false;
      return true;
    }

    default:
      return true;
  }
};

export const filterOrders = (orders: Order[], filter: FilterOptions): Order[] => {
  return orders.filter((order) => {
    // Period filter
    if (!isOrderInPeriod(order.date, filter)) return false;

    // Status filter
    if (filter.status !== 'all' && order.status !== filter.status) return false;

    // Session filter (Sessão)
    if (filter.session && filter.session !== 'all' && order.session !== filter.session) {
      return false;
    }

    // Min / Max amount filter
    if (filter.minAmount !== undefined && order.appliedAmount < filter.minAmount) return false;
    if (filter.maxAmount !== undefined && order.appliedAmount > filter.maxAmount) return false;

    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchCode = order.code.toLowerCase().includes(q);
      const matchTitle = order.title.toLowerCase().includes(q);
      const matchSession = (order.session || '').toLowerCase().includes(q);
      const matchNotes = order.notes?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchSession && !matchNotes) return false;
    }

    return true;
  });
};

export const aggregateOrderTotals = (orders: Order[]) => {
  return orders.reduce(
    (acc, order) => {
      acc.totalApplied += order.appliedAmount;
      acc.totalGrossProfit += order.profitAmount;
      acc.totalFees += order.withdrawalCost;
      acc.totalNetProfit += order.netProfit;
      acc.totalReturn += order.totalReturn;
      acc.totalNetReturn += order.netReturn;
      acc.count += 1;
      if (order.status === 'completed') acc.completedCount += 1;
      if (order.status === 'in_progress') acc.inProgressCount += 1;
      if (order.status === 'cancelled') acc.cancelledCount += 1;
      return acc;
    },
    {
      totalApplied: 0,
      totalGrossProfit: 0,
      totalFees: 0,
      totalNetProfit: 0,
      totalReturn: 0,
      totalNetReturn: 0,
      count: 0,
      completedCount: 0,
      inProgressCount: 0,
      cancelledCount: 0,
    }
  );
};

export const calculateCompoundSimulation = (config: SimulationConfig): SimulationResult => {
  const steps: SimulationStep[] = [];
  let currentBalance = Math.max(0, config.initialCapital);
  let totalInvested = currentBalance;
  let totalGrossProfit = 0;
  let totalFees = 0;
  let totalNetProfit = 0;
  let totalWithdrawn = 0;

  const reinvestRate = Math.min(100, Math.max(0, config.reinvestmentRate)) / 100;

  for (let i = 1; i <= config.numberOfOrders; i++) {
    // Add periodic contribution if not the very first order
    if (i > 1 && config.additionalContributionPerOrder > 0) {
      currentBalance += config.additionalContributionPerOrder;
      totalInvested += config.additionalContributionPerOrder;
    }

    const startBalance = currentBalance;
    const grossProfit = startBalance * (config.profitPercentagePerOrder / 100);
    const fee = Math.min(grossProfit, Math.max(0, config.withdrawalFeePerOrder));
    const netProfitOfStep = grossProfit - fee;

    const reinvestAmount = netProfitOfStep * reinvestRate;
    const withdrawnProfit = netProfitOfStep * (1 - reinvestRate);

    const endBalance = startBalance + reinvestAmount;

    totalGrossProfit += grossProfit;
    totalFees += fee;
    totalNetProfit += netProfitOfStep;
    totalWithdrawn += withdrawnProfit;

    steps.push({
      orderNumber: i,
      startBalance,
      profitPercentage: config.profitPercentagePerOrder,
      grossProfit,
      withdrawalCost: fee,
      reinvestAmount,
      withdrawnProfit,
      endBalance,
      totalProfitAccumulated: totalNetProfit,
    });

    currentBalance = endBalance;
  }

  // Simple interest comparison (without compounding the profits)
  const simpleProfit = totalInvested * (config.profitPercentagePerOrder / 100) * config.numberOfOrders;
  const simpleInterestComparison = totalInvested + simpleProfit - (config.withdrawalFeePerOrder * config.numberOfOrders);

  const compoundMultiplier = totalInvested > 0 ? (currentBalance + totalWithdrawn) / totalInvested : 1;

  return {
    config,
    steps,
    finalBalance: currentBalance,
    totalInvested,
    totalGrossProfit,
    totalFees,
    totalNetProfit,
    totalWithdrawn,
    compoundMultiplier,
    simpleInterestComparison,
  };
};
