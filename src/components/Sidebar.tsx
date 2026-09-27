import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Calculator,
  Settings,
  Target,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Sparkles,
  X,
  Coins,
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 'dashboard' | 'orders' | 'simulator' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: User;
  ordersCount: number;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  ordersCount,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Relatório geral & Kz',
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Ordens',
      icon: ReceiptText,
      badge: `${ordersCount}`,
      description: 'Gestão e histórico',
    },
    {
      id: 'simulator' as ActiveTab,
      label: 'Simulador',
      icon: Calculator,
      badge: 'Composto',
      description: 'Juros compostos',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Configurações',
      icon: Settings,
      badge: 'Câmbio/Sessões',
      description: 'Taxa Kz & Sessões',
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#091124] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#070e1e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Target className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <span className="text-base font-black text-white tracking-wider flex items-center gap-1.5">
                  MVGSNIPER
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-bold border border-blue-500/30">
                    V2
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 tracking-tight font-medium">
                  Trading & Gestão de Ordens
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Câmbio Ativo Mini Banner no Sidebar */}
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#0f1d3f] border border-blue-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Câmbio USDT-KZ</span>
                <span className="font-bold text-amber-300 font-mono text-xs">
                  1 USDT = {(user.usdtKzRate || 950).toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>
            <button
              onClick={() => handleNavClick('settings')}
              className="text-[10px] text-blue-400 hover:text-white underline font-semibold"
            >
              Ajustar
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:bg-[#121c38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'
                      }`}
                    />
                    <div className="text-left">
                      <div className="leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#182752] text-blue-300 border border-blue-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: User profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070e1e]">
          <div className="p-2.5 rounded-xl bg-[#0f1b3b] border border-slate-800 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'SN'}
              </div>
              <div className="overflow-hidden text-left">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-cyan-400 block truncate leading-tight font-mono">
                  {user.role || 'Investidor'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('settings')}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Configurações"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-xl border border-rose-900/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
