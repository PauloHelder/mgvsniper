import { Order, TradeSession, User } from '../types';
import { calculateOrderMetrics } from './calculations';

export const INITIAL_USER: User = {
  id: 'user-demo-1',
  name: 'Helder Santos',
  email: 'PPhelder@gmail.com',
  role: 'Trader Sniper Pro',
  currency: 'USDT',
  usdtKzRate: 950, // Câmbio 1 USDT = 950 Kz
  defaultWithdrawalFee: 5.0,
  createdAt: '2026-01-10T10:00:00Z',
};

export const INITIAL_SESSIONS: TradeSession[] = [
  {
    id: 'sess-1',
    name: 'Sessão Londres',
    color: 'blue',
    description: 'Abertura europeia, alto volume e volatilidade controlada',
    isDefault: true,
  },
  {
    id: 'sess-2',
    name: 'Sessão Nova York',
    color: 'cyan',
    description: 'Pico de liquidez do mercado americano e pares USD/USDT',
    isDefault: true,
  },
  {
    id: 'sess-3',
    name: 'Sessão Ásia',
    color: 'purple',
    description: 'Movimentações nos mercados de Tóquio, Hong Kong e Singapura',
    isDefault: true,
  },
  {
    id: 'sess-4',
    name: 'Sessão VIP Sniper',
    color: 'amber',
    description: 'Entradas de precisão máxima com estratégias de alto retorno',
    isDefault: true,
  },
  {
    id: 'sess-5',
    name: 'Sessão Matutina',
    color: 'emerald',
    description: 'Ordens matinais de arbitragem, swing rápido e operações P2P',
    isDefault: true,
  },
  {
    id: 'sess-6',
    name: 'Sessão Noturna',
    color: 'indigo',
    description: 'Fechamento diário, consolidações e ordens programadas',
    isDefault: true,
  },
];

const createMockOrder = (
  id: string,
  code: string,
  title: string,
  appliedAmount: number,
  profitPercentage: number,
  withdrawalCost: number,
  date: string,
  status: 'completed' | 'in_progress' | 'cancelled',
  session: string,
  notes?: string
): Order => {
  const metrics = calculateOrderMetrics(appliedAmount, profitPercentage, withdrawalCost);
  return {
    id,
    code,
    title,
    date,
    status,
    session,
    notes,
    ...metrics,
  };
};

export const INITIAL_ORDERS: Order[] = [
  createMockOrder(
    'ord-1',
    'ORD-7821',
    'Sniper Arbitragem USDT Flash',
    5000,
    6.5,
    10.0,
    '2026-09-26',
    'completed',
    'Sessão VIP Sniper',
    'Execução cirúrgica com spread favorável'
  ),
  createMockOrder(
    'ord-2',
    'ORD-7822',
    'Scalping de Alta Volatilidade NY',
    8200,
    7.8,
    15.0,
    '2026-09-25',
    'completed',
    'Sessão Nova York',
    'Operação realizada no pico de liquidez de NY'
  ),
  createMockOrder(
    'ord-3',
    'ORD-7823',
    'Rompimento de Suporte Londres',
    12000,
    8.2,
    20.0,
    '2026-09-24',
    'completed',
    'Sessão Londres',
    'Take profit alcançado na abertura de Frankfurt/Londres'
  ),
  createMockOrder(
    'ord-4',
    'ORD-7824',
    'Pool de Liquidez P2P Matutina',
    6500,
    5.4,
    8.0,
    '2026-09-22',
    'completed',
    'Sessão Matutina',
    'Fornecimento de liquidez com spread garantido'
  ),
  createMockOrder(
    'ord-5',
    'ORD-7825',
    'Entrada Noturna em Criptoativos',
    9400,
    4.5,
    12.0,
    '2026-09-20',
    'completed',
    'Sessão Noturna',
    'Fechamento de candles diários'
  ),
  createMockOrder(
    'ord-6',
    'ORD-7826',
    'Arbitragem Triangular Ásia',
    7800,
    6.0,
    10.0,
    '2026-09-18',
    'completed',
    'Sessão Ásia',
    'Operação no fuso horário asiático com baixa taxa'
  ),
  createMockOrder(
    'ord-7',
    'ORD-7827',
    'Ordem Sniper Alavancagem Controlada',
    15000,
    9.5,
    25.0,
    '2026-09-15',
    'completed',
    'Sessão VIP Sniper',
    'Excelente relação risco/retorno'
  ),
  createMockOrder(
    'ord-8',
    'ORD-7828',
    'Ciclo de 48h Câmbio Rápido',
    4200,
    5.0,
    5.0,
    '2026-09-12',
    'completed',
    'Sessão Londres',
    'Transferência rápida concluída'
  ),
  createMockOrder(
    'ord-9',
    'ORD-7829',
    'Posição em Execução NY Afternoon',
    10000,
    6.2,
    15.0,
    '2026-09-26',
    'in_progress',
    'Sessão Nova York',
    'Aguardando confirmação de target'
  ),
  createMockOrder(
    'ord-10',
    'ORD-7830',
    'Contrato Ativo VIP Sniper #2',
    11500,
    7.4,
    18.0,
    '2026-09-25',
    'in_progress',
    'Sessão VIP Sniper',
    'Ordem com trailing stop ajustado'
  ),
  createMockOrder(
    'ord-11',
    'ORD-7831',
    'Arbitragem Falha Rejeitada',
    3000,
    3.2,
    5.0,
    '2026-09-08',
    'cancelled',
    'Sessão Ásia',
    'Cancelada devido à variação do spread antes do fill'
  ),
];
