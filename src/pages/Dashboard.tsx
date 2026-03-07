import React, { useState, useEffect, useMemo } from 'react';
import type { Trade, DashboardMetrics, DayPnL, GoalProgress, DashboardWidgets } from '../types';
import MetricCard from '../components/MetricCard';
import PerformanceChart from '../components/PerformanceChart';
import CalendarView from '../components/CalendarView';
import GoalsSection from '../components/GoalsSection';
import { useAuth } from '../contexts/AuthContext';
import { Settings, X } from 'lucide-react';
import './Dashboard.css';

const defaultWidgets: DashboardWidgets = {
    metrics: true,
    performance: true,
    calendar: true,
    goals: true,
    recentActivity: true,
    distribution: true,
};

const widgetLabels: Record<keyof DashboardWidgets, string> = {
    metrics: 'Metrics Grid',
    performance: 'Performance Chart',
    calendar: 'Trading Calendar',
    goals: 'Goals Section',
    recentActivity: 'Recent Activity',
    distribution: 'Market Distribution',
};

const Dashboard: React.FC = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCustomize, setShowCustomize] = useState(false);
    const [widgets, setWidgets] = useState<DashboardWidgets>(() => {
        const saved = localStorage.getItem('dashboardWidgets');
        return saved ? JSON.parse(saved) : defaultWidgets;
    });
    const { authFetch } = useAuth();

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await authFetch('/api/trades?limit=100');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setTrades(data.trades || []);
            } catch (err) {
                console.error('Error fetching trades:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrades();
    }, [authFetch]);

    // Calculate dashboard metrics
    const metrics: DashboardMetrics = useMemo(() => {
        const totalTrades = trades.length;
        const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

        const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = trades.filter(t => (t.pnl || 0) < 0);

        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

        const averageWin = winningTrades.length > 0
            ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
            : 0;

        const averageLoss = losingTrades.length > 0
            ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
            : 0;

        // Calculate max drawdown
        let peak = 0;
        let maxDrawdown = 0;
        let runningPnL = 0;

        // Sort trades by date for drawdown calculation
        const sortedTrades = [...trades].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sortedTrades.forEach(trade => {
            runningPnL += (trade.pnl || 0);
            if (runningPnL > peak) {
                peak = runningPnL;
            }
            const drawdown = peak - runningPnL;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        });

        // Profit factor: gross profit / gross loss
        const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

        // Recovery factor: net profit / max drawdown
        const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : totalPnL > 0 ? 99.9 : 0;

        // Return % - assuming initial capital of $10,000
        const initialCapital = 10000;
        const returnPercent = (totalPnL / initialCapital) * 100;

        return {
            totalPnL,
            winRate,
            returnPercent,
            averageWin,
            averageLoss,
            totalTrades,
            maxDrawdown,
            profitFactor: Math.min(profitFactor, 99.9),
            recoveryFactor: Math.min(recoveryFactor, 99.9),
        };
    }, [trades]);

    // Calculate daily PnL for calendar
    const dailyPnL: DayPnL[] = useMemo(() => {
        const pnlByDate = new Map<string, { netPnL: number; trades: number }>();

        trades.forEach(trade => {
            const dateStr = new Date(trade.timestamp).toISOString().split('T')[0];
            const existing = pnlByDate.get(dateStr) || { netPnL: 0, trades: 0 };
            pnlByDate.set(dateStr, {
                netPnL: existing.netPnL + (trade.pnl || 0),
                trades: existing.trades + 1,
            });
        });

        return Array.from(pnlByDate.entries()).map(([date, data]) => ({
            date,
            netPnL: data.netPnL,
            trades: data.trades,
        }));
    }, [trades]);

    // Calculate goals progress
    const goals: GoalProgress[] = useMemo(() => {
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);

        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Weekly PnL
        const weeklyTrades = trades.filter(t => {
            const tradeDate = new Date(t.timestamp);
            return tradeDate >= currentWeekStart;
        });
        const weeklyPnL = weeklyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const weeklyTarget = 2000;
        const weeklyPercentage = (weeklyPnL / weeklyTarget) * 100;

        // Monthly PnL
        const monthlyTrades = trades.filter(t => {
            const tradeDate = new Date(t.timestamp);
            return tradeDate >= currentMonthStart;
        });
        const monthlyPnL = monthlyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const monthlyTarget = 8000;
        const monthlyPercentage = (monthlyPnL / monthlyTarget) * 100;

        return [
            {
                label: 'Weekly Goal',
                target: weeklyTarget,
                actual: weeklyPnL,
                percentage: weeklyPercentage,
            },
            {
                label: 'Monthly Goal',
                target: monthlyTarget,
                actual: monthlyPnL,
                percentage: monthlyPercentage,
            },
        ];
    }, [trades]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const toggleWidget = (key: keyof DashboardWidgets) => {
        const updated = { ...widgets, [key]: !widgets[key] };
        setWidgets(updated);
        localStorage.setItem('dashboardWidgets', JSON.stringify(updated));
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Track your trading performance and equity growth</p>
                </div>
                <button className="customize-btn" onClick={() => setShowCustomize(true)}>
                    <Settings size={18} />
                    <span>Customize</span>
                </button>
            </div>

            {showCustomize && (
                <div className="customize-overlay" onClick={() => setShowCustomize(false)}>
                    <div className="customize-modal" onClick={e => e.stopPropagation()}>
                        <div className="customize-header">
                            <h3>Customize Dashboard</h3>
                            <button className="customize-close" onClick={() => setShowCustomize(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <p className="customize-description">Toggle which widgets are visible on your dashboard.</p>
                        <div className="customize-options">
                            {(Object.keys(widgetLabels) as Array<keyof DashboardWidgets>).map(key => (
                                <label key={key} className="customize-option">
                                    <span>{widgetLabels[key]}</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" checked={widgets[key]} onChange={() => toggleWidget(key)} />
                                        <span className="toggle-slider"></span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {widgets.metrics && (
            <div className="metrics-grid">
                <MetricCard
                    title="Total Net P&L"
                    value={metrics.totalPnL}
                    type="currency"
                    sentiment={metrics.totalPnL > 0 ? 'positive' : metrics.totalPnL < 0 ? 'negative' : 'neutral'}
                />
                <MetricCard
                    title="Win Rate"
                    value={metrics.winRate}
                    type="percentage"
                    sentiment={metrics.winRate >= 50 ? 'positive' : 'negative'}
                />
                <MetricCard
                    title="Return %"
                    value={metrics.returnPercent}
                    type="percentage"
                    sentiment={metrics.returnPercent > 0 ? 'positive' : metrics.returnPercent < 0 ? 'negative' : 'neutral'}
                />
                <MetricCard
                    title="Average Win"
                    value={metrics.averageWin}
                    type="currency"
                    sentiment="positive"
                />
                <MetricCard
                    title="Average Loss"
                    value={metrics.averageLoss}
                    type="currency"
                    sentiment="negative"
                />
                <MetricCard
                    title="Total Trades"
                    value={metrics.totalTrades}
                    type="number"
                    sentiment="neutral"
                />
                <MetricCard
                    title="Max Drawdown"
                    value={metrics.maxDrawdown}
                    type="currency"
                    sentiment="negative"
                />
                <MetricCard
                    title="Profit Factor"
                    value={metrics.profitFactor}
                    type="number"
                    sentiment={metrics.profitFactor >= 2 ? 'positive' : metrics.profitFactor >= 1 ? 'neutral' : 'negative'}
                />
                <MetricCard
                    title="Recovery Factor"
                    value={metrics.recoveryFactor}
                    type="number"
                    sentiment={metrics.recoveryFactor >= 2 ? 'positive' : metrics.recoveryFactor >= 1 ? 'neutral' : 'negative'}
                />
            </div>
            )}

            {widgets.performance && (
            <div className="charts-section">
                <PerformanceChart />
            </div>
            )}

            {widgets.calendar && (
            <div className="calendar-section">
                <h2 className="section-title">Trading Calendar</h2>
                <CalendarView dailyPnL={dailyPnL} />
            </div>
            )}

            {widgets.goals && (
            <div className="goals-section">
                <GoalsSection goals={goals} />
            </div>
            )}

            <div className="secondary-grid">
                {widgets.recentActivity && (
                <div className="card glass recent-activity">
                    <h3>Recent Performance Highlights</h3>
                    <div className="highlight-item">
                        <span className="dot positive"></span>
                        <div className="highlight-content">
                            <p className="highlight-title">Best Day</p>
                            <p className="highlight-value">
                                +${Math.max(...dailyPnL.map(d => d.netPnL), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="highlight-item">
                        <span className="dot negative"></span>
                        <div className="highlight-content">
                            <p className="highlight-title">Max Drawdown</p>
                            <p className="highlight-value">-${metrics.maxDrawdown.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="highlight-item">
                        <span className="dot neutral"></span>
                        <div className="highlight-content">
                            <p className="highlight-title">Avg. Profit / Trade</p>
                            <p className="highlight-value">
                                +${(metrics.totalPnL / metrics.totalTrades).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                )}

                {widgets.distribution && (
                <div className="card glass trade-distribution">
                    <h3>Market Distribution</h3>
                    <div className="distribution-placeholder">
                        <p>Market exposure analytics coming soon...</p>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
