import React, { useState, useMemo } from 'react';
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
import './PerformanceChart.css';

interface ChartData {
    time: string;
    equity: number;
    pnl: number;
}

const mockDailyData: ChartData[] = [
    { time: 'Jan 01', equity: 10000, pnl: 0 },
    { time: 'Jan 02', equity: 10250, pnl: 250 },
    { time: 'Jan 03', equity: 10100, pnl: -150 },
    { time: 'Jan 04', equity: 10450, pnl: 350 },
    { time: 'Jan 05', equity: 10800, pnl: 350 },
    { time: 'Jan 06', equity: 10600, pnl: -200 },
    { time: 'Jan 07', equity: 11200, pnl: 600 },
    { time: 'Jan 08', equity: 11100, pnl: -100 },
    { time: 'Jan 09', equity: 11500, pnl: 400 },
    { time: 'Jan 10', equity: 12000, pnl: 500 },
    { time: 'Jan 11', equity: 11800, pnl: -200 },
    { time: 'Jan 12', equity: 12450, pnl: 650 },
];

const mockWeeklyData: ChartData[] = [
    { time: 'Week 1', equity: 10000, pnl: 0 },
    { time: 'Week 2', equity: 10800, pnl: 800 },
    { time: 'Week 3', equity: 11500, pnl: 700 },
    { time: 'Week 4', equity: 12450, pnl: 950 },
];

const mockMonthlyData: ChartData[] = [
    { time: 'Oct', equity: 9000, pnl: -1000 },
    { time: 'Nov', equity: 9500, pnl: 500 },
    { time: 'Dec', equity: 10000, pnl: 500 },
    { time: 'Jan', equity: 12450, pnl: 2450 },
];

const PerformanceChart: React.FC = () => {
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const data = useMemo(() => {
        switch (timeframe) {
            case 'weekly': return mockWeeklyData;
            case 'monthly': return mockMonthlyData;
            default: return mockDailyData;
        }
    }, [timeframe]);

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
            </div>
        </div>
    );
};

export default PerformanceChart;
