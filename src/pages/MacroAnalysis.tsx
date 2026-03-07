import { useState, useEffect, useCallback } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, Info, AlertTriangle, Activity, Brain, CheckSquare, Square } from 'lucide-react';
import type { FredDataResponse, MacroChartData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './MacroAnalysis.css';

interface FredSeries {
    id: string;
    name: string;
    description: string;
    color: string;
}

const FRED_SERIES: FredSeries[] = [
    { id: 'CPIAUCSL', name: 'CPI (All Urban)', description: 'Consumer Price Index', color: '#a855f7' },
    { id: 'FEDFUNDS', name: 'Fed Funds Rate', description: 'Federal Funds Rate', color: '#3b82f6' },
    { id: 'UNRATE', name: 'Unemployment', description: 'Unemployment Rate', color: '#ef4444' },
    { id: 'GDP', name: 'GDP', description: 'Gross Domestic Product', color: '#22c55e' },
    { id: 'DGS10', name: '10Y Treasury', description: '10-Year Treasury Yield', color: '#f59e0b' },
    { id: 'M2SL', name: 'M2 Money Supply', description: 'M2 Money Stock', color: '#06b6d4' },
];

type Timeframe = '1Y' | '5Y' | 'MAX';

interface SeriesData {
    raw: MacroChartData[];
    filtered: MacroChartData[];
    latest: number | null;
    trend: 'up' | 'down' | 'flat';
}

const filterByTimeframe = (data: MacroChartData[], tf: Timeframe): MacroChartData[] => {
    if (tf === 'MAX') return data;
    const now = new Date();
    const cutoff = new Date(now);
    if (tf === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
    if (tf === '5Y') cutoff.setFullYear(now.getFullYear() - 5);
    return data.filter(d => new Date(d.rawDate || d.date) >= cutoff);
};

const detectTrend = (data: MacroChartData[]): 'up' | 'down' | 'flat' => {
    if (data.length < 3) return 'flat';
    const recent = data.slice(-6);
    const first = recent[0]?.value ?? 0;
    const last = recent[recent.length - 1]?.value ?? 0;
    const change = ((last - first) / Math.abs(first || 1)) * 100;
    if (change > 1) return 'up';
    if (change < -1) return 'down';
    return 'flat';
};

const detectRegime = (seriesMap: Map<string, SeriesData>): { bias: string; class: string } => {
    const cpi = seriesMap.get('CPIAUCSL');
    const fed = seriesMap.get('FEDFUNDS');
    const gdp = seriesMap.get('GDP');
    const unemp = seriesMap.get('UNRATE');

    let score = 0;
    if (gdp?.trend === 'up') score += 2;
    if (gdp?.trend === 'down') score -= 2;
    if (unemp?.trend === 'down') score += 1;
    if (unemp?.trend === 'up') score -= 1;
    if (cpi?.trend === 'down') score += 1;
    if (cpi?.trend === 'up') score -= 1;
    if (fed?.trend === 'down') score += 1;
    if (fed?.trend === 'up') score -= 1;

    if (score >= 3) return { bias: 'Strong Risk-On', class: 'bullish' };
    if (score >= 1) return { bias: 'Mild Risk-On', class: 'bullish' };
    if (score <= -3) return { bias: 'Strong Risk-Off', class: 'bearish' };
    if (score <= -1) return { bias: 'Mild Risk-Off', class: 'bearish' };
    return { bias: 'Neutral', class: 'neutral' };
};

interface MacroChartDataExtended extends MacroChartData {
    rawDate?: string;
}

const MacroAnalysis = () => {
    const [seriesMap, setSeriesMap] = useState<Map<string, SeriesData>>(new Map());
    const [activeSeries, setActiveSeries] = useState<string>('CPIAUCSL');
    const [timeframe, setTimeframe] = useState<Timeframe>('5Y');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedForAI, setSelectedForAI] = useState<Set<string>>(new Set());
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const { authFetch } = useAuth();

    const fetchAllSeries = useCallback(async () => {
        setLoading(true);
        const newMap = new Map<string, SeriesData>();

        await Promise.allSettled(
            FRED_SERIES.map(async (series) => {
                try {
                    const res = await fetch(`/api/fred?id=${series.id}`);
                    if (!res.ok) throw new Error(`Failed to fetch ${series.id}`);
                    const data: FredDataResponse = await res.json();

                    const formatted: MacroChartDataExtended[] = data.observations
                        .filter(o => o.value !== '.')
                        .map(o => ({
                            date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                            rawDate: o.date,
                            value: Number(o.value),
                        }));

                    const filtered = filterByTimeframe(formatted, timeframe);
                    newMap.set(series.id, {
                        raw: formatted,
                        filtered,
                        latest: formatted.length > 0 ? formatted[formatted.length - 1].value : null,
                        trend: detectTrend(formatted),
                    });
                } catch {
                    // Series failed to load — skip
                }
            })
        );

        setSeriesMap(newMap);
        setLoading(false);
        if (newMap.size === 0) {
            setError('Unable to fetch live macro data. Please verify your FRED API configuration.');
        } else {
            setError(null);
        }
    }, [timeframe]);

    useEffect(() => {
        fetchAllSeries();
    }, [fetchAllSeries]);

    // Re-filter when timeframe changes
    useEffect(() => {
        setSeriesMap(prev => {
            const updated = new Map(prev);
            updated.forEach((data, key) => {
                updated.set(key, {
                    ...data,
                    filtered: filterByTimeframe(data.raw as MacroChartDataExtended[], timeframe),
                });
            });
            return updated;
        });
    }, [timeframe]);

    const toggleAISelection = (seriesId: string) => {
        setSelectedForAI(prev => {
            const next = new Set(prev);
            if (next.has(seriesId)) next.delete(seriesId);
            else next.add(seriesId);
            return next;
        });
    };

    const handleAIAnalysis = async () => {
        if (selectedForAI.size === 0) return;
        setAiLoading(true);
        setAiAnalysis(null);

        const indicators = Array.from(selectedForAI).map(id => {
            const series = FRED_SERIES.find(s => s.id === id);
            const data = seriesMap.get(id);
            return {
                name: series?.name || id,
                description: series?.description || '',
                latestValue: data?.latest,
                trend: data?.trend,
                recentData: data?.filtered?.slice(-12).map(d => ({ date: d.date, value: d.value })),
            };
        });

        try {
            const res = await authFetch('/api/ai-macro-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ indicators }),
            });
            if (!res.ok) throw new Error('AI analysis failed');
            const result = await res.json();
            setAiAnalysis(result);
        } catch (err) {
            console.error('AI analysis error:', err);
            setAiAnalysis({ summary: 'Analysis failed. Please try again.', regime: 'Unknown', impacts: [], keyInsights: [] });
        } finally {
            setAiLoading(false);
        }
    };

    const activeSeriesConfig = FRED_SERIES.find(s => s.id === activeSeries);
    const activeData = seriesMap.get(activeSeries);
    const regime = detectRegime(seriesMap);

    return (
        <div className="macro-page">
            <div className="macro-header">
                <div>
                    <h1 className="macro-title">FRED Macro Dashboard</h1>
                    <p className="macro-subtitle">Economic indicators with regime detection & AI analysis</p>
                </div>
                <div className="macro-status glass">
                    <Activity size={16} className="status-icon pulse" />
                    <span>Live FRED Monitoring</span>
                </div>
            </div>

            {error && (
                <div className="macro-alert glass alert-warning">
                    <AlertTriangle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Series Selector Tabs */}
            <div className="series-tabs">
                {FRED_SERIES.map(series => {
                    const data = seriesMap.get(series.id);
                    const isSelected = selectedForAI.has(series.id);
                    return (
                        <div
                            key={series.id}
                            className={`series-tab glass ${activeSeries === series.id ? 'active' : ''}`}
                        >
                            <button
                                className="series-tab-checkbox"
                                onClick={(e) => { e.stopPropagation(); toggleAISelection(series.id); }}
                                title="Select for AI analysis"
                            >
                                {isSelected ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                            </button>
                            <button
                                className="series-tab-content"
                                onClick={() => setActiveSeries(series.id)}
                            >
                                <span className="series-tab-name">{series.name}</span>
                                <span className="series-tab-value" style={{ color: series.color }}>
                                    {data?.latest != null ? data.latest.toFixed(2) : '—'}
                                </span>
                                <span className={`series-tab-trend ${data?.trend || 'flat'}`}>
                                    {data?.trend === 'up' ? '▲' : data?.trend === 'down' ? '▼' : '—'}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* AI Analyze Button */}
            {selectedForAI.size > 0 && (
                <div className="ai-analyze-bar glass">
                    <span>{selectedForAI.size} indicator{selectedForAI.size > 1 ? 's' : ''} selected</span>
                    <button
                        className="ai-analyze-btn"
                        onClick={handleAIAnalysis}
                        disabled={aiLoading}
                    >
                        <Brain size={16} />
                        {aiLoading ? 'Analyzing...' : 'Analyze Impact on NASDAQ, GOLD, EURUSD'}
                    </button>
                </div>
            )}

            {/* AI Analysis Result */}
            {aiAnalysis && (
                <div className="ai-analysis-result glass">
                    <div className="ai-result-header">
                        <Brain size={20} />
                        <h3>AI Macro Analysis</h3>
                        <span className={`regime-badge ${aiAnalysis.regime?.toLowerCase().includes('risk-on') ? 'bullish' : aiAnalysis.regime?.toLowerCase().includes('risk-off') ? 'bearish' : 'neutral'}`}>
                            {aiAnalysis.regime || 'Neutral'}
                        </span>
                    </div>
                    <p className="ai-summary">{aiAnalysis.summary}</p>

                    {aiAnalysis.impacts && aiAnalysis.impacts.length > 0 && (
                        <div className="ai-impacts-grid">
                            {aiAnalysis.impacts.map((impact: any, idx: number) => (
                                <div key={idx} className="ai-impact-card">
                                    <span className="impact-asset">{impact.asset}</span>
                                    <span className={`impact-direction ${impact.direction?.toLowerCase()}`}>
                                        {impact.direction}
                                    </span>
                                    <p className="impact-reasoning">{impact.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
                        <div className="ai-insights">
                            <h4>Key Insights</h4>
                            <ul>
                                {aiAnalysis.keyInsights.map((insight: string, idx: number) => (
                                    <li key={idx}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="macro-grid">
                {/* Main Trend Chart */}
                <div className="macro-card glass chart-card span-8">
                    <div className="card-header">
                        <div className="header-left">
                            <TrendingUp className="header-icon" style={{ color: activeSeriesConfig?.color }} />
                            <h3>{activeSeriesConfig?.description || 'Economic Indicator'}</h3>
                        </div>
                        <div className="timeframe-selector">
                            {(['1Y', '5Y', 'MAX'] as Timeframe[]).map(tf => (
                                <button
                                    key={tf}
                                    className={timeframe === tf ? 'active' : ''}
                                    onClick={() => setTimeframe(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="chart-container">
                        {loading ? (
                            <div className="chart-loader">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={activeData?.filtered || []}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={activeSeriesConfig?.color || '#a855f7'} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={activeSeriesConfig?.color || '#a855f7'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                        domain={['auto', 'auto']}
                                        width={60}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(23, 23, 23, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        itemStyle={{ color: activeSeriesConfig?.color || '#a855f7' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={activeSeriesConfig?.color || '#a855f7'}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        animationDuration={800}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="macro-card glass analysis-card span-4">
                    <div className="card-header">
                        <div className="header-left">
                            <Info className="header-icon" />
                            <h3>Regime Detection</h3>
                        </div>
                    </div>
                    <div className="analysis-content">
                        <div className="regime-status">
                            <span className="status-label">Current Bias</span>
                            <span className={`status-value ${regime.class}`}>{regime.bias}</span>
                        </div>
                        <div className="analysis-notes">
                            <ul className="analysis-list">
                                {FRED_SERIES.slice(0, 4).map(series => {
                                    const data = seriesMap.get(series.id);
                                    return (
                                        <li key={series.id}>
                                            <strong>{series.name}:</strong>{' '}
                                            {data?.latest != null ? data.latest.toFixed(2) : 'N/A'}{' '}
                                            <span className={`trend-indicator ${data?.trend || 'flat'}`}>
                                                ({data?.trend === 'up' ? '↑ Rising' : data?.trend === 'down' ? '↓ Falling' : '→ Stable'})
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Insight Box */}
                <div className="macro-card glass insight-card span-12">
                    <div className="insight-grid">
                        {FRED_SERIES.map(series => {
                            const data = seriesMap.get(series.id);
                            const trendClass = data?.trend === 'up' ? 'bullish' : data?.trend === 'down' ? 'bearish' : 'neutral';
                            return (
                                <div key={series.id} className="insight-item">
                                    <span className="insight-label">{series.name}</span>
                                    <span className={`insight-value ${trendClass}`}>
                                        {data?.latest != null ? data.latest.toFixed(2) : '—'}
                                    </span>
                                    <span className={`insight-trend ${trendClass}`}>
                                        {data?.trend === 'up' ? '↑ Rising' : data?.trend === 'down' ? '↓ Falling' : '→ Stable'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroAnalysis;
