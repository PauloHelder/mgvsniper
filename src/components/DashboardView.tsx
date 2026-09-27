import React, { useMemo } from 'react';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  PiggyBank,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  BarChart3,
  Layers,
  Coins,
  Settings,
  Target,
} from 'lucide-react';
import { Currency, Order, TradeSession, User } from '../types';
import {
  aggregateOrderTotals,
  formatCurrency,
  formatDate,
  formatKz,
  formatPercent,
} from '../utils/calculations';

interface DashboardViewProps {
  orders: Order[];
  user: User;
  sessions: TradeSession[];
  onNavigateToOrders: () => void;
  onNavigateToSimulator: () => void;
  onNavigateToSettings: () => void;
  onOpenNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  user,
  sessions,
  onNavigateToOrders,
  onNavigateToSimulator,
  onNavigateToSettings,
  onOpenNewOrder,
}) => {
  const currency = user.currency || 'USDT';
  const kzRate = user.usdtKzRate || 950;
  const totals = useMemo(() => aggregateOrderTotals(orders), [orders]);

  // Group by Session (Substituindo Categoria)
  const sessionStats = useMemo(() => {
    const map: { [sessionName: string]: { applied: number; profit: number; count: number } } = {};
    orders.forEach((o) => {
      const sess = o.session || 'Sessão Matutina';
      if (!map[sess]) map[sess] = { applied: 0, profit: 0, count: 0 };
      map[sess].applied += o.appliedAmount;
      map[sess].profit += o.netProfit;
      map[sess].count += 1;
    });

    return Object.entries(map)
      .map(([sessionName, data]) => {
        const found = sessions.find((s) => s.name === sessionName);
        return {
          sessionName,
          color: found ? found.color : 'blue',
          ...data,
        };
      })
      .sort((a, b) => b.applied - a.applied);
  }, [orders, sessions]);

  // Group by month
  const monthlyStats = useMemo(() => {
    const map: { [month: string]: { applied: number; netProfit: number } } = {};
    orders.forEach((o) => {
      const ym = o.date ? o.date.slice(0, 7) : '2026-09';
      if (!map[ym]) map[ym] = { applied: 0, netProfit: 0 };
      map[ym].applied += o.appliedAmount;
      map[ym].netProfit += o.netProfit;
    });

    const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([monthKey, val]) => {
      const [year, month] = monthKey.split('-');
      const monthNames = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      const mIdx = parseInt(month) - 1;
      const label = `${monthNames[mIdx] || month}/${year.slice(2)}`;
      return {
        key: monthKey,
        label,
        ...val,
      };
    });
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [orders]);

  const avgProfitPct =
    totals.totalApplied > 0 ? (totals.totalGrossProfit / totals.totalApplied) * 100 : 0;
  const maxMonthlyApplied = Math.max(...monthlyStats.map((m) => m.applied), 1000);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1638] via-[#0f214d] to-[#091329] border border-blue-500/20 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Painel Geral MVGSNIPER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Desempenho Geral & Cotação em Kwanzas (Kz)
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Monitore o capital aplicado, rentabilidade líquida e equivalência em Kz com câmbio oficial configurado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cotação USDT - KZ Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#14234c] border border-amber-500/30 rounded-xl text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">Câmbio Atual</span>
                <span className="font-bold text-amber-300 font-mono text-xs">
                  1 USDT = {kzRate.toLocaleString('pt-AO')} Kz
                </span>
              </div>
              <button
                onClick={onNavigateToSettings}
                className="ml-1 p-1 hover:text-white text-slate-400"
                title="Alterar taxa de câmbio nas configurações"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#152554] hover:bg-[#1e3475] border border-blue-500/30 rounded-xl transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulador</span>
            </button>

            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Ordem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards com VALOR EM KZ DESTACADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Aplicado */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Aplicado</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(totals.totalApplied, currency)}
            </div>
            {/* VALOR EM KZ */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-xs font-bold">
              <span>≈ {formatKz(totals.totalApplied, kzRate)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {totals.count} ordens registradas no histórico
            </div>
          </div>
        </div>

        {/* 2. Lucro Bruto Total */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Lucro Bruto Total</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              +{formatCurrency(totals.totalGrossProfit, currency)}
            </div>
            {/* VALOR EM KZ */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold">
              <span>≈ +{formatKz(totals.totalGrossProfit, kzRate)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Rentabilidade média de +{avgProfitPct.toFixed(2).replace('.', ',')}%
            </div>
          </div>
        </div>

        {/* 3. Lucro Líquido Real */}
        <div className="bg-gradient-to-br from-[#102450] to-[#0c183a] border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-200">Lucro Líquido Real</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-300 tracking-tight">
              {formatCurrency(totals.totalNetProfit, currency)}
            </div>
            {/* VALOR EM KZ */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-mono text-xs font-bold">
              <span>≈ {formatKz(totals.totalNetProfit, kzRate)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-300">
              Descontadas taxas de saque ({formatCurrency(totals.totalFees, currency)})
            </div>
          </div>
        </div>

        {/* 4. Retorno Total Acumulado */}
        <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Retorno Total Acumulado</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(totals.totalReturn, currency)}
            </div>
            {/* VALOR EM KZ */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
              <span>Líq: {formatKz(totals.totalNetReturn, kzRate)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Capital + Lucro (Líq: {formatCurrency(totals.totalNetReturn, currency)})
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Performance Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Evolução Mensal (Volume Aplicado vs Lucro Líquido)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
                Volume Aplicado
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                Lucro Líquido
              </span>
            </div>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="space-y-4 pt-2">
            {monthlyStats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum dado mensal disponível</p>
            ) : (
              <div className="space-y-3.5">
                {monthlyStats.map((item) => {
                  const appliedPct = Math.min(100, (item.applied / maxMonthlyApplied) * 100);
                  const profitPct = Math.min(
                    100,
                    (item.netProfit / (item.applied || 1)) * 100 * 2.5
                  );
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{item.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">
                            Aplicado: <strong>{formatCurrency(item.applied, currency)}</strong>{' '}
                            <span className="text-amber-400/80 font-mono text-[11px]">
                              ({formatKz(item.applied, kzRate)})
                            </span>
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Lucro: +{formatCurrency(item.netProfit, currency)}{' '}
                            <span className="text-emerald-300/80 font-mono text-[11px]">
                              (+{formatKz(item.netProfit, kzRate)})
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Bar tracks */}
                      <div className="h-4 bg-[#0a1226] rounded-md overflow-hidden flex gap-1 p-0.5">
                        <div
                          className="bg-blue-600 rounded-sm transition-all duration-500"
                          style={{ width: `${appliedPct}%` }}
                          title={`Aplicado: ${formatCurrency(item.applied, currency)} (${formatKz(item.applied, kzRate)})`}
                        ></div>
                        <div
                          className="bg-emerald-500 rounded-sm transition-all duration-500"
                          style={{ width: `${profitPct}%` }}
                          title={`Lucro: ${formatCurrency(item.netProfit, currency)} (${formatKz(item.netProfit, kzRate)})`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SESSÕES OPERACIONAIS BREAKDOWN (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Volume por Sessão
              </span>
              <button
                onClick={onNavigateToSettings}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Gerir Sessões
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {sessionStats.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhuma sessão registrada</p>
              ) : (
                sessionStats.map((sess) => {
                  const share =
                    totals.totalApplied > 0 ? (sess.applied / totals.totalApplied) * 100 : 0;
                  return (
                    <div key={sess.sessionName} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          {sess.sessionName}
                        </span>
                        <div className="text-right">
                          <span className="text-slate-300 font-mono font-bold">
                            {formatCurrency(sess.applied, currency)}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1">
                            ({share.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#0a1226] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{ width: `${share}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{sess.count} ordens</span>
                        <span className="text-amber-400 font-mono">
                          {formatKz(sess.applied, kzRate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Simulator Highlight Box */}
          <div className="bg-gradient-to-br from-[#12285e] to-[#0c1633] border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulador Sniper Composto
              </h4>
            </div>

            <p className="text-xs text-blue-200 leading-relaxed">
              Calcule a projeção exponencial dos seus lucros por sessão acumulando o capital de ordem em ordem.
            </p>

            <button
              onClick={onNavigateToSimulator}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <span>Abrir Simulador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-[#0c1633]">
          <div>
            <h3 className="text-sm font-bold text-white">Ordens Recentes MVGSNIPER</h3>
            <p className="text-xs text-slate-400 mt-0.5">Últimas operações com valores na moeda e em Kz</p>
          </div>

          <button
            onClick={onNavigateToOrders}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Ver todas as ordens ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b142c] text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código / Ativo</th>
                <th className="py-3 px-3">Sessão</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3 text-right">Valor Aplicado</th>
                <th className="py-3 px-3 text-right">Equivalente em Kz</th>
                <th className="py-3 px-3 text-right">% Lucro</th>
                <th className="py-3 px-3 text-right">Lucro Líquido</th>
                <th className="py-3 px-3 text-right">Retorno Total</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-950/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{order.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{order.code}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {order.session}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{formatDate(order.date)}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-100">
                    {formatCurrency(order.appliedAmount, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-amber-300">
                    {formatKz(order.appliedAmount, kzRate)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">
                    {formatPercent(order.profitPercentage)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-300">
                    <div>{formatCurrency(order.netProfit, currency)}</div>
                    <div className="text-[10px] text-cyan-200/70 font-mono">
                      {formatKz(order.netProfit, kzRate)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white">
                    <div>{formatCurrency(order.totalReturn, currency)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatKz(order.totalReturn, kzRate)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {order.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluída
                      </span>
                    )}
                    {order.status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        Em Andamento
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Cancelada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
