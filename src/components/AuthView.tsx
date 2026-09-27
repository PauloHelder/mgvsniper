import React, { useState } from 'react';
import {
  ShieldCheck,
  Calculator,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  DollarSign,
  Target,
  Coins,
} from 'lucide-react';
import { Currency, User } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  currentUser: User;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, currentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDT');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Por favor informe o seu nome para cadastro.');
      return;
    }

    const authenticatedUser: User = {
      ...currentUser,
      name: isLogin ? currentUser.name || 'Investidor Sniper' : name.trim(),
      email: email.trim(),
      currency,
    };

    onLoginSuccess(authenticatedUser);
  };

  const handleDemoAccess = () => {
    onLoginSuccess(currentUser);
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0f1d3f] border border-blue-500/30 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/40">
            <Target className="w-5 h-5 text-cyan-200" />
          </div>
          <span className="text-xl font-black text-white tracking-widest">
            MVGSNIPER
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
            PLATAFORMA SAAS
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Gestão precisa de ordens, sessões operacionais, câmbio USDT - KZ e simulador de juros compostos.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[#0d1733]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Toggle Login / Register */}
        <div className="grid grid-cols-2 p-1 bg-[#091124] rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              isLogin
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`py-2 rounded-xl transition-all ${
              !isLogin
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Seu nome ou apelido de trader"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#121f42] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="exemplo@mvgsniper.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#121f42] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Senha</label>
              {isLogin && (
                <a href="#recuperar" className="text-blue-400 hover:underline text-[11px]">
                  Esqueceu a senha?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#121f42] border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Moeda Base de Operação</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2.5 text-xs bg-[#121f42] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USDT">Tether USDT (USDT)</option>
                <option value="USD">Dólar Americano ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="BRL">Real Brasileiro (R$ BRL)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLogin ? 'Entrar no MVGSNIPER' : 'Criar Minha Conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Access Button */}
        <div className="relative border-t border-slate-800/80 pt-4">
          <div className="text-center mb-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Ambiente de Demonstração
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full py-2.5 px-4 bg-[#14234c] hover:bg-[#1a2f66] border border-blue-500/30 text-blue-200 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Acesso Rápido com Conta Demonstração</span>
          </button>
        </div>
      </div>

      {/* Trust & Highlights */}
      <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Câmbio USDT - KZ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gestão de Sessões</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-blue-400" />
          <span>Juros Compostos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Controle de Lucro Líquido</span>
        </div>
      </div>
    </div>
  );
};
