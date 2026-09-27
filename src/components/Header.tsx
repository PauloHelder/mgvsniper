import React from 'react';
import { Menu, Plus, Bell, Sparkles, Coins, Target } from 'lucide-react';
import { Currency, User } from '../types';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  user: User;
  onOpenMobileMenu: () => void;
  onOpenNewOrder: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onCurrencyChange: (currency: Currency) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  user,
  onOpenMobileMenu,
  onOpenNewOrder,
  onSelectTab,
  onCurrencyChange,
}) => {
  const titles: { [key in ActiveTab]: { title: string; subtitle: string } } = {
    dashboard: {
      title: 'Dashboard MVGSNIPER',
      subtitle: 'Relatório geral consolidado com valores convertidos em Kwanza (Kz)',
    },
    orders: {
      title: 'Gestão de Ordens & Sessões',
      subtitle: 'Controle de valor aplicado, lucro percentual, custo de saque e sessões operacionais',
    },
    simulator: {
      title: 'Simulador de Ordens & Juros Compostos',
      subtitle: 'Projeção exponencial reinvestindo percentagens ordem a ordem',
    },
    settings: {
      title: 'Configurações do Sistema',
      subtitle: 'Câmbio USDT - KZ, gestão de sessões e perfil do investidor',
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a1226]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-300 hover:text-white bg-[#111e3d] rounded-lg border border-slate-700/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight flex items-center gap-2">
            <span>{current.title}</span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block leading-none mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Currency Toggle & Câmbio Tag & New Order Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Câmbio tag rápida */}
        <div
          onClick={() => onSelectTab('settings')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0f1d3f] border border-amber-500/30 text-amber-300 text-xs font-mono font-bold cursor-pointer hover:bg-[#152756] transition-colors"
          title="Clique para editar taxa de câmbio nas configurações"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>1 USDT = {(user.usdtKzRate || 950).toLocaleString('pt-AO')} Kz</span>
        </div>

        {/* Currency Quick Selector */}
        <div className="flex items-center bg-[#0e172e] border border-slate-700/80 rounded-lg p-0.5 text-xs">
          {(['USDT', 'USD', 'EUR', 'BRL'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => onCurrencyChange(c)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                user.currency === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quick Simulator link if in Orders tab */}
        {activeTab === 'orders' && (
          <button
            onClick={() => onSelectTab('simulator')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/40 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador</span>
          </button>
        )}

        {/* Nova Ordem Button */}
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Ordem</span>
          <span className="sm:hidden">Ordem</span>
        </button>
      </div>
    </header>
  );
};
