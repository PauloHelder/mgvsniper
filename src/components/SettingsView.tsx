import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  DollarSign,
  Download,
  RotateCcw,
  CheckCircle,
  Save,
  ShieldAlert,
  Database,
  Coins,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Tag,
  ArrowRightLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Currency, Order, TradeSession, User } from '../types';
import { exportDataAsJSON, exportOrdersAsCSV, resetSessions } from '../utils/storage';
import { formatCurrency, formatKz } from '../utils/calculations';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  orders: Order[];
  onResetData: () => void;
  sessions: TradeSession[];
  onUpdateSessions: (sessions: TradeSession[]) => void;
}

const COLOR_OPTIONS: { id: string; label: string; bg: string; text: string; border: string }[] = [
  { id: 'blue', label: 'Azul', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'amber', label: 'Âmbar / Dourado', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  { id: 'rose', label: 'Rosa / Vermelho', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  orders,
  onResetData,
  sessions,
  onUpdateSessions,
}) => {
  // Profile & Financials
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState<Currency>(user.currency);
  const [defaultFee, setDefaultFee] = useState<number>(user.defaultWithdrawalFee);
  const [usdtKzRate, setUsdtKzRate] = useState<number>(user.usdtKzRate || 950);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Session Management State
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionColor, setNewSessionColor] = useState('blue');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [sessionError, setSessionError] = useState('');

  const handleSaveProfileAndExchange = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      currency,
      defaultWithdrawalFee: defaultFee,
      usdtKzRate: Math.max(1, usdtKzRate || 950),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Add or Edit Session
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionError('');

    if (!newSessionName.trim()) {
      setSessionError('O nome da sessão é obrigatório.');
      return;
    }

    const trimmed = newSessionName.trim();
    const existing = sessions.find(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.id !== editingSessionId
    );
    if (existing) {
      setSessionError('Já existe uma sessão com este nome.');
      return;
    }

    if (editingSessionId) {
      // Editing
      const updated = sessions.map((s) =>
        s.id === editingSessionId
          ? {
              ...s,
              name: trimmed,
              color: newSessionColor,
              description: newSessionDescription.trim(),
            }
          : s
      );
      onUpdateSessions(updated);
      setEditingSessionId(null);
    } else {
      // Adding new
      const newSession: TradeSession = {
        id: `sess-${Date.now()}`,
        name: trimmed,
        color: newSessionColor,
        description: newSessionDescription.trim(),
      };
      onUpdateSessions([...sessions, newSession]);
    }

    // Reset form
    setNewSessionName('');
    setNewSessionColor('blue');
    setNewSessionDescription('');
    setIsAddingSession(false);
  };

  const handleStartEditSession = (s: TradeSession) => {
    setEditingSessionId(s.id);
    setNewSessionName(s.name);
    setNewSessionColor(s.color);
    setNewSessionDescription(s.description || '');
    setIsAddingSession(true);
    setSessionError('');
  };

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    const ordersWithThisSession = orders.filter((o) => o.session === sessionName).length;
    if (ordersWithThisSession > 0) {
      const confirmDelete = window.confirm(
        `Existem ${ordersWithThisSession} ordem(ns) vinculada(s) à "${sessionName}". Se excluir, essas ordens permanecerão no histórico. Deseja continuar?`
      );
      if (!confirmDelete) return;
    } else {
      if (!window.confirm(`Deseja excluir a sessão "${sessionName}"?`)) return;
    }

    onUpdateSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const handleResetSessions = () => {
    if (window.confirm('Deseja restaurar a lista padrão de sessões de trading (Londres, NY, Ásia, VIP Sniper, Matutina, Noturna)?')) {
      const reset = resetSessions();
      onUpdateSessions(reset);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          <span>Configurações do MVGSNIPER</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie a taxa de câmbio USDT - KZ, cadastre suas sessões operacionais e controle o perfil financeiro.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Configurações e taxa de câmbio salvas com sucesso!</span>
        </div>
      )}

      {/* 1. SEÇÃO DE CÂMBIO USDT - KZ (DESTAQUE ESPECIAL) */}
      <div className="bg-gradient-to-br from-[#0e1c3e] via-[#0f1d44] to-[#0a142c] border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Câmbio USDT - KZ (Kwanza Angolano)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono lowercase">
                  1 usdt = {usdtKzRate.toLocaleString('pt-AO')} kz
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Define a taxa de conversão utilizada no Dashboard, no histórico de ordens e nas projeções em Kwanza (Kz).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Input de Câmbio */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Taxa de Câmbio (1 USDT = ? Kz)</span>
              <span className="text-[11px] text-amber-400 font-semibold font-mono">Em Kwanza</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span className="text-blue-400 font-bold">1 USDT =</span>
              </div>
              <input
                type="number"
                step="any"
                min="1"
                value={usdtKzRate}
                onChange={(e) => setUsdtKzRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-24 pr-12 py-2.5 bg-[#14234c] border border-blue-500/40 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                Kz
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Digite a cotação real do mercado ou de transação P2P em Angola.
            </p>
          </div>

          {/* Simulador / Preview Rápido de Conversão */}
          <div className="lg:col-span-7 bg-[#0b1428]/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                Conversor em Tempo Real com a Taxa Atual
              </span>
              <span className="text-[10px] text-slate-400">Base USDT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#111e3b] border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">10 USDT</div>
                <div className="font-bold text-amber-300 font-mono mt-0.5">
                  {formatKz(10, usdtKzRate)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#111e3b] border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">100 USDT</div>
                <div className="font-bold text-amber-300 font-mono mt-0.5">
                  {formatKz(100, usdtKzRate)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#111e3b] border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">500 USDT</div>
                <div className="font-bold text-amber-300 font-mono mt-0.5">
                  {formatKz(500, usdtKzRate)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#111e3b] border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">1.000 USDT</div>
                <div className="font-bold text-amber-300 font-mono mt-0.5">
                  {formatKz(1000, usdtKzRate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GESTÃO DE SESSÕES (SOLICITADO PELO USUÁRIO) */}
      <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gestão de Sessões Operacionais
              </h3>
              <p className="text-xs text-slate-400">
                As sessões substituem categorias e são usadas para classificar, filtrar e analisar suas ordens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#142142] hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restaurar Padrões</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingSessionId(null);
                setNewSessionName('');
                setNewSessionColor('blue');
                setNewSessionDescription('');
                setIsAddingSession(!isAddingSession);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSession ? 'Fechar' : 'Nova Sessão'}</span>
            </button>
          </div>
        </div>

        {/* Form to Add or Edit Session */}
        {isAddingSession && (
          <form
            onSubmit={handleSaveSession}
            className="p-4 bg-[#122149] border border-blue-500/30 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                {editingSessionId ? 'Editar Sessão' : 'Cadastrar Nova Sessão Operacional'}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingSession(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            {sessionError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {sessionError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Nome da Sessão *</label>
                <input
                  type="text"
                  placeholder="Ex: Sessão Londres, Sessão VIP..."
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1630] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Cor do Indicador</label>
                <select
                  value={newSessionColor}
                  onChange={(e) => setNewSessionColor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1630] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Descrição Opcional</label>
                <input
                  type="text"
                  placeholder="Ex: Operações matinais de arbitragem..."
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1630] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSession(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingSessionId ? 'Atualizar Sessão' : 'Adicionar Sessão'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.map((sess) => {
            const count = orders.filter((o) => o.session === sess.name).length;
            const colorMeta = COLOR_OPTIONS.find((c) => c.id === sess.color) || COLOR_OPTIONS[0];

            return (
              <div
                key={sess.id}
                className="bg-[#122149]/50 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {sess.name}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditSession(sess)}
                        className="p-1 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors"
                        title="Editar sessão"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(sess.id, sess.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Excluir sessão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {sess.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ordens registradas:</span>
                  <span className="font-bold text-white font-mono">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PROFILE & PREFERENCES FORM */}
      <form
        onSubmit={handleSaveProfileAndExchange}
        className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider border-b border-slate-800 pb-3">
          <UserIcon className="w-4 h-4 text-blue-400" />
          <span>Dados do Perfil do Operador & Moeda</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Nome de Exibição</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Moeda Base de Operação</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            >
              <option value="USDT">Tether USDT (USDT)</option>
              <option value="USD">Dólar Americano ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="BRL">Real Brasileiro (R$ BRL)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Moeda principal de entrada das ordens. O Dashboard e relatórios exibirão sempre a conversão em Kz.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">
              Taxa Padrão Sugerida de Saque ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={defaultFee}
              onChange={(e) => setDefaultFee(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#131f42] border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Custo operacional sugerido ao abrir o formulário de nova ordem.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>

      {/* 4. BACKUP & GESTÃO DE DADOS */}
      <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Gestão & Exportação de Dados MVGSNIPER</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="bg-[#12214a]/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white">Backup Completo (JSON)</h4>
            <p className="text-xs text-slate-400">
              Faça o download de todos os seus dados, ordens cadastradas, sessões e cotações.
            </p>
            <button
              type="button"
              onClick={() => exportDataAsJSON(orders, user, sessions)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#152554] hover:bg-slate-700/60 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Baixar Backup JSON</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="bg-[#12214a]/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white">Planilha Financeira (CSV com Kz)</h4>
            <p className="text-xs text-slate-400">
              Exporte todas as {orders.length} ordens com colunas de Sessão e conversão em Kz para Excel.
            </p>
            <button
              type="button"
              onClick={() => exportOrdersAsCSV(orders, user)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#152554] hover:bg-slate-700/60 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Baixar Planilha CSV</span>
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Restaurar Dados Padrão de Exemplo
            </h4>
            <p className="text-xs text-slate-400">
              Recarrega as ordens reais da sniper, sessões e cotação de 950 Kz/USDT.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Tem certeza que deseja restaurar o banco de ordens e sessões para os dados de exemplo do MVGSNIPER?'
                )
              ) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Restaurar Amostra</span>
          </button>
        </div>
      </div>
    </div>
  );
};
