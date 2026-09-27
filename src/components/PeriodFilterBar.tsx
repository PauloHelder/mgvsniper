import React from 'react';
import { Calendar, Filter, Search, RotateCcw, Layers } from 'lucide-react';
import { FilterOptions, OrderStatus, PeriodFilter, TradeSession } from '../types';

interface PeriodFilterBarProps {
  filter: FilterOptions;
  onFilterChange: (newFilter: FilterOptions) => void;
  sessions: TradeSession[];
}

export const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({
  filter,
  onFilterChange,
  sessions,
}) => {
  const periodButtons: { id: PeriodFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'today', label: 'Hoje' },
    { id: '7days', label: '7 Dias' },
    { id: '30days', label: '30 Dias' },
    { id: 'this_month', label: 'Este Mês' },
    { id: 'last_month', label: 'Mês Passado' },
    { id: 'this_year', label: 'Este Ano' },
    { id: 'custom', label: 'Personalizado' },
  ];

  const handlePeriodClick = (p: PeriodFilter) => {
    onFilterChange({ ...filter, period: p });
  };

  const handleReset = () => {
    onFilterChange({
      period: 'all',
      status: 'all',
      session: 'all',
      searchQuery: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const isFiltered =
    filter.period !== 'all' ||
    filter.status !== 'all' ||
    filter.session !== 'all' ||
    filter.searchQuery.trim() !== '' ||
    !!filter.startDate ||
    !!filter.endDate;

  return (
    <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-sm space-y-4">
      {/* Top row: Quick Period Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Filtro de Período:</span>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {periodButtons.map((btn) => {
            const isActive = filter.period === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => handlePeriodClick(btn.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                    : 'bg-[#152347] text-slate-300 hover:bg-[#1e2f5b] hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second row: Search, Status & SESSÃO (ao invés de Categoria) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, ativo ou sessão..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#131f42] border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Status Select */}
        <div className="md:col-span-2.5">
          <select
            value={filter.status}
            onChange={(e) =>
              onFilterChange({ ...filter, status: e.target.value as 'all' | OrderStatus })
            }
            className="w-full px-3 py-2 text-xs bg-[#131f42] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Status: Todos</option>
            <option value="completed">Concluída</option>
            <option value="in_progress">Em Andamento</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* SESSÃO (SUBSTITUIU CATEGORIA) */}
        <div className="md:col-span-2.5">
          <select
            value={filter.session}
            onChange={(e) => onFilterChange({ ...filter, session: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-[#131f42] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Sessão: Todas</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Custom date range if custom is selected */}
        {filter.period === 'custom' && (
          <div className="md:col-span-3 flex items-center gap-1.5">
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value })}
              className="w-1/2 px-2 py-1.5 text-xs bg-[#131f42] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              title="Data Inicial"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value })}
              className="w-1/2 px-2 py-1.5 text-xs bg-[#131f42] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              title="Data Final"
            />
          </div>
        )}

        {/* Clear filters button */}
        {isFiltered && (
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1a2952] hover:bg-slate-700/60 rounded-lg border border-slate-700/60 transition-colors"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
