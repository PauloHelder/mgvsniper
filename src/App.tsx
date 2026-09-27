import React, { useState, useEffect, useMemo } from 'react';
import { Currency, FilterOptions, Order, TradeSession, User } from './types';
import {
  getStoredAuthStatus,
  getStoredOrders,
  getStoredSessions,
  getStoredUser,
  resetToDefaultData,
  saveAuthStatus,
  saveOrders,
  saveSessions,
  saveUser,
} from './utils/storage';
import { filterOrders } from './utils/calculations';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { PeriodFilterBar } from './components/PeriodFilterBar';
import { PeriodSummaryCards } from './components/PeriodSummaryCards';
import { OrderList } from './components/OrderList';
import { OrderModal } from './components/OrderModal';
import { SimulatorView } from './components/SimulatorView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getStoredAuthStatus());
  const [user, setUser] = useState<User>(() => getStoredUser());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [sessions, setSessions] = useState<TradeSession[]>(() => getStoredSessions());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Filter State (Central for Orders)
  const [filter, setFilter] = useState<FilterOptions>({
    period: 'all',
    status: 'all',
    session: 'all',
    searchQuery: '',
  });

  // Keep localStorage in sync
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveAuthStatus(isAuthenticated);
  }, [isAuthenticated]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return filterOrders(orders, filter);
  }, [orders, filter]);

  // Period label for summary display
  const periodLabelMap: { [key: string]: string } = {
    all: 'Todo o Histórico',
    today: 'Hoje',
    '7days': 'Últimos 7 dias',
    '30days': 'Últimos 30 dias',
    this_month: 'Este Mês',
    last_month: 'Mês Passado',
    this_year: 'Este Ano',
    custom:
      filter.startDate && filter.endDate
        ? `${filter.startDate} até ${filter.endDate}`
        : 'Intervalo Personalizado',
  };

  // Actions
  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (orderData: Partial<Order>) => {
    const defaultSession = sessions[0]?.name || 'Sessão Matutina';

    if (editingOrder) {
      // Update
      const updated = orders.map((o) =>
        o.id === editingOrder.id ? ({ ...o, ...orderData } as Order) : o
      );
      setOrders(updated);
    } else {
      // Create new
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        code: `ORD-${codeNumber}`,
        title: orderData.title || 'Operação Sniper',
        appliedAmount: orderData.appliedAmount || 0,
        profitPercentage: orderData.profitPercentage || 0,
        profitAmount: orderData.profitAmount || 0,
        withdrawalCost: orderData.withdrawalCost || 0,
        totalReturn: orderData.totalReturn || 0,
        netProfit: orderData.netProfit || 0,
        netReturn: orderData.netReturn || 0,
        date: orderData.date || new Date().toISOString().split('T')[0],
        status: orderData.status || 'completed',
        session: orderData.session || defaultSession,
        notes: orderData.notes,
      };
      setOrders([newOrder, ...orders]);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleDuplicateOrder = (order: Order) => {
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const duplicated: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      code: `ORD-${codeNumber}`,
      title: `${order.title} (Cópia)`,
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
    };
    setOrders([duplicated, ...orders]);
  };

  const handleQuickAddSession = (newSess: TradeSession) => {
    setSessions((prev) => [...prev, newSess]);
  };

  const handleApplySimulatorAsOrder = (
    initialCapital: number,
    profitPct: number,
    withdrawalCost: number
  ) => {
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const defaultSession = sessions[0]?.name || 'Sessão VIP Sniper';

    setEditingOrder({
      id: `ord-sim-${Date.now()}`,
      code: `ORD-${codeNumber}`,
      title: `Ordem Inicial - Planejamento Composto`,
      appliedAmount: initialCapital,
      profitPercentage: profitPct,
      withdrawalCost: withdrawalCost,
      profitAmount: initialCapital * (profitPct / 100),
      totalReturn: initialCapital + initialCapital * (profitPct / 100),
      netProfit: initialCapital * (profitPct / 100) - withdrawalCost,
      netReturn: initialCapital + initialCapital * (profitPct / 100) - withdrawalCost,
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      session: defaultSession,
      notes: 'Criada a partir da projeção do simulador de juros compostos',
    });
    setIsOrderModalOpen(true);
  };

  const handleResetData = () => {
    const reset = resetToDefaultData();
    setOrders(reset.orders);
    setUser(reset.user);
    setSessions(reset.sessions);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setUser((prev) => ({ ...prev, currency: newCurrency }));
  };

  // If not logged in, render the Auth View
  if (!isAuthenticated) {
    return <AuthView currentUser={user} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-100 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        ordersCount={orders.length}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          user={user}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNewOrder={handleOpenNewOrder}
          onSelectTab={setActiveTab}
          onCurrencyChange={handleCurrencyChange}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              user={user}
              sessions={sessions}
              onNavigateToOrders={() => setActiveTab('orders')}
              onNavigateToSimulator={() => setActiveTab('simulator')}
              onNavigateToSettings={() => setActiveTab('settings')}
              onOpenNewOrder={handleOpenNewOrder}
            />
          )}

          {/* TAB 2: ORDENS (HISTÓRICO + FILTROS POR PERÍODO + RESUMO FINANCEIRO) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Period Filter Bar */}
              <PeriodFilterBar
                filter={filter}
                onFilterChange={setFilter}
                sessions={sessions}
              />

              {/* Dynamic KPI Cards for the filtered period */}
              <PeriodSummaryCards
                orders={filteredOrders}
                currency={user.currency || 'USDT'}
                usdtKzRate={user.usdtKzRate || 950}
                periodLabel={periodLabelMap[filter.period]}
              />

              {/* Orders Table */}
              <OrderList
                orders={filteredOrders}
                allOrdersCount={orders.length}
                user={user}
                sessions={sessions}
                onOpenNewOrder={handleOpenNewOrder}
                onEditOrder={handleEditOrder}
                onDeleteOrder={handleDeleteOrder}
                onDuplicateOrder={handleDuplicateOrder}
              />
            </div>
          )}

          {/* TAB 3: SIMULADOR (JUROS COMPOSTOS ORDEM A ORDEM) */}
          {activeTab === 'simulator' && (
            <SimulatorView
              currency={user.currency || 'USDT'}
              usdtKzRate={user.usdtKzRate || 950}
              onApplyAsOrder={handleApplySimulatorAsOrder}
            />
          )}

          {/* TAB 4: CONFIGURAÇÕES (CÂMBIO USDT-KZ + GESTÃO DE SESSÕES + BACKUP) */}
          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={setUser}
              orders={orders}
              onResetData={handleResetData}
              sessions={sessions}
              onUpdateSessions={setSessions}
            />
          )}
        </main>
      </div>

      {/* Order Creation / Edit Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        editingOrder={editingOrder}
        currency={user.currency || 'USDT'}
        usdtKzRate={user.usdtKzRate || 950}
        defaultWithdrawalFee={user.defaultWithdrawalFee}
        sessions={sessions}
        onQuickAddSession={handleQuickAddSession}
      />
    </div>
  );
}
