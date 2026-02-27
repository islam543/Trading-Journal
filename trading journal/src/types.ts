export type TradeDirection = 'Buy' | 'Sell';

export interface Trade {
    id: number;
    symbol: string;
    type: string;
    entryPrice: number;
    exitPrice: number | null;
    quantity: number;
    pnl: number | null;
    status: string;
    notes: string | null;
    timestamp: string;
}

export interface DashboardMetrics {
    totalPnL: number;
    winRate: number;
    returnPercent: number;
    averageWin: number;
    averageLoss: number;
    totalTrades: number;
    maxDrawdown: number;
    profitFactor: number;
    recoveryFactor: number;
}

export interface DayPnL {
    date: string;
    netPnL: number;
    trades: number;
}

export interface GoalProgress {
    label: string;
    target: number;
    actual: number;
    percentage: number;
}

// News Types
export type ImpactLevel = 'High' | 'Medium' | 'Low';

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    time: string;
    impact: ImpactLevel;
    currency: string;
    forecast?: string;
    previous?: string;
    actual?: string;
}

// Settings Types
export type RiskFormat = 'percentage' | 'fixed';
export type ThemeIntensity = 'low' | 'medium' | 'high';

export interface AppSettings {
    themeIntensity: ThemeIntensity;
    defaultRiskFormat: RiskFormat;
    enabledTradeFields: {
        commission: boolean;
        rrRatio: boolean;
        confluences: boolean;
        imageUrl: boolean;
    };
    confluenceLabels: string[];
}

// FRED Types
export interface FredObservation {
    date: string;
    realtime_start: string;
    realtime_end: string;
    value: string;
}

export interface FredDataResponse {
    realtime_start: string;
    realtime_end: string;
    observation_start: string;
    observation_end: string;
    units: string;
    output_type: number;
    file_type: string;
    order_by: string;
    sort_order: string;
    count: number;
    offset: number;
    limit: number;
    observations: FredObservation[];
}

export interface MacroChartData {
    date: string;
    value: number;
}
