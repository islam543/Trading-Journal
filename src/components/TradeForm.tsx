import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, X, Plus } from 'lucide-react';
import './TradeForm.css';

interface TradeFormProps {
    onTradeAdded: () => void;
    onCancel: () => void;
}

const STRATEGIES = [
    'Trend Following',
    'Breakout',
    'Reversal',
    'Scalping',
    'Swing Trade',
    'Mean Reversion',
    'Momentum',
    'Range Trading',
    'News Based',
    'Other',
];

interface CustomSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const CustomSelect = ({ label, value, options, onChange }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="custom-select" ref={ref}>
                <button
                    type="button"
                    className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{selected?.label || 'Select...'}</span>
                    <ChevronDown size={16} className={`select-chevron ${isOpen ? 'rotated' : ''}`} />
                </button>
                {isOpen && (
                    <div className="custom-select-dropdown">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TradeForm = ({ onTradeAdded, onCancel }: TradeFormProps) => {
    const { authFetch } = useAuth();
    const [formData, setFormData] = useState({
        symbol: '',
        type: 'BUY',
        entryPrice: '',
        time: '',
        strategy: '',
        stopLoss: '',
        takeProfit: '',
        pnl: '',
        notes: ''
    });
    const [confluenceTags, setConfluenceTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !confluenceTags.includes(tag)) {
            setConfluenceTags([...confluenceTags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setConfluenceTags(confluenceTags.filter(t => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await authFetch('/api/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: formData.symbol,
                    type: formData.type,
                    entryPrice: parseFloat(formData.entryPrice),
                    time: formData.time || null,
                    strategy: formData.strategy || null,
                    stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
                    takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
                    pnl: formData.pnl ? parseFloat(formData.pnl) : null,
                    confluenceTags,
                    notes: formData.notes || null,
                    imageUrl: imagePreview,
                })
            });

            if (!res.ok) throw new Error('Failed to add trade');

            setFormData({
                symbol: '',
                type: 'BUY',
                entryPrice: '',
                time: '',
                strategy: '',
                stopLoss: '',
                takeProfit: '',
                pnl: '',
                notes: ''
            });
            setConfluenceTags([]);
            setImagePreview(null);
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

                    <CustomSelect
                        label="Direction"
                        value={formData.type}
                        options={[
                            { value: 'BUY', label: '🟢 BUY (Long)' },
                            { value: 'SELL', label: '🔴 SELL (Short)' },
                        ]}
                        onChange={(v) => setFormData({ ...formData, type: v })}
                    />

                    <div className="form-group">
                        <label>Entry Price</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.entryPrice}
                            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Time</label>
                        <input
                            type="datetime-local"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>

                    <CustomSelect
                        label="Strategy"
                        value={formData.strategy}
                        options={[
                            { value: '', label: 'Select strategy...' },
                            ...STRATEGIES.map(s => ({ value: s, label: s })),
                        ]}
                        onChange={(v) => setFormData({ ...formData, strategy: v })}
                    />

                    <div className="form-group">
                        <label>Stop Loss</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.stopLoss}
                            onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label>Take Profit</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.takeProfit}
                            onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label>P&L ($)</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.pnl}
                            onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                            placeholder="Manual P&L"
                        />
                    </div>
                </div>

                {/* Confluence Tags */}
                <div className="form-group">
                    <label>Confluence Tags</label>
                    <div className="tag-input-wrapper">
                        <div className="tags-container">
                            {confluenceTags.map(tag => (
                                <span key={tag} className="tag-chip">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="tag-input-row">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Type a tag and press Enter..."
                                className="tag-input"
                            />
                            <button type="button" onClick={addTag} className="tag-add-btn" disabled={!tagInput.trim()}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart Screenshot Upload */}
                <div className="form-group">
                    <label>Chart Screenshot</label>
                    <div className="image-upload-area">
                        {imagePreview ? (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Chart preview" className="image-preview" />
                                <button type="button" className="image-remove-btn" onClick={removeImage} title="Remove image">
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label className="image-upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="image-upload-input"
                                />
                                <div className="image-upload-placeholder">
                                    <span className="upload-icon">📷</span>
                                    <span className="upload-text">Click to upload chart screenshot</span>
                                    <span className="upload-hint">PNG, JPG up to 5MB</span>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        placeholder="Trade rationale, observations..."
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
