import React, { useState, useEffect } from 'react';
import { X, Calculator, Plus, Save, Sparkles, AlertCircle, Coins, Layers } from 'lucide-react';
import { Currency, Order, OrderStatus, TradeSession } from '../types';
import { calculateOrderMetrics, formatCurrency, formatKz } from '../utils/calculations';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<Order>) => void;
  editingOrder?: Order | null;
  currency: Currency;
  usdtKzRate: number;
  defaultWithdrawalFee?: number;
  sessions: TradeSession[];
  onQuickAddSession?: (newSession: TradeSession) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOrder,
  currency,
  usdtKzRate,
  defaultWithdrawalFee = 5.0,
  sessions,
  onQuickAddSession,
}) => {
  const [title, setTitle] = useState('');
  const [appliedAmount, setAppliedAmount] = useState<number | ''>(5000);
  const [profitPercentage, setProfitPercentage] = useState<number | ''>(5.5);
  const [withdrawalCost, setWithdrawalCost] = useState<number | ''>(defaultWithdrawalFee);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<OrderStatus>('completed');
  const [session, setSession] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Quick session inline creation
  const [showQuickSession, setShowQuickSession] = useState(false);
  const [quickSessionName, setQuickSessionName] = useState('');

  useEffect(() => {
    const defaultSessionName = sessions[0]?.name || 'Sessão Matutina';

    if (editingOrder) {
      setTitle(editingOrder.title);
      setAppliedAmount(editingOrder.appliedAmount);
      setProfitPercentage(editingOrder.profitPercentage);
      setWithdrawalCost(editingOrder.withdrawalCost);
      setDate(editingOrder.date);
      setStatus(editingOrder.status);
      setSession(editingOrder.session || defaultSessionName);
      setNotes(editingOrder.notes || '');
    } else {
      setTitle('');
      setAppliedAmount(5000);
      setProfitPercentage(5.5);
      setWithdrawalCost(defaultWithdrawalFee);
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('completed');
      setSession(defaultSessionName);
      setNotes('');
    }
    setErrors({});
    setShowQuickSession(false);
  }, [editingOrder, isOpen, defaultWithdrawalFee, sessions]);

  if (!isOpen) return null;

  const numApplied = typeof appliedAmount === 'number' ? appliedAmount : 0;
  const numProfitPct = typeof profitPercentage === 'number' ? profitPercentage : 0;
  const numWithdrawal = typeof withdrawalCost === 'number' ? withdrawalCost : 0;

  const liveMetrics = calculateOrderMetrics(numApplied, numProfitPct, numWithdrawal);

  const handleCreateQuickSession = () => {
    if (!quickSessionName.trim()) return;
    const name = quickSessionName.trim();
    if (onQuickAddSession) {
      const newSess: TradeSession = {
        id: `sess-${Date.now()}`,
        name,
        color: 'cyan',
        description: 'Criada via modal de ordem',
      };
      onQuickAddSession(newSess);
    }
    setSession(name);
    setQuickSessionName('');
    setShowQuickSession(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Informe uma descrição ou código de ativo para a ordem';
    }
    if (typeof appliedAmount !== 'number' || appliedAmount <= 0) {
      newErrors.appliedAmount = 'O valor aplicado deve ser maior que zero';
    }
    if (typeof profitPercentage !== 'number') {
      newErrors.profitPercentage = 'Informe a percentagem de lucro';
    }
    if (typeof withdrawalCost !== 'number' || withdrawalCost < 0) {
      newErrors.withdrawalCost = 'Custo do saque não pode ser negativo';
    }
    if (!date) {
      newErrors.date = 'Selecione a data da ordem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      appliedAmount: numApplied,
      profitPercentage: numProfitPct,
      withdrawalCost: numWithdrawal,
      date,
      status,
      session: session || sessions[0]?.name || 'Sessão Matutina',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1b3b] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1633]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingOrder ? 'Editar Ordem de Rendimento' : 'Cadastrar Nova Ordem MVGSNIPER'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingOrder
                  ? `Atualizando ${editingOrder.code}`
                  : 'Preencha o valor aplicado, % de lucro e custo de saque'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title & Sessão (Substituindo Categoria) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Descrição / Ativo da Ordem <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Scalping USDT Flash Sniper #1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-[#131f42] border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.title ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
            </div>

            {/* SESSÃO (GERIDA NAS CONFIGURAÇÕES) */}
            <div className="md:col-span-5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sessão</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickSession(!showQuickSession)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                >
                  + Nova Sessão
                </button>
              </div>

              {!showQuickSession ? (
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#131f42] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nome da Sessão..."
                    value={quickSessionName}
                    onChange={(e) => setQuickSessionName(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-[#131f42] border border-blue-500 rounded text-white"
                  />
                  <button
                    type="button"
                    onClick={handleCreateQuickSession}
                    className="px-2.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickSession(false)}
                    className="px-2 py-1.5 text-xs bg-slate-700 text-slate-300 rounded"
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Core Financial Inputs (Foco das Ordens) */}
          <div className="bg-[#12214a]/70 border border-blue-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Dados Financeiros da Ordem
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                <Coins className="w-3 h-3" />
                <span>1 {currency} = {usdtKzRate} Kz</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Valor Aplicado */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Valor Aplicado ({currency}) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={appliedAmount === '' ? '' : appliedAmount}
                    onChange={(e) =>
                      setAppliedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className={`w-full px-3 py-2 text-sm bg-[#152554] border rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.appliedAmount ? 'border-rose-500' : 'border-slate-600'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    {currency}
                  </span>
                </div>
                {/* PREVIEW EM KZ */}
                <div className="text-[11px] text-amber-300/90 font-mono font-medium">
                  ≈ {formatKz(numApplied, usdtKzRate)}
                </div>
                {errors.appliedAmount && (
                  <p className="text-xs text-rose-400">{errors.appliedAmount}</p>
                )}
              </div>

              {/* % de Lucro */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Percentagem de Lucro (%) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5.5"
                    value={profitPercentage === '' ? '' : profitPercentage}
                    onChange={(e) =>
                      setProfitPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className={`w-full px-3 py-2 text-sm bg-[#152554] border rounded-lg text-emerald-400 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.profitPercentage ? 'border-rose-500' : 'border-slate-600'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold">
                    %
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Rendimento obtido no ciclo
                </div>
                {errors.profitPercentage && (
                  <p className="text-xs text-rose-400">{errors.profitPercentage}</p>
                )}
              </div>

              {/* Custo do Saque */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Custo do Saque ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={withdrawalCost === '' ? '' : withdrawalCost}
                    onChange={(e) =>
                      setWithdrawalCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className={`w-full px-3 py-2 text-sm bg-[#152554] border rounded-lg text-amber-400 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.withdrawalCost ? 'border-rose-500' : 'border-slate-600'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    {currency}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/80 font-mono">
                  ≈ {formatKz(numWithdrawal, usdtKzRate)}
                </div>
                {errors.withdrawalCost && (
                  <p className="text-xs text-rose-400">{errors.withdrawalCost}</p>
                )}
              </div>
            </div>

            {/* Real-time Calculated Metrics Display */}
            <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Lucro Bruto */}
              <div className="bg-[#0f1b3b]/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Lucro Bruto</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  +{formatCurrency(liveMetrics.profitAmount, currency)}
                </span>
                <span className="text-[10px] text-emerald-300/80 font-mono block">
                  +{formatKz(liveMetrics.profitAmount, usdtKzRate)}
                </span>
              </div>

              {/* Lucro Líquido Real */}
              <div className="bg-[#0f1b3b]/90 p-3 rounded-lg border border-cyan-500/30">
                <span className="text-[11px] text-cyan-200 block font-medium">Lucro Líquido</span>
                <span className="text-sm font-bold text-cyan-300 block mt-0.5">
                  {formatCurrency(liveMetrics.netProfit, currency)}
                </span>
                <span className="text-[10px] text-cyan-200/80 font-mono block">
                  {formatKz(liveMetrics.netProfit, usdtKzRate)}
                </span>
              </div>

              {/* Retorno Total (Aplicado + Lucro) */}
              <div className="bg-[#0f1b3b]/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Retorno Total</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {formatCurrency(liveMetrics.totalReturn, currency)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Aplicado + Lucro
                </span>
              </div>

              {/* Retorno Líquido Final */}
              <div className="bg-[#0f1b3b]/90 p-3 rounded-lg border border-blue-500/30">
                <span className="text-[11px] text-blue-200 block font-medium">Retorno Líquido</span>
                <span className="text-sm font-bold text-blue-300 block mt-0.5">
                  {formatCurrency(liveMetrics.netReturn, currency)}
                </span>
                <span className="text-[10px] text-amber-300 font-mono block">
                  {formatKz(liveMetrics.netReturn, usdtKzRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Date, Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Data da Execução <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-[#131f42] border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.date && <p className="text-xs text-rose-400">{errors.date}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Status da Ordem</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-sm bg-[#131f42] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="completed">Concluída (Lucro consolidado)</option>
                <option value="in_progress">Em Andamento (Ciclo ativo)</option>
                <option value="cancelled">Cancelada (Abortada)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Observações Estratégicas (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Par USDT/AOA com spread de 5.5% negociado na sessão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#131f42] border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingOrder ? 'Salvar Alterações' : 'Confirmar e Gravar Ordem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
