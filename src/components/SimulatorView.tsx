import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  Download,
  Sparkles,
  Info,
  DollarSign,
  Sliders,
  ChevronRight,
  CheckCircle,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { Currency, Order, SimulationConfig } from '../types';
import { calculateCompoundSimulation, formatCurrency, formatKz, formatPercent } from '../utils/calculations';

interface SimulatorViewProps {
  currency: Currency;
  usdtKzRate?: number;
  onApplyAsOrder: (initialCapital: number, profitPct: number, withdrawalCost: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  currency,
  usdtKzRate = 950,
  onApplyAsOrder,
}) => {
  const [config, setConfig] = useState<SimulationConfig>({
    initialCapital: 3000,
    profitPercentagePerOrder: 5.0,
    numberOfOrders: 20,
    reinvestmentRate: 100, // 100% reinvestment = pure compound interest
    withdrawalFeePerOrder: 10.0,
    additionalContributionPerOrder: 0,
    name: 'Simulação Padrão',
  });

  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

  // Quick Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'conservador':
        setConfig({
          initialCapital: 5000,
          profitPercentagePerOrder: 2.5,
          numberOfOrders: 30,
          reinvestmentRate: 100,
          withdrawalFeePerOrder: 15,
          additionalContributionPerOrder: 0,
          name: 'Conservador (2.5% / 30 ordens)',
        });
        break;
      case 'moderado':
        setConfig({
          initialCapital: 3000,
          profitPercentagePerOrder: 5.0,
          numberOfOrders: 20,
          reinvestmentRate: 100,
          withdrawalFeePerOrder: 10,
          additionalContributionPerOrder: 0,
          name: 'Moderado (5.0% / 20 ordens)',
        });
        break;
      case 'agressivo':
        setConfig({
          initialCapital: 2000,
          profitPercentagePerOrder: 8.0,
          numberOfOrders: 15,
          reinvestmentRate: 100,
          withdrawalFeePerOrder: 20,
          additionalContributionPerOrder: 0,
          name: 'Agressivo (8.0% / 15 ordens)',
        });
        break;
      case 'saque_parcial':
        setConfig({
          initialCapital: 4000,
          profitPercentagePerOrder: 6.0,
          numberOfOrders: 25,
          reinvestmentRate: 60, // 40% saque, 60% reinvestimento
          withdrawalFeePerOrder: 15,
          additionalContributionPerOrder: 0,
          name: 'Renda e Crescimento (60% Reinvestido)',
        });
        break;
    }
  };

  const result = useMemo(() => {
    return calculateCompoundSimulation(config);
  }, [config]);

  const compoundExtraBenefit = Math.max(0, result.finalBalance - result.simpleInterestComparison);

  // SVG Chart Calculations
  const chartPoints = useMemo(() => {
    const width = 800;
    const height = 260;

    if (result.steps.length === 0) {
      return {
        pathCompound: '',
        areaCompound: '',
        pathSimple: '',
        points: [],
        width,
        height,
        maxVal: 0,
        minVal: 0,
      };
    }
    const padX = 40;
    const padY = 30;

    const maxVal = Math.max(
      result.finalBalance * 1.08,
      result.simpleInterestComparison * 1.08,
      config.initialCapital * 1.2
    );
    const minVal = config.initialCapital * 0.9;

    const getX = (index: number) =>
      padX + (index / (result.steps.length - 1 || 1)) * (width - padX * 2);
    const getY = (val: number) =>
      height - padY - ((val - minVal) / (maxVal - minVal || 1)) * (height - padY * 2);

    // Initial point
    const pointsData = [
      {
        orderNumber: 0,
        balance: config.initialCapital,
        x: getX(0),
        y: getY(config.initialCapital),
      },
      ...result.steps.map((s, idx) => ({
        orderNumber: s.orderNumber,
        balance: s.endBalance,
        x: getX(idx),
        y: getY(s.endBalance),
      })),
    ];

    // Compound path
    const pathCompound = pointsData.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area path for compound
    const areaCompound = `${pathCompound} L ${pointsData[pointsData.length - 1].x} ${
      height - padY
    } L ${pointsData[0].x} ${height - padY} Z`;

    // Simple interest path
    const simpleStepGain = (result.simpleInterestComparison - config.initialCapital) / (result.steps.length || 1);
    const simplePoints = pointsData.map((p, idx) => {
      const simpleVal = config.initialCapital + simpleStepGain * idx;
      return {
        x: p.x,
        y: getY(simpleVal),
      };
    });

    const pathSimple = simplePoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return {
      pathCompound,
      areaCompound,
      pathSimple,
      points: pointsData,
      width,
      height,
      maxVal,
      minVal,
    };
  }, [result, config]);

  const exportSimulationCSV = () => {
    const headers = [
      'Ordem Nº',
      'Capital Inicial (R$)',
      '% Lucro',
      'Lucro Bruto (R$)',
      'Custo Saque (R$)',
      'Reinvestimento (R$)',
      'Lucro Sacado (R$)',
      'Saldo Acumulado (R$)',
      'Lucro Total Acumulado (R$)',
    ];

    const rows = result.steps.map((s) => [
      s.orderNumber,
      s.startBalance.toFixed(2),
      s.profitPercentage.toFixed(2),
      s.grossProfit.toFixed(2),
      s.withdrawalCost.toFixed(2),
      s.reinvestAmount.toFixed(2),
      s.withdrawnProfit.toFixed(2),
      s.endBalance.toFixed(2),
      s.totalProfitAccumulated.toFixed(2),
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacao-juros-compostos-${config.numberOfOrders}-ordens.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-400" />
            <span>Simulador de Ordens & Juros Compostos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simule o efeito exponencial do reinvestimento de lucros nas ordens seguintes.
            Veja o impacto da percentagem de lucro ordem após ordem e compare com rendimento linear.
          </p>
        </div>

        {/* Action presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          <button
            onClick={() => applyPreset('conservador')}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#152347] hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            Conservador
          </button>
          <button
            onClick={() => applyPreset('moderado')}
            className="px-2.5 py-1 text-xs rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors font-medium"
          >
            Moderado (5%)
          </button>
          <button
            onClick={() => applyPreset('agressivo')}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#152347] hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            Agressivo (8%)
          </button>
          <button
            onClick={() => applyPreset('saque_parcial')}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#152347] hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            Saque Parcial
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Key Result Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              Parâmetros da Simulação
            </span>
            <span className="text-[11px] text-slate-400">Ordens consecutivas</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Capital Inicial */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">Capital Inicial ({currency})</label>
                <span className="font-mono text-blue-400 font-bold">
                  {formatCurrency(config.initialCapital, currency)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€'}
                </span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={config.initialCapital}
                  onChange={(e) =>
                    setConfig({ ...config, initialCapital: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 2. % de Lucro por Ordem */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">
                  Percentual de Lucro por Ordem (%)
                </label>
                <span className="font-mono text-emerald-400 font-bold">
                  +{config.profitPercentagePerOrder.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="25"
                  step="0.5"
                  value={config.profitPercentagePerOrder}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      profitPercentagePerOrder: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 h-2 bg-slate-700 rounded-lg accent-emerald-500 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={config.profitPercentagePerOrder}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      profitPercentagePerOrder: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-20 px-2 py-1.5 bg-[#131f42] border border-slate-700 rounded-lg text-right text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3. Quantidade de Ordens (Ciclos) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">
                  Quantidade de Ordens Sucessivas
                </label>
                <span className="font-mono text-white font-bold">
                  {config.numberOfOrders} ordens
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={config.numberOfOrders}
                  onChange={(e) =>
                    setConfig({ ...config, numberOfOrders: parseInt(e.target.value) || 10 })
                  }
                  className="flex-1 h-2 bg-slate-700 rounded-lg accent-blue-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.numberOfOrders}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      numberOfOrders: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)),
                    })
                  }
                  className="w-20 px-2 py-1.5 bg-[#131f42] border border-slate-700 rounded-lg text-right text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 4. Taxa de Reinvestimento */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <label className="font-semibold text-slate-200">Reinvestimento de Lucro (%)</label>
                  <span
                    className="text-slate-400"
                    title="100% = Juros Compostos Puros. 50% = metade do lucro é sacado e metade reinvestido."
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
                <span className="font-mono text-cyan-300 font-bold">
                  {config.reinvestmentRate}% reinvestido
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config.reinvestmentRate}
                  onChange={(e) =>
                    setConfig({ ...config, reinvestmentRate: parseInt(e.target.value) || 0 })
                  }
                  className="flex-1 h-2 bg-slate-700 rounded-lg accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 w-20 text-right">
                  {config.reinvestmentRate === 100
                    ? '100% Composto'
                    : `${100 - config.reinvestmentRate}% Saque`}
                </span>
              </div>
            </div>

            {/* 5. Custo de Saque por Ordem */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">
                  Custo Estimado por Saque / Ciclo ({currency})
                </label>
                <span className="font-mono text-amber-400 font-bold">
                  {formatCurrency(config.withdrawalFeePerOrder, currency)}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={config.withdrawalFeePerOrder}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    withdrawalFeePerOrder: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 6. Aporte Adicional por Ordem (Opcional) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">
                  Aporte Adicional a Cada Ordem ({currency})
                </label>
                <span className="text-[11px] text-slate-400">Opcional</span>
              </div>
              <input
                type="number"
                min="0"
                step="50"
                value={config.additionalContributionPerOrder}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    additionalContributionPerOrder: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                placeholder="0.00"
                className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick CTA to apply simulator to a real order */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() =>
                onApplyAsOrder(
                  config.initialCapital,
                  config.profitPercentagePerOrder,
                  config.withdrawalFeePerOrder
                )
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar 1ª Ordem Real com Este Capital</span>
            </button>
          </div>
        </div>

        {/* Right Output: Projection Results & Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Saldo Final */}
            <div className="bg-gradient-to-br from-[#12285e] to-[#0c183a] border border-blue-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
              <div className="text-xs text-blue-200 font-medium">Saldo Final Projetado</div>
              <div className="text-2xl font-black text-white mt-1">
                {formatCurrency(result.finalBalance, currency)}
              </div>
              <div className="mt-1 text-[11px] font-mono text-amber-300 font-bold">
                ≈ {formatKz(result.finalBalance, usdtKzRate)}
              </div>
              <div className="mt-1 text-xs text-blue-300 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multiplicador: {result.compoundMultiplier.toFixed(2)}x</span>
              </div>
            </div>

            {/* Lucro Líquido Acumulado */}
            <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="text-xs text-slate-400 font-medium">Lucro Líquido Total</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                +{formatCurrency(result.totalNetProfit, currency)}
              </div>
              <div className="mt-1 text-[11px] font-mono text-emerald-300 font-bold">
                ≈ +{formatKz(result.totalNetProfit, usdtKzRate)}
              </div>
              <div className="mt-1 text-xs text-emerald-400/80">
                Taxas descontadas: -{formatCurrency(result.totalFees, currency)}
              </div>
            </div>

            {/* Comparativo Juros Compostos vs Simples */}
            <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="text-xs text-slate-400 font-medium">Ganho Extra pelo Composto</div>
              <div className="text-2xl font-black text-cyan-300 mt-1">
                +{formatCurrency(compoundExtraBenefit, currency)}
              </div>
              <div className="mt-1 text-[11px] font-mono text-cyan-200 font-semibold">
                ≈ +{formatKz(compoundExtraBenefit, usdtKzRate)}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                vs Simples ({formatCurrency(result.simpleInterestComparison, currency)})
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Curva de Crescimento Composto (Ordem a Ordem)
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block"></span>
                  Juros Compostos
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-1 bg-slate-500 stroke-dasharray rounded-full inline-block"></span>
                  Juros Simples
                </span>
              </div>
            </div>

            {/* SVG Visual */}
            <div className="relative w-full h-56 bg-[#0a1226] rounded-xl border border-slate-800/80 p-2 overflow-hidden">
              <svg
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0.25, 0.5, 0.75].map((pct, i) => {
                  const y = 30 + pct * (chartPoints.height - 60);
                  return (
                    <line
                      key={i}
                      x1="40"
                      y1={y}
                      x2={chartPoints.width - 40}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Simple Interest reference line */}
                <path
                  d={chartPoints.pathSimple}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                {/* Compound Area */}
                <path d={chartPoints.areaCompound} fill="url(#cyanGradient)" />

                {/* Compound Line */}
                <path
                  d={chartPoints.pathCompound}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Points */}
                {chartPoints.points.map((pt, i) => {
                  if (i === 0) return null;
                  const isHovered = hoveredStepIndex === i - 1;
                  return (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3}
                      fill={isHovered ? '#ffffff' : '#38bdf8'}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredStepIndex(i - 1)}
                      onMouseLeave={() => setHoveredStepIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Hover tooltip or summary */}
              {hoveredStepIndex !== null && result.steps[hoveredStepIndex] && (
                <div className="absolute top-3 left-4 bg-slate-900/95 border border-cyan-500/40 rounded-lg p-2.5 shadow-xl text-xs text-white z-10 backdrop-blur-md">
                  <div className="font-bold text-cyan-300">
                    Ordem #{result.steps[hoveredStepIndex].orderNumber}
                  </div>
                  <div>
                    Saldo:{' '}
                    <span className="font-bold">
                      {formatCurrency(result.steps[hoveredStepIndex].endBalance, currency)}
                    </span>
                  </div>
                  <div className="text-emerald-400">
                    Lucro da ordem: +
                    {formatCurrency(result.steps[hoveredStepIndex].grossProfit, currency)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Início: {formatCurrency(config.initialCapital, currency)}</span>
              <span>
                {config.numberOfOrders} ordens com +{config.profitPercentagePerOrder}% cada
              </span>
              <span className="text-cyan-300 font-bold">
                Término: {formatCurrency(result.finalBalance, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Simulation Table */}
      <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-[#0c1633]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Tabela Detalhada Passo a Passo (Ordem a Ordem)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstração do reinvestimento de cada lucro para a ordem seguinte
            </p>
          </div>

          <button
            onClick={exportSimulationCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#152347] hover:bg-slate-700/60 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Baixar Projeção CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b142c] text-slate-400 uppercase tracking-wider text-[11px] font-semibold sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 text-center"># Ordem</th>
                <th className="py-3 px-3 text-right">Capital Inicial</th>
                <th className="py-3 px-3 text-right">% Lucro</th>
                <th className="py-3 px-3 text-right">Lucro Bruto</th>
                <th className="py-3 px-3 text-right">Taxa Saque</th>
                <th className="py-3 px-3 text-right">Valor Reinvestido</th>
                {config.reinvestmentRate < 100 && (
                  <th className="py-3 px-3 text-right">Lucro Retirado</th>
                )}
                <th className="py-3 px-4 text-right">Saldo Final da Ordem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {result.steps.map((step, idx) => (
                <tr
                  key={step.orderNumber}
                  className={`hover:bg-blue-950/20 transition-colors ${
                    idx === hoveredStepIndex ? 'bg-blue-950/40' : ''
                  }`}
                  onMouseEnter={() => setHoveredStepIndex(idx)}
                  onMouseLeave={() => setHoveredStepIndex(null)}
                >
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-400">
                    #{step.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-medium">
                    {formatCurrency(step.startBalance, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    +{step.profitPercentage.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">
                    +{formatCurrency(step.grossProfit, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400">
                    -{formatCurrency(step.withdrawalCost, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-300 font-semibold">
                    +{formatCurrency(step.reinvestAmount, currency)}
                  </td>
                  {config.reinvestmentRate < 100 && (
                    <td className="py-2.5 px-3 text-right text-purple-300">
                      {formatCurrency(step.withdrawnProfit, currency)}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-right font-bold text-white bg-blue-950/10">
                    {formatCurrency(step.endBalance, currency)}
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
