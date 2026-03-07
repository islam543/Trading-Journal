export type TradeDirection = 'BUY' | 'SELL';

export interface Trade {
    id: number;
    symbol: string;
    type: string;
    entryPrice: number;
    time: string | null;
    strategy: string | null;
    stopLoss: number | null;
    takeProfit: number | null;
    pnl: number | null;
    confluenceTags: string[];
    notes: string | null;
    imageUrl: string | null;
    timestamp: string;
}

export interface PaginatedTrades {
    trades: Trade[];
    total: number;
    page: number;
    totalPages: number;
}

export interface UserSettings {
    id: number;
    userId: number;
    theme: 'dark' | 'light';
    dashboardWidgets: DashboardWidgets;
    tradeCardVisibility: TradeCardVisibility;
    themeIntensity: ThemeIntensity;
}

export interface DashboardWidgets {
    metrics: boolean;
    performance: boolean;
    calendar: boolean;
    goals: boolean;
    recentActivity: boolean;
    distribution: boolean;
}

export interface TradeCardVisibility {
    entryPrice: boolean;
    stopLoss: boolean;
    takeProfit: boolean;
    pnl: boolean;
    strategy: boolean;
    confluenceTags: boolean;
    notes: boolean;
    image: boolean;
    time: boolean;
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
