import type { Trade } from './types';

export const mockTrades: Trade[] = [
    {
        id: 1,
        symbol: 'BTC/USD',
        type: 'BUY',
        entryPrice: 42150.00,
        exitPrice: 43400.00,
        quantity: 0.1,
        pnl: 125.00,
        status: 'CLOSED',
        notes: 'Strong bullish momentum after breaking key resistance.',
        timestamp: '2026-01-25T10:00:00Z',
    },
    {
        id: 2,
        symbol: 'ETH/USD',
        type: 'SELL',
        entryPrice: 2750.00,
        exitPrice: 2775.00,
        quantity: 1.0,
        pnl: -25.00,
        status: 'CLOSED',
        notes: 'Bearish reversal pattern failed.',
        timestamp: '2026-01-24T15:30:00Z',
    }
];
