import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Trade, TradeCardVisibility } from '../types';
import './TradeCard.css';

interface TradeCardProps {
    trade: Trade;
    onDelete: (id: number) => void;
    visibility?: TradeCardVisibility;
}

const defaultVisibility: TradeCardVisibility = {
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

const TradeCard = ({ trade, onDelete, visibility = defaultVisibility }: TradeCardProps) => {
    const [showZoom, setShowZoom] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const formatCurrency = (value: number | null) => {
        if (value === null) return '-';
        const sign = value >= 0 ? '+' : '';
        return `${sign}$${value.toFixed(2)}`;
    };

    const getPnLClass = (value: number | null) => {
        if (value === null) return '';
        return value >= 0 ? 'trade-pnl-positive' : 'trade-pnl-negative';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowZoom(true);
    };

    const handleCloseZoom = () => {
        setShowZoom(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmDelete) {
            onDelete(trade.id);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const tags: string[] = Array.isArray(trade.confluenceTags) ? trade.confluenceTags : [];

    return (
        <>
            <div className="trade-card">
                {/* Image Thumbnail */}
                {visibility.image && trade.imageUrl && (
                    <div className="trade-card-image-wrapper" onClick={handleImageClick}>
                        <img src={trade.imageUrl} alt="Trade chart" className="trade-card-image" />
                        <div className="image-zoom-hint">
                            <span>🔍</span>
                        </div>
                    </div>
                )}

                <div className="trade-card-content">
                    {/* Header */}
                    <div className="trade-card-header">
                        <h3 className="trade-instrument">{trade.symbol}</h3>
                        <div className="trade-header-right">
                            {visibility.strategy && trade.strategy && (
                                <span className="trade-strategy-badge">{trade.strategy}</span>
                            )}
                            <span className={`trade-direction-badge ${trade.type.toLowerCase()}`}>
                                {trade.type}
                            </span>
                            <button
                                className={`trade-delete-btn ${confirmDelete ? 'confirm' : ''}`}
                                onClick={handleDeleteClick}
                                title={confirmDelete ? 'Click again to confirm' : 'Delete trade'}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="trade-metrics">
                        {visibility.entryPrice && (
                            <div className="trade-metric">
                                <div className="trade-metric-label">Entry</div>
                                <div className="trade-metric-value">${trade.entryPrice.toFixed(2)}</div>
                            </div>
                        )}
                        {visibility.stopLoss && trade.stopLoss != null && (
                            <div className="trade-metric">
                                <div className="trade-metric-label">Stop Loss</div>
                                <div className="trade-metric-value trade-pnl-negative">${trade.stopLoss.toFixed(2)}</div>
                            </div>
                        )}
                        {visibility.takeProfit && trade.takeProfit != null && (
                            <div className="trade-metric">
                                <div className="trade-metric-label">Take Profit</div>
                                <div className="trade-metric-value trade-pnl-positive">${trade.takeProfit.toFixed(2)}</div>
                            </div>
                        )}
                        {visibility.pnl && (
                            <div className="trade-metric pnl-metric">
                                <div className="trade-metric-label">P&L</div>
                                <div className={`trade-metric-value trade-net-pnl ${getPnLClass(trade.pnl)}`}>
                                    {formatCurrency(trade.pnl)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {visibility.notes && trade.notes && (
                        <div className="trade-notes">
                            <span className="trade-notes-label">Notes</span>
                            <div className="trade-notes-text">{trade.notes}</div>
                        </div>
                    )}

                    {/* Confluence Tags */}
                    {visibility.confluenceTags && tags.length > 0 && (
                        <div className="trade-confluences">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="confluence-tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Footer: time and date */}
                    <div className="trade-card-footer">
                        {visibility.time && trade.time && (
                            <span className="trade-time">{new Date(trade.time).toLocaleString()}</span>
                        )}
                        <span className="trade-date">{formatDate(trade.timestamp)}</span>
                    </div>
                </div>
            </div>

            {/* Full-screen Zoom Modal */}
            {showZoom && trade.imageUrl && (
                <div className="image-zoom-overlay" onClick={handleCloseZoom}>
                    <div className="image-zoom-container" onClick={(e) => e.stopPropagation()}>
                        <button className="image-zoom-close" onClick={handleCloseZoom} title="Close">
                            ×
                        </button>
                        <img src={trade.imageUrl} alt="Trade chart zoomed" className="image-zoom-full" />
                        <div className="image-zoom-caption">
                            <span className="zoom-symbol">{trade.symbol}</span>
                            <span className="zoom-date">{formatDate(trade.timestamp)}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TradeCard;
