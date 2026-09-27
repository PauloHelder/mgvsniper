import { Order, TradeSession, User } from '../types';
import { INITIAL_ORDERS, INITIAL_SESSIONS, INITIAL_USER } from './mockData';

const ORDERS_KEY = 'mvgsniper_orders_v2';
const USER_KEY = 'mvgsniper_user_v2';
const SESSIONS_KEY = 'mvgsniper_sessions_v2';
const AUTH_KEY = 'mvgsniper_is_authenticated_v2';

// Legacy keys for automatic migration if available
const LEGACY_ORDERS_KEY = 'naviorder_orders_v1';
const LEGACY_USER_KEY = 'naviorder_user_v1';

export const getStoredSessions = (): TradeSession[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SESSIONS;
  } catch (e) {
    console.error('Failed to load sessions from localStorage', e);
    return INITIAL_SESSIONS;
  }
};

export const saveSessions = (sessions: TradeSession[]): void => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
};

export const resetSessions = (): TradeSession[] => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
  return INITIAL_SESSIONS;
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      // Check legacy migration
      const legacyRaw = localStorage.getItem(LEGACY_ORDERS_KEY);
      if (legacyRaw) {
        try {
          const legacyOrders = JSON.parse(legacyRaw);
          const migrated: Order[] = legacyOrders.map((o: any) => ({
            ...o,
            session: o.session || o.category || 'Sessão Matutina',
          }));
          localStorage.setItem(ORDERS_KEY, JSON.stringify(migrated));
          return migrated;
        } catch {
          // ignore
        }
      }
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const orders: any[] = JSON.parse(raw);
    // Ensure all orders have a valid session
    return orders.map((o) => ({
      ...o,
      session: o.session || o.category || 'Sessão Matutina',
    }));
  } catch (e) {
    console.error('Failed to load orders from localStorage', e);
    return INITIAL_ORDERS;
  }
};

export const saveOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
};

export const getStoredUser = (): User => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      // Check legacy
      const legacyRaw = localStorage.getItem(LEGACY_USER_KEY);
      if (legacyRaw) {
        try {
          const legacyUser = JSON.parse(legacyRaw);
          const migratedUser: User = {
            ...INITIAL_USER,
            ...legacyUser,
            usdtKzRate: legacyUser.usdtKzRate || 950,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(migratedUser));
          return migratedUser;
        } catch {
          // ignore
        }
      }
      localStorage.setItem(USER_KEY, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_USER,
      ...parsed,
      usdtKzRate: parsed.usdtKzRate || 950,
    };
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
    return INITIAL_USER;
  }
};

export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user to localStorage', e);
  }
};

export const getStoredAuthStatus = (): boolean => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
};

export const saveAuthStatus = (status: boolean): void => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(status));
  } catch (e) {
    console.error('Failed to save auth status', e);
  }
};

export const resetToDefaultData = (): { orders: Order[]; user: User; sessions: TradeSession[] } => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(USER_KEY, JSON.stringify(INITIAL_USER));
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
  return { orders: INITIAL_ORDERS, user: INITIAL_USER, sessions: INITIAL_SESSIONS };
};

export const exportDataAsJSON = (orders: Order[], user: User, sessions: TradeSession[]): void => {
  const data = {
    appName: 'MVGSNIPER',
    exportedAt: new Date().toISOString(),
    user,
    sessions,
    orders,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mvgsniper-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportOrdersAsCSV = (orders: Order[], user: User): void => {
  const headers = [
    'Código',
    'Título',
    'Data',
    'Status',
    'Sessão',
    `Valor Aplicado (${user.currency})`,
    'Valor em Kz (Câmbio)',
    '% Lucro',
    `Lucro Bruto (${user.currency})`,
    `Custo Saque (${user.currency})`,
    `Lucro Líquido (${user.currency})`,
    'Lucro Líquido em Kz',
    `Retorno Total (${user.currency})`,
    `Retorno Líquido (${user.currency})`,
    'Retorno Líquido em Kz',
    'Notas',
  ];

  const rate = user.usdtKzRate || 950;

  const rows = orders.map((o) => [
    `"${o.code}"`,
    `"${o.title.replace(/"/g, '""')}"`,
    `"${o.date}"`,
    `"${o.status}"`,
    `"${(o.session || 'Geral').replace(/"/g, '""')}"`,
    o.appliedAmount.toFixed(2),
    (o.appliedAmount * rate).toFixed(2),
    o.profitPercentage.toFixed(2),
    o.profitAmount.toFixed(2),
    o.withdrawalCost.toFixed(2),
    o.netProfit.toFixed(2),
    (o.netProfit * rate).toFixed(2),
    o.totalReturn.toFixed(2),
    o.netReturn.toFixed(2),
    (o.netReturn * rate).toFixed(2),
    `"${(o.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mvgsniper-ordens-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
