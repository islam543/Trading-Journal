import { useState, useEffect } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, Info, AlertTriangle, Activity } from 'lucide-react';
import type { FredDataResponse, MacroChartData } from '../types';
import './MacroAnalysis.css';

const MacroAnalysis = () => {
    const [cpiData, setCpiData] = useState<MacroChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFredData = async () => {
            try {
                setLoading(true);
                // Note: In a real app, this would be your proxy endpoint
                // to avoid exposing the API key in the frontend.
                const res = await fetch('/api/fred?id=GNPCA');

                if (!res.ok) {
                    throw new Error('Failed to fetch FRED data. Ensure your backend proxy is running.');
                }

                const data: FredDataResponse = await res.json();

                // Process observations
                const formattedData: MacroChartData[] = data.observations
                    .filter(o => o.value !== '.') // Filter out missing data
                    .map(o => ({
                        date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        value: Number(o.value)
                    }))
                    .slice(-24); // Last 2 years

                setCpiData(formattedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching macro data:', err);
                setError('Unable to fetch live macro data. Please verify your FRED API configuration.');

                // Fallback mock data for demonstration
                const mockData: MacroChartData[] = Array.from({ length: 12 }, (_, i) => ({
                    date: `M${i + 1}`,
                    value: 300 + (Math.random() * 20)
                }));
                setCpiData(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchFredData();
    }, []);

    return (
        <div className="macro-page">
            <div className="macro-header">
                <div>
                    <h1 className="macro-title">Macro Regime Analysis</h1>
                    <p className="macro-subtitle">Fundamental context and long-term economic bias</p>
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

            <div className="macro-grid">
                {/* Main Trend Chart */}
                <div className="macro-card glass chart-card span-8">
                    <div className="card-header">
                        <div className="header-left">
                            <TrendingUp className="header-icon" />
                            <h3>Consumer Price Index (CPI)</h3>
                        </div>
                        <div className="timeframe-selector">
                            <button className="active">2Y</button>
                            <button>5Y</button>
                            <button>MAX</button>
                        </div>
                    </div>
                    <div className="chart-container">
                        {loading ? (
                            <div className="chart-loader">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={cpiData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    />
                                    <YAxis
                                        hide
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(23, 23, 23, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        itemStyle={{ color: 'var(--accent-primary)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--accent-primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Analysis Panel */}
                <div className="macro-card glass analysis-card span-4">
                    <div className="card-header">
                        <Info className="header-icon" />
                        <h3>Regime Detection</h3>
                    </div>
                    <div className="analysis-content">
                        <div className="regime-status">
                            <span className="status-label">Current Bias</span>
                            <span className="status-value bullish">Strong Risk-On</span>
                        </div>
                        <div className="analysis-notes">
                            <p>Inflation shows signs of cooling while employment remains robust.</p>
                            <ul className="analysis-list">
                                <li><strong>Asset Bias:</strong> Equity Bullish / USD Bearish</li>
                                <li><strong>Key Level:</strong> 3.1% YoY Target</li>
                                <li><strong>Volatility:</strong> Low-Moderate</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Insight Box */}
                <div className="macro-card glass insight-card span-12">
                    <div className="insight-grid">
                        <div className="insight-item">
                            <span className="insight-label">Inflation Momentum</span>
                            <span className="insight-value neutral">Neutral</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Monetary Policy</span>
                            <span className="insight-value bearish">Tightening</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Growth (GDP)</span>
                            <span className="insight-value bullish">Expanding</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Market Sentiment</span>
                            <span className="insight-value bullish">Greed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroAnalysis;
