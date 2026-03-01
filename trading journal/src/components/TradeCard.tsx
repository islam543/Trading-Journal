import { useState } from 'react';
import type { Trade } from '../types';
import './TradeCard.css';

interface TradeCardProps {
    trade: Trade;
}

const TradeCard = ({ trade }: TradeCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showZoom, setShowZoom] = useState(false);

    const formatCurrency = (value: number | null) => {
        if (value === null) return '-';
        const sign = value >= 0 ? '+' : '';
        return `${sign}$${value.toFixed(2)}`;
    };

    const getPnLClass = (value: number | null) => {
        if (value === null) return '';
        return value >= 0 ? 'trade-pnl-positive' : 'trade-pnl-negative';
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
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

    return (
        <>
            <div className={`trade-card ${isExpanded ? 'expanded' : 'collapsed'}`} onClick={toggleExpanded}>
                {/* Image Thumbnail */}
                {trade.imageUrl && (
                    <div className="trade-card-image-wrapper" onClick={handleImageClick}>
                        <img src={trade.imageUrl} alt="Trade chart" className="trade-card-image" />
                        <div className="image-zoom-hint">
                            <span>🔍</span>
                        </div>
                    </div>
                )}

                <div className="trade-card-content">
                    {/* Header with Symbol and Type */}
                    <div className="trade-card-header">
                        <h3 className="trade-instrument">{trade.symbol}</h3>
                        <div className="trade-header-right">
                            <span className={`trade-direction-badge ${trade.type.toLowerCase()}`}>
                                {trade.type}
                            </span>
                            <span className="expand-indicator">
                                {isExpanded ? '−' : '+'}
                            </span>
                        </div>
                    </div>

                    {/* Summary Row */}
                    <div className="trade-pnl-summary">
                        <div className="summary-item">
                            <span className="trade-pnl-label">Status</span>
                            <span className={`status-badge ${trade.status.toLowerCase()}`}>
                                {trade.status}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="trade-pnl-label">P&L</span>
                            <span className={`trade-pnl-value trade-net-pnl ${getPnLClass(trade.pnl)}`}>
                                {formatCurrency(trade.pnl)}
                            </span>
                        </div>
                    </div>

                    {/* Expandable Details */}
                    <div className={`trade-details ${isExpanded ? 'visible' : 'hidden'}`}>
                        <div className="trade-metrics">
                            <div className="trade-metric">
                                <div className="trade-metric-label">Entry</div>
                                <div className="trade-metric-value">${trade.entryPrice.toFixed(2)}</div>
                            </div>
                            <div className="trade-metric">
                                <div className="trade-metric-label">Exit</div>
                                <div className="trade-metric-value">
                                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'N/A'}
                                </div>
                            </div>
                            <div className="trade-metric">
                                <div className="trade-metric-label">Quantity</div>
                                <div className="trade-metric-value">{trade.quantity}</div>
                            </div>
                        </div>

                        {/* Notes */}
                        {trade.notes && (
                            <div className="trade-notes">
                                <span className="trade-notes-label">Notes</span>
                                <div className="trade-notes-text">{trade.notes}</div>
                            </div>
                        )}

                        {/* Date */}
                        <div className="trade-date">{formatDate(trade.timestamp)}</div>
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
