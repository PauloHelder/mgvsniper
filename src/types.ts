export type Currency = 'USDT' | 'USD' | 'EUR' | 'BRL';

export type OrderStatus = 'completed' | 'in_progress' | 'cancelled';

export interface TradeSession {
  id: string;
  name: string;
  color: string; // 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo'
  description?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  currency: Currency;
  usdtKzRate: number; // Taxa de câmbio USDT - KZ (ex: 950)
  defaultWithdrawalFee: number;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string; // ex: ORD-1092
  title: string;
  appliedAmount: number; // Valor Aplicado
  profitPercentage: number; // % de Lucro
  profitAmount: number; // Lucro Bruto = appliedAmount * (profitPercentage / 100)
  withdrawalCost: number; // Custo do saque
  totalReturn: number; // Retorno Total = appliedAmount + profitAmount
  netProfit: number; // Lucro Líquido = profitAmount - withdrawalCost
  netReturn: number; // Retorno Líquido = totalReturn - withdrawalCost
  date: string; // YYYY-MM-DD
  status: OrderStatus;
  session: string; // Sessão da Ordem (ex: Sessão Londres, Sessão VIP Sniper, etc.)
  notes?: string;
}

export type PeriodFilter = 
  | 'all'
  | 'today'
  | '7days'
  | '30days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface FilterOptions {
  period: PeriodFilter;
  startDate?: string;
  endDate?: string;
  status: 'all' | OrderStatus;
  session: string; // Filtro por Sessão
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface SimulationStep {
  orderNumber: number;
  startBalance: number;
  profitPercentage: number;
  grossProfit: number;
  withdrawalCost: number;
  reinvestAmount: number;
  withdrawnProfit: number;
  endBalance: number;
  totalProfitAccumulated: number;
}

export interface SimulationConfig {
  initialCapital: number;
  profitPercentagePerOrder: number;
  numberOfOrders: number;
  reinvestmentRate: number; // 0 to 100 (%)
  withdrawalFeePerOrder: number;
  additionalContributionPerOrder: number;
  name?: string;
}

export interface SimulationResult {
  config: SimulationConfig;
  steps: SimulationStep[];
  finalBalance: number;
  totalInvested: number;
  totalGrossProfit: number;
  totalFees: number;
  totalNetProfit: number;
  totalWithdrawn: number;
  compoundMultiplier: number;
  simpleInterestComparison: number;
}
