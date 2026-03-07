import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import type { Trade } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './PerformanceChart.css';

const PerformanceChart: React.FC = () => {
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const { authFetch } = useAuth();

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await authFetch('/api/trades');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setTrades(data.trades || data);
            } catch (err) {
                console.error('Error fetching trades:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrades();
    }, [authFetch]);

    const data = useMemo(() => {
        if (trades.length === 0) return [{ time: 'Now', equity: 10000, pnl: 0 }];

        const sorted = [...trades].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const initialEquity = 10000;
        let runningEquity = initialEquity;
        const points: { time: string; equity: number; pnl: number }[] = [
            { time: 'Start', equity: initialEquity, pnl: 0 },
        ];

        if (timeframe === 'daily') {
            const byDay = new Map<string, number>();
            sorted.forEach((t) => {
                const day = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                byDay.set(day, (byDay.get(day) || 0) + (t.pnl || 0));
            });
            byDay.forEach((pnl, day) => {
                runningEquity += pnl;
                points.push({ time: day, equity: runningEquity, pnl });
            });
        } else if (timeframe === 'weekly') {
            const byWeek = new Map<string, number>();
            sorted.forEach((t) => {
                const d = new Date(t.timestamp);
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                byWeek.set(label, (byWeek.get(label) || 0) + (t.pnl || 0));
            });
            byWeek.forEach((pnl, week) => {
                runningEquity += pnl;
                points.push({ time: `W ${week}`, equity: runningEquity, pnl });
            });
        } else {
            const byMonth = new Map<string, number>();
            sorted.forEach((t) => {
                const month = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                byMonth.set(month, (byMonth.get(month) || 0) + (t.pnl || 0));
            });
            byMonth.forEach((pnl, month) => {
                runningEquity += pnl;
                points.push({ time: month, equity: runningEquity, pnl });
            });
        }

        return points;
    }, [trades, timeframe]);

    const currentEquity = data[data.length - 1].equity;
    const initialEquity = data[0].equity;
    const totalPnL = currentEquity - initialEquity;
    const isPositive = totalPnL >= 0;

    return (
        <div className="performance-chart-container glass">
            <div className="chart-header">
                <div className="chart-info">
                    <h3 className="chart-title">Equity Curve</h3>
                    <div className={`chart-value ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}${totalPnL.toLocaleString()} <span>({((totalPnL / initialEquity) * 100).toFixed(2)}%)</span>
                    </div>
                </div>
                <div className="chart-toggles">
                    <button
                        className={`toggle-btn ${timeframe === 'daily' ? 'active' : ''}`}
                        onClick={() => setTimeframe('daily')}
                    >
                        Daily
                    </button>
                    <button
                        className={`toggle-btn ${timeframe === 'weekly' ? 'active' : ''}`}
                        onClick={() => setTimeframe('weekly')}
                    >
                        Weekly
                    </button>
                    <button
                        className={`toggle-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                        onClick={() => setTimeframe('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="chart-wrapper">
                {loading && trades.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350, color: 'rgba(255,255,255,0.5)' }}>
                        Loading chart data…
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-purple)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary-purple)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={['dataMin - 500', 'dataMax + 500']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 25, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5), 0 10px 30px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                            formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, 'Equity']}
                        />
                        <Area
                            type="monotone"
                            dataKey="equity"
                            stroke="var(--primary-purple)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEquity)"
                            animationDuration={1500}
                        />
                        <ReferenceLine y={initialEquity} stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default PerformanceChart;
