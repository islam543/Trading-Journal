import './MetricCard.css';

interface MetricCardProps {
    title: string;
    value: string | number;
    type?: 'currency' | 'percentage' | 'number';
    sentiment?: 'positive' | 'negative' | 'neutral';
}

const MetricCard = ({ title, value, type = 'number', sentiment = 'neutral' }: MetricCardProps) => {
    const formatValue = () => {
        if (typeof value === 'string') return value;

        switch (type) {
            case 'currency':
                const sign = value >= 0 ? '+' : '';
                return `${sign}$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            case 'percentage':
                return `${value.toFixed(2)}%`;
            case 'number':
            default:
                return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    };

    return (
        <div className="metric-card glass">
            <h3 className="metric-title">{title}</h3>
            <p className={`metric-value metric-${sentiment}`}>
                {formatValue()}
            </p>
        </div>
    );
};

export default MetricCard;
