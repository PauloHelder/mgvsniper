import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Copy,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FilterX,
  AlertTriangle,
  Layers,
  Coins,
} from 'lucide-react';
import { Currency, Order, OrderStatus, TradeSession, User } from '../types';
import { formatCurrency, formatDate, formatKz, formatPercent } from '../utils/calculations';
import { exportOrdersAsCSV } from '../utils/storage';

interface OrderListProps {
  orders: Order[];
  allOrdersCount: number;
  user: User;
  sessions: TradeSession[];
  onOpenNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onDuplicateOrder: (order: Order) => void;
}

type SortField = 'date' | 'appliedAmount' | 'profitPercentage' | 'netProfit' | 'totalReturn';
type SortOrder = 'asc' | 'desc';

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  allOrdersCount,
  user,
  sessions,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onDuplicateOrder,
}) => {
  const currency = user.currency || 'USDT';
  const kzRate = user.usdtKzRate || 950;

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteCandidate, setDeleteCandidate] = useState<Order | null>(null);
  const pageSize = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Concluída
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Em Andamento
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Cancelada
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0f1b3b]/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="p-4 sm:px-6 border-b border-slate-800 bg-[#0c1633] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Histórico de Ordens Operacionais</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono">
                {orders.length} de {allOrdersCount}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Valores calculados em {currency} com equivalência em Kz (Câmbio: {kzRate} Kz)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportOrdersAsCSV(orders, user)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#142142] hover:bg-slate-700/60 border border-slate-700 rounded-lg transition-colors shadow-sm"
            title="Exportar para Excel (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      {orders.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
            <FilterX className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            Nenhuma ordem encontrada para os filtros selecionados
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente ajustar o período ou a sessão operacional, ou cadastre uma nova ordem para começar.
          </p>
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Ordem
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b142c] text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código / Ativo</th>
                <th className="py-3 px-3">Sessão</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    <span>Data</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('appliedAmount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valor Aplicado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('profitPercentage')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Lucro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Lucro Bruto</th>
                <th className="py-3 px-3 text-right">Custo Saque</th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('netProfit')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lucro Líquido</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('totalReturn')}
                >
                  <div className="flex items-center justify-end gap-1" title="Valor Aplicado + Lucro">
                    <span>Retorno Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-blue-950/20 transition-colors group text-slate-200"
                >
                  {/* Title & Code */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                      <span>{order.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono text-blue-400/90">{order.code}</span>
                      {order.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px] text-slate-500" title={order.notes}>
                            {order.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* SESSÃO (SUBSTITUINDO CATEGORIA) */}
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>{order.session || 'Sessão Matutina'}</span>
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                    {formatDate(order.date)}
                  </td>

                  {/* Valor Aplicado + Kz */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-semibold text-slate-100">
                      {formatCurrency(order.appliedAmount, currency)}
                    </div>
                    <div className="text-[10px] font-mono text-amber-300 font-medium">
                      {formatKz(order.appliedAmount, kzRate)}
                    </div>
                  </td>

                  {/* % Lucro */}
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                    {formatPercent(order.profitPercentage)}
                  </td>

                  {/* Lucro Bruto */}
                  <td className="py-3.5 px-3 text-right text-emerald-400 font-medium">
                    +{formatCurrency(order.profitAmount, currency)}
                  </td>

                  {/* Custo Saque */}
                  <td className="py-3.5 px-3 text-right text-amber-400 font-medium">
                    -{formatCurrency(order.withdrawalCost, currency)}
                  </td>

                  {/* Lucro Líquido + Kz */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-bold text-cyan-300">
                      {formatCurrency(order.netProfit, currency)}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-200/80">
                      {formatKz(order.netProfit, kzRate)}
                    </div>
                  </td>

                  {/* Retorno Total (Aplicado + Lucro) */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-bold text-white">
                      {formatCurrency(order.totalReturn, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Líq: {formatCurrency(order.netReturn, currency)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">{getStatusBadge(order.status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDuplicateOrder(order)}
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Duplicar Ordem"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar Ordem"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteCandidate(order)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Excluir Ordem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {orders.length > pageSize && (
        <div className="px-6 py-3.5 bg-[#0b142c] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Mostrando {Math.min(orders.length, (currentPage - 1) * pageSize + 1)} a{' '}
            {Math.min(orders.length, currentPage * pageSize)} de {orders.length} ordens
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#142142] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-slate-200">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#142142] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0f1b3b] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Excluir Ordem Permanentemente?</h3>
                <p className="text-xs text-slate-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="p-3 bg-[#0a1226] rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-white font-semibold">{deleteCandidate.title}</div>
              <div className="text-slate-400 font-mono">
                {deleteCandidate.code} • {formatCurrency(deleteCandidate.appliedAmount, currency)}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteOrder(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20 transition-all"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
