import { useState, useEffect, useCallback } from 'react';
import TradeCard from '../components/TradeCard';
import TradeForm from '../components/TradeForm';
import { Plus, X } from 'lucide-react';
import type { Trade } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './TradeJournal.css';

const TradeJournal = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authFetch } = useAuth();

    const fetchTrades = useCallback(async () => {
        try {
            setLoading(true);
            const res = await authFetch('/api/trades');
            if (!res.ok) throw new Error('Failed to fetch trades');
            const data = await res.json();
            setTrades(data);
        } catch (err) {
            console.error('Error fetching trades:', err);
            setError('Could not load trades. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchTrades();
    }, [fetchTrades]);

    const handleTradeAdded = () => {
        setShowForm(false);
        fetchTrades();
    };

    return (
        <div className="trade-journal-page">
            <div className="trade-journal-header">
                <div>
                    <h1 className="trade-journal-title">Trade Journal</h1>
                    <p className="trade-journal-subtitle">
                        {trades.length} {trades.length === 1 ? 'trade' : 'trades'} recorded
                    </p>
                </div>
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
                    <button onClick={fetchTrades} className="btn-secondary">Retry</button>
                </div>
            ) : trades.length > 0 ? (
                <div className="trade-cards-grid">
                    {trades.map((trade) => (
                        <TradeCard key={trade.id} trade={trade} />
                    ))}
                </div>
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
