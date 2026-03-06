import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Zap, Shield, BarChart3, Brain, RefreshCw, AlertTriangle } from 'lucide-react';
import type { NewsItem, ImpactLevel } from '../types';
import './News.css';

const News = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filterImpact, setFilterImpact] = useState<ImpactLevel | 'All'>('All');
    const [filterDate, setFilterDate] = useState<string>('All');

    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Store raw items for URL linking
    const [rawItems, setRawItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news');
                if (!response.ok) throw new Error('Failed to fetch news');
                const data = await response.json();
                const items = Array.isArray(data) ? data : [];
                setRawItems(items);

                const formattedNews: NewsItem[] = items
                    .map((item: any, index: number) => {
                        const dt = item.datetime ? new Date(item.datetime * 1000) : new Date();
                        const dateStr = dt.toISOString().split('T')[0];
                        const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                        const cat = (item.category || '').toLowerCase();
                        const impact: ImpactLevel =
                            cat === 'top news' || cat === 'general' ? 'High' :
                            cat === 'forex' || cat === 'merger' ? 'Medium' : 'Low';

                        return {
                            id: String(item.id || index),
                            title: item.headline || 'Untitled',
                            date: dateStr,
                            time: timeStr,
                            impact,
                            currency: item.source || 'Market',
                            forecast: item.summary || undefined,
                            previous: item.source || undefined,
                            actual: item.url || undefined,
                        };
                    });

                setNews(formattedNews);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const requestAiAnalysis = async () => {
        if (news.length === 0) return;
        setAiLoading(true);
        setAiError(null);
        try {
            const eventsForAnalysis = news.slice(0, 10).map(item => ({
                title: item.title,
                date: item.date,
                time: item.time,
                impact: item.impact,
                source: item.currency,
            }));
            const res = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: eventsForAnalysis }),
            });
            if (!res.ok) throw new Error('AI analysis unavailable. Ensure GROQ_API_KEY is in .env');
            const data = await res.json();
            setAiAnalysis(data);
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'AI analysis failed');
        } finally {
            setAiLoading(false);
        }
    };

    const uniqueDates = Array.from(new Set(news.map(item => item.date))).sort().reverse();

    const filteredNews = news.filter(item => {
        const matchesImpact = filterImpact === 'All' || item.impact === filterImpact;
        const matchesDate = filterDate === 'All' || item.date === filterDate;
        return matchesImpact && matchesDate;
    });

    const groupedByDate = filteredNews.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {} as Record<string, NewsItem[]>);

    const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

    const toggleEvent = (idx: number) => {
        setExpandedEvents(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const SentimentIcon = ({ sentiment, size = 18 }: { sentiment: string; size?: number }) => {
        const s = (sentiment || '').toLowerCase();
        if (s === 'bullish') return <TrendingUp size={size} className="icon-bullish" />;
        if (s === 'bearish') return <TrendingDown size={size} className="icon-bearish" />;
        return <Minus size={size} className="icon-neutral" />;
    };

    const ImpactIcon = ({ impact }: { impact: string }) => {
        const i = (impact || '').toLowerCase();
        if (i === 'high') return <Zap size={13} />;
        if (i === 'medium') return <BarChart3 size={13} />;
        return <Shield size={13} />;
    };

    const hasValidAnalysis = aiAnalysis
        && typeof aiAnalysis === 'object'
        && aiAnalysis.overallSentiment
        && aiAnalysis.overallSentiment !== 'N/A';

    return (
        <div className="news-page">
            {/* Hero Header */}
            <div className="news-hero">
                <div className="news-hero-content">
                    <div className="news-hero-badge">
                        <span className="pulse-dot"></span>
                        LIVE FEED
                    </div>
                    <h1 className="news-title">Market Intelligence</h1>
                    <p className="news-subtitle">Real-time market news powered by Finnhub</p>
                </div>
                <div className="news-hero-stats">
                    <div className="hero-stat">
                        <span className="hero-stat-value">{news.length}</span>
                        <span className="hero-stat-label">Headlines</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-value">{uniqueDates.length}</span>
                        <span className="hero-stat-label">Days</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-value">{news.filter(n => n.impact === 'High').length}</span>
                        <span className="hero-stat-label">High Impact</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="news-filter-bar glass">
                <div className="filter-group">
                    <label>Category</label>
                    <div className="filter-pills">
                        {(['All', 'High', 'Medium', 'Low'] as const).map(level => (
                            <button
                                key={level}
                                className={`filter-pill ${level !== 'All' ? `pill-${level.toLowerCase()}` : ''} ${filterImpact === level ? 'active' : ''}`}
                                onClick={() => setFilterImpact(level)}
                            >
                                {level === 'All' ? '✦ All' : level === 'High' ? '🔥 Breaking' : level === 'Medium' ? '📊 Markets' : '📋 General'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-group">
                    <label>Timeline</label>
                    <select
                        className="filter-select"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    >
                        <option value="All">All Dates</option>
                        {uniqueDates.map(date => (
                            <option key={date} value={date}>{formatDateShort(date)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="news-layout">
                {/* News Feed */}
                <div className="news-feed-container">
                    {loading && (
                        <div className="news-skeleton">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton-card glass">
                                    <div className="skeleton-line skeleton-title"></div>
                                    <div className="skeleton-line skeleton-text"></div>
                                    <div className="skeleton-line skeleton-text short"></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <div className="news-error-card glass">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="btn-retry">Retry</button>
                        </div>
                    )}
                    {!loading && !error && news.length === 0 && (
                        <div className="news-empty-state glass">
                            <span className="empty-icon">📡</span>
                            <h3>No signals detected</h3>
                            <p>Market news will appear here once available.</p>
                        </div>
                    )}

                    {Object.entries(groupedByDate).map(([date, items]) => (
                        <div key={date} className="news-date-section">
                            <div className="date-header">
                                <div className="date-line"></div>
                                <span className="date-badge">{formatDate(date)}</span>
                                <div className="date-line"></div>
                            </div>
                            <div className="news-cards">
                                {items.map(item => (
                                    <article
                                        key={item.id}
                                        className="news-card glass"
                                        onClick={() => item.actual && window.open(item.actual, '_blank')}
                                        style={{ cursor: item.actual ? 'pointer' : 'default' }}
                                    >
                                        <div className="news-card-accent" data-impact={item.impact.toLowerCase()}></div>
                                        <div className="news-card-body">
                                            <div className="news-card-meta">
                                                <span className="news-time">{item.time}</span>
                                                <span className={`news-badge badge-${item.impact.toLowerCase()}`}>
                                                    {item.impact === 'High' ? '🔥' : item.impact === 'Medium' ? '📊' : '📋'} {item.impact}
                                                </span>
                                                <span className="news-source">{item.currency}</span>
                                            </div>
                                            <h3 className="news-card-title">{item.title}</h3>
                                            {item.forecast && (
                                                <p className="news-card-summary">{item.forecast.length > 180 ? item.forecast.substring(0, 180) + '...' : item.forecast}</p>
                                            )}
                                            {item.actual && (
                                                <div className="news-card-link">
                                                    Read full article →
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Market Analysis Panel */}
                <aside className="ai-sidebar">
                    <div className="ai-card glass">
                        {/* Header */}
                        <div className="ai-card-header">
                            <div className="ai-logo">
                                <div className="ai-logo-ring"></div>
                                <Brain size={18} className="ai-logo-icon" />
                            </div>
                            <div>
                                <h3>AI Market Analysis</h3>
                                <span className="ai-model-tag">Llama 3.1 · Groq</span>
                            </div>
                        </div>

                        <div className="ai-card-body">
                            {/* Idle: CTA */}
                            {!aiAnalysis && !aiLoading && !aiError && (
                                <div className="ai-prompt">
                                    <p>Get AI-powered sentiment analysis and trading insights from the latest headlines.</p>
                                    <button
                                        className="ai-btn"
                                        onClick={requestAiAnalysis}
                                        disabled={news.length === 0}
                                    >
                                        <Brain size={16} />
                                        Analyze {Math.min(news.length, 10)} Headlines
                                    </button>
                                </div>
                            )}

                            {/* Loading: Skeleton */}
                            {aiLoading && (
                                <div className="ai-skeleton-state">
                                    <div className="ai-skel-gauge">
                                        <div className="skel-block skel-circle"></div>
                                        <div className="skel-block-group">
                                            <div className="skel-block skel-line-sm"></div>
                                            <div className="skel-block skel-line-lg"></div>
                                        </div>
                                    </div>
                                    <div className="skel-block skel-para"></div>
                                    <div className="skel-block skel-para short"></div>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="skel-event-row">
                                            <div className="skel-block skel-dot"></div>
                                            <div className="skel-block skel-line-fill"></div>
                                        </div>
                                    ))}
                                    <p className="ai-skeleton-label">Analyzing headlines...</p>
                                </div>
                            )}

                            {/* Error */}
                            {aiError && (
                                <div className="ai-error-state">
                                    <AlertTriangle size={20} className="icon-error" />
                                    <p>{aiError}</p>
                                    <button className="ai-btn ai-btn-secondary" onClick={requestAiAnalysis}>
                                        <RefreshCw size={14} /> Retry
                                    </button>
                                </div>
                            )}

                            {/* Results: Malformed / empty guard */}
                            {aiAnalysis && !hasValidAnalysis && (
                                <div className="ai-empty-state">
                                    <AlertTriangle size={20} className="icon-neutral" />
                                    <p>Waiting for market data...</p>
                                    <span className="ai-empty-hint">The model returned an unexpected response. Try again.</span>
                                    <button className="ai-btn ai-btn-secondary" onClick={requestAiAnalysis}>
                                        <RefreshCw size={14} /> Re-analyze
                                    </button>
                                </div>
                            )}

                            {/* Results: Valid */}
                            {hasValidAnalysis && (
                                <div className="ai-results">
                                    {/* ── Sentiment Gauge ── */}
                                    <div className={`sentiment-gauge gauge-${(aiAnalysis.overallSentiment || 'neutral').toLowerCase()}`}>
                                        <div className="gauge-icon-wrap">
                                            <SentimentIcon sentiment={aiAnalysis.overallSentiment} size={28} />
                                        </div>
                                        <div className="gauge-content">
                                            <span className="gauge-label">Overall Sentiment</span>
                                            <span className="gauge-value">{aiAnalysis.overallSentiment}</span>
                                        </div>
                                        <div className={`gauge-badge badge-${(aiAnalysis.overallSentiment || 'neutral').toLowerCase()}`}>
                                            {aiAnalysis.overallSentiment}
                                        </div>
                                    </div>

                                    {/* ── Summary ── */}
                                    {aiAnalysis.summary && (
                                        <div className="ai-summary-block">
                                            <p>{aiAnalysis.summary}</p>
                                        </div>
                                    )}

                                    {/* ── Event Cards ── */}
                                    {Array.isArray(aiAnalysis.events) && aiAnalysis.events.length > 0 && (
                                        <div className="ai-events-section">
                                            <div className="ai-events-header">
                                                <span>Event Breakdown</span>
                                                <span className="ai-events-count">{aiAnalysis.events.length}</span>
                                            </div>
                                            <div className="ai-events-list">
                                                {aiAnalysis.events.map((event: any, idx: number) => {
                                                    const isOpen = expandedEvents.has(idx);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`ai-event-card ${isOpen ? 'expanded' : ''}`}
                                                            onClick={() => toggleEvent(idx)}
                                                        >
                                                            <div className="ai-event-row">
                                                                <SentimentIcon sentiment={event.sentiment} size={15} />
                                                                <span className="ai-event-name">{event.title}</span>
                                                                <div className="ai-event-right">
                                                                    <span className={`impact-chip chip-${(event.impact || 'medium').toLowerCase()}`}>
                                                                        <ImpactIcon impact={event.impact} />
                                                                        {event.impact}
                                                                    </span>
                                                                    {isOpen ? <ChevronUp size={14} className="chevron" /> : <ChevronDown size={14} className="chevron" />}
                                                                </div>
                                                            </div>
                                                            {isOpen && (
                                                                <div className="ai-event-detail">
                                                                    <p>{event.analysis}</p>
                                                                    <span className={`sentiment-pill pill-${(event.sentiment || 'neutral').toLowerCase()}`}>
                                                                        <SentimentIcon sentiment={event.sentiment} size={12} />
                                                                        {event.sentiment}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <button className="ai-btn ai-btn-secondary" onClick={requestAiAnalysis}>
                                        <RefreshCw size={14} /> Re-analyze
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDateShort(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default News;
