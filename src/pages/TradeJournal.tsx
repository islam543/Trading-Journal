import { useState, useEffect, useCallback } from 'react';
import TradeCard from '../components/TradeCard';
import TradeForm from '../components/TradeForm';
import { Plus, X, ChevronLeft, ChevronRight, Settings, Eye, EyeOff } from 'lucide-react';
import type { Trade, TradeCardVisibility } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './TradeJournal.css';

const defaultCardVisibility: TradeCardVisibility = {
    entryPrice: true,
    stopLoss: true,
    takeProfit: true,
    pnl: true,
    strategy: true,
    confluenceTags: true,
    notes: true,
    image: true,
    time: true,
};

const visibilityLabels: Record<keyof TradeCardVisibility, string> = {
    entryPrice: 'Entry Price',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    pnl: 'P&L',
    strategy: 'Strategy',
    confluenceTags: 'Confluence Tags',
    notes: 'Notes',
    image: 'Chart Image',
    time: 'Time',
};

const ITEMS_PER_PAGE = 20;

const TradeJournal = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTrades, setTotalTrades] = useState(0);
    const [showVisibilityPanel, setShowVisibilityPanel] = useState(false);
    const [cardVisibility, setCardVisibility] = useState<TradeCardVisibility>(() => {
        const saved = localStorage.getItem('tradeCardVisibility');
        return saved ? JSON.parse(saved) : defaultCardVisibility;
    });
    const { authFetch } = useAuth();

    const fetchTrades = useCallback(async (p: number = page) => {
        try {
            setLoading(true);
            const res = await authFetch(`/api/trades?page=${p}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error('Failed to fetch trades');
            const data = await res.json();
            setTrades(data.trades);
            setTotalPages(data.totalPages);
            setTotalTrades(data.total);
        } catch (err) {
            console.error('Error fetching trades:', err);
            setError('Could not load trades. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [authFetch, page]);

    useEffect(() => {
        fetchTrades(page);
    }, [page, fetchTrades]);

    const handleTradeAdded = () => {
        setShowForm(false);
        setPage(1);
        fetchTrades(1);
    };

    const handleDeleteTrade = async (id: number) => {
        try {
            const res = await authFetch(`/api/trades/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete trade');
            fetchTrades(page);
        } catch (err) {
            console.error('Error deleting trade:', err);
        }
    };

    const toggleVisibility = (field: keyof TradeCardVisibility) => {
        const updated = { ...cardVisibility, [field]: !cardVisibility[field] };
        setCardVisibility(updated);
        localStorage.setItem('tradeCardVisibility', JSON.stringify(updated));
    };

    return (
        <div className="trade-journal-page">
            <div className="trade-journal-header">
                <div>
                    <h1 className="trade-journal-title">Trade Journal</h1>
                    <p className="trade-journal-subtitle">
                        {totalTrades} {totalTrades === 1 ? 'trade' : 'trades'} recorded
                    </p>
                </div>
                <div className="trade-journal-actions">
                    <button
                        className="visibility-toggle-btn"
                        onClick={() => setShowVisibilityPanel(!showVisibilityPanel)}
                        title="Card visibility settings"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        className={`add-trade-btn ${showForm ? 'cancel' : ''}`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? (
                            <>
                                <X size={18} />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                <span>Add Trade</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Card Visibility Settings Panel */}
            {showVisibilityPanel && (
                <div className="visibility-panel glass">
                    <h4>Card Display Settings</h4>
                    <div className="visibility-options">
                        {(Object.keys(visibilityLabels) as Array<keyof TradeCardVisibility>).map(field => (
                            <button
                                key={field}
                                className={`visibility-option ${cardVisibility[field] ? 'active' : ''}`}
                                onClick={() => toggleVisibility(field)}
                            >
                                {cardVisibility[field] ? <Eye size={14} /> : <EyeOff size={14} />}
                                <span>{visibilityLabels[field]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <TradeForm
                    onTradeAdded={handleTradeAdded}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {loading && !trades.length ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your trades...</p>
                </div>
            ) : error ? (
                <div className="error-container glass">
                    <p>{error}</p>
                    <button onClick={() => fetchTrades(page)} className="btn-secondary">Retry</button>
                </div>
            ) : trades.length > 0 ? (
                <>
                    <div className="trade-cards-grid">
                        {trades.map((trade) => (
                            <TradeCard
                                key={trade.id}
                                trade={trade}
                                onDelete={handleDeleteTrade}
                                visibility={cardVisibility}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={18} />
                                <span>Previous</span>
                            </button>
                            <span className="pagination-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <span>Next</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="trade-journal-empty glass">
                    <h3>No trades yet</h3>
                    <p>Your trade journal entries will appear here once you start logging trades.</p>
                </div>
            )}
        </div>
    );
};

export default TradeJournal;
