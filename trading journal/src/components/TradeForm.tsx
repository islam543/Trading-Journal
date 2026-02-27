import { useState } from 'react';
import './TradeForm.css';

interface TradeFormProps {
    onTradeAdded: () => void;
    onCancel: () => void;
}

const TradeForm = ({ onTradeAdded, onCancel }: TradeFormProps) => {
    const [formData, setFormData] = useState({
        symbol: '',
        type: 'BUY',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        status: 'OPEN',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    entryPrice: parseFloat(formData.entryPrice),
                    exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
                    quantity: parseFloat(formData.quantity)
                })
            });

            if (!res.ok) throw new Error('Failed to add trade');

            setFormData({
                symbol: '',
                type: 'BUY',
                entryPrice: '',
                exitPrice: '',
                quantity: '',
                status: 'OPEN',
                notes: ''
            });
            onTradeAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trade-form-container glass">
            <h3>Add New Trade</h3>
            <form onSubmit={handleSubmit} className="trade-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Symbol</label>
                        <input
                            type="text"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                            placeholder="e.g. BTCUSDT"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Entry Price</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.entryPrice}
                            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>
                    {formData.status === 'CLOSED' && (
                        <div className="form-group">
                            <label>Exit Price</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.exitPrice}
                                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                                required
                            />
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                    />
                </div>
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Adding...' : 'Add Trade'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TradeForm;
