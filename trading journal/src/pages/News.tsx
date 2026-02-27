import { useState } from 'react';
import type { NewsItem, ImpactLevel } from '../types';
import './News.css';

// Mock news data
const mockNews: NewsItem[] = [
    // {
    //     id: '1',
    //     title: 'US Non-Farm Payrolls',
    //     date: '2026-01-26',
    //     time: '13:30',
    //     impact: 'High',
    //     currency: 'USD',
    //     forecast: '180K',
    //     previous: '216K',
    //     actual: '195K'
    // },
    // {
    //     id: '2',
    //     title: 'Federal Reserve Interest Rate Decision',
    //     date: '2026-01-26',
    //     time: '19:00',
    //     impact: 'High',
    //     currency: 'USD',
    //     forecast: '4.50%',
    //     previous: '4.50%'
    // },
    // {
    //     id: '3',
    //     title: 'ECB President Lagarde Speech',
    //     date: '2026-01-25',
    //     time: '14:00',
    //     impact: 'Medium',
    //     currency: 'EUR',
    //     previous: '-'
    // },
    // {
    //     id: '4',
    //     title: 'UK GDP Growth Rate',
    //     date: '2026-01-25',
    //     time: '09:30',
    //     impact: 'Medium',
    //     currency: 'GBP',
    //     forecast: '0.2%',
    //     previous: '0.1%',
    //     actual: '0.3%'
    // },
    // {
    //     id: '5',
    //     title: 'Japan CPI Year-over-Year',
    //     date: '2026-01-24',
    //     time: '23:30',
    //     impact: 'High',
    //     currency: 'JPY',
    //     forecast: '2.8%',
    //     previous: '2.6%',
    //     actual: '2.9%'
    // },
    // {
    //     id: '6',
    //     title: 'German Manufacturing PMI',
    //     date: '2026-01-24',
    //     time: '10:00',
    //     impact: 'Low',
    //     currency: 'EUR',
    //     forecast: '47.5',
    //     previous: '47.1',
    //     actual: '47.8'
    // }
];

const News = () => {
    const [filterImpact, setFilterImpact] = useState<ImpactLevel | 'All'>('All');
    const [filterDate, setFilterDate] = useState<string>('All');

    // Get unique dates
    const uniqueDates = Array.from(new Set(mockNews.map(item => item.date))).sort().reverse();

    // Filter news
    const filteredNews = mockNews.filter(item => {
        const matchesImpact = filterImpact === 'All' || item.impact === filterImpact;
        const matchesDate = filterDate === 'All' || item.date === filterDate;
        return matchesImpact && matchesDate;
    });

    // Group by date
    const groupedByDate = filteredNews.reduce((acc, item) => {
        if (!acc[item.date]) {
            acc[item.date] = [];
        }
        acc[item.date].push(item);
        return acc;
    }, {} as Record<string, NewsItem[]>);

    return (
        <div className="news-page">
            <div className="news-header">
                <div>
                    <h1 className="news-title">Economic Calendar</h1>
                    <p className="news-subtitle">Stay informed with key market events</p>
                </div>
            </div>

            {/* Filters */}
            <div className="news-filters glass">
                <div className="filter-group">
                    <label>Impact Level</label>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterImpact === 'All' ? 'active' : ''}`}
                            onClick={() => setFilterImpact('All')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn impact-high ${filterImpact === 'High' ? 'active' : ''}`}
                            onClick={() => setFilterImpact('High')}
                        >
                            High
                        </button>
                        <button
                            className={`filter-btn impact-medium ${filterImpact === 'Medium' ? 'active' : ''}`}
                            onClick={() => setFilterImpact('Medium')}
                        >
                            Medium
                        </button>
                        <button
                            className={`filter-btn impact-low ${filterImpact === 'Low' ? 'active' : ''}`}
                            onClick={() => setFilterImpact('Low')}
                        >
                            Low
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Date</label>
                    <select
                        className="filter-select glass"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="All">All Dates</option>
                        {uniqueDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* News Feed */}
            <div className="news-content">
                <div className="news-feed">
                    {Object.entries(groupedByDate).map(([date, items]) => (
                        <div key={date} className="news-date-group">
                            <h3 className="news-date-header">{formatDate(date)}</h3>
                            <div className="news-items">
                                {items.map(item => (
                                    <div key={item.id} className="news-item glass glass-hover">
                                        <div className="news-item-header">
                                            <div className="news-item-time">{item.time}</div>
                                            <div className={`news-item-impact impact-${item.impact.toLowerCase()}`}>
                                                {item.impact}
                                            </div>
                                            <div className="news-item-currency">{item.currency}</div>
                                        </div>
                                        <h4 className="news-item-title">{item.title}</h4>
                                        <div className="news-item-data">
                                            {item.forecast && (
                                                <div className="data-point">
                                                    <span className="data-label">Forecast:</span>
                                                    <span className="data-value">{item.forecast}</span>
                                                </div>
                                            )}
                                            {item.previous && (
                                                <div className="data-point">
                                                    <span className="data-label">Previous:</span>
                                                    <span className="data-value">{item.previous}</span>
                                                </div>
                                            )}
                                            {item.actual && (
                                                <div className="data-point">
                                                    <span className="data-label">Actual:</span>
                                                    <span className="data-value actual">{item.actual}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Analysis Panel - Future Ready */}
                <div className="ai-panel glass">
                    <div className="ai-panel-header">
                        <svg className="ai-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h3>AI Market Analysis</h3>
                    </div>
                    <div className="ai-panel-content">
                        <div className="coming-soon-badge">Coming Soon</div>
                        <p className="ai-panel-description">
                            Advanced AI-powered analysis will provide real-time insights on how economic events
                            may impact your trading instruments, with sentiment analysis and correlation predictions.
                        </p>
                        <div className="ai-features">
                            <div className="ai-feature">
                                <div className="feature-icon">📊</div>
                                <span>Event Impact Prediction</span>
                            </div>
                            <div className="ai-feature">
                                <div className="feature-icon">🎯</div>
                                <span>Sentiment Analysis</span>
                            </div>
                            <div className="ai-feature">
                                <div className="feature-icon">🔗</div>
                                <span>Correlation Mapping</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to format date
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

export default News;
