import React from 'react';
import { Currency, Order } from '../types';
import { aggregateOrderTotals, formatCurrency, formatKz } from '../utils/calculations';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  PiggyBank,
  CheckCircle2,
  Clock,
  Percent,
} from 'lucide-react';

interface PeriodSummaryCardsProps {
  orders: Order[];
  currency: Currency;
  usdtKzRate: number;
  periodLabel?: string;
}

export const PeriodSummaryCards: React.FC<PeriodSummaryCardsProps> = ({
  orders,
  currency,
  usdtKzRate,
  periodLabel,
}) => {
  const totals = aggregateOrderTotals(orders);
  const avgProfitPct =
    totals.totalApplied > 0 ? (totals.totalGrossProfit / totals.totalApplied) * 100 : 0;
  const netMarginPct =
    totals.totalApplied > 0 ? (totals.totalNetProfit / totals.totalApplied) * 100 : 0;

  return (
    <div className="space-y-3">
      {periodLabel && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            Resumo do Período Filtrado:{' '}
            <span className="text-blue-400 font-semibold">{periodLabel}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {totals.completedCount} Concluídas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {totals.inProgressCount} Em Andamento
            </span>
            <span className="font-medium text-slate-300">
              Total: <strong className="text-white">{totals.count} ordens</strong>
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Aplicado */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Aplicado</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(totals.totalApplied, currency)}
            </div>
            <div className="text-[11px] font-mono text-amber-300 font-medium mt-0.5">
              ≈ {formatKz(totals.totalApplied, usdtKzRate)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>{totals.count} ordens</span>
            </div>
          </div>
        </div>

        {/* 2. Lucro Bruto */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Lucro Bruto (%)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-emerald-400 tracking-tight">
              +{formatCurrency(totals.totalGrossProfit, currency)}
            </div>
            <div className="text-[11px] font-mono text-emerald-300/80 font-medium mt-0.5">
              +{formatKz(totals.totalGrossProfit, usdtKzRate)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400/80">
              <Percent className="w-3 h-3" />
              <span>Média: +{avgProfitPct.toFixed(2).replace('.', ',')}%</span>
            </div>
          </div>
        </div>

        {/* 3. Custo dos Saques */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Custos de Saque</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-amber-400 tracking-tight">
              -{formatCurrency(totals.totalFees, currency)}
            </div>
            <div className="text-[11px] font-mono text-amber-300/80 font-medium mt-0.5">
              -{formatKz(totals.totalFees, usdtKzRate)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Taxas operacionais</span>
            </div>
          </div>
        </div>

        {/* 4. Lucro Líquido Real */}
        <div className="bg-gradient-to-br from-[#122858] to-[#0c183a] border border-cyan-500/30 rounded-xl p-4 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-200">Lucro Líquido</span>
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-cyan-300 tracking-tight">
              {formatCurrency(totals.totalNetProfit, currency)}
            </div>
            <div className="text-[11px] font-mono text-cyan-100 font-semibold mt-0.5">
              {formatKz(totals.totalNetProfit, usdtKzRate)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-cyan-200/80">
              <span>Margem Líq: {netMarginPct.toFixed(2).replace('.', ',')}%</span>
            </div>
          </div>
        </div>

        {/* 5. Retorno Total do Período */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700/80 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Retorno Total</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(totals.totalReturn, currency)}
            </div>
            <div className="text-[11px] font-mono text-amber-300 font-semibold mt-0.5">
              Líq: {formatKz(totals.totalNetReturn, usdtKzRate)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Líq: {formatCurrency(totals.totalNetReturn, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
