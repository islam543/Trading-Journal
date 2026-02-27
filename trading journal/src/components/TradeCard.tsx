import { useState } from 'react';
import type { Trade } from '../types';
import './TradeCard.css';

interface TradeCardProps {
    trade: Trade;
}

const TradeCard = ({ trade }: TradeCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <div className={`trade-card ${isExpanded ? 'expanded' : 'collapsed'}`} onClick={toggleExpanded}>
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
    );
};

export default TradeCard;
