import type { GoalProgress } from '../types';
import './GoalsSection.css';

interface GoalsSectionProps {
    goals: GoalProgress[];
}

const GoalsSection = ({ goals }: GoalsSectionProps) => {
    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'goal-complete';
        if (percentage >= 75) return 'goal-on-track';
        if (percentage >= 50) return 'goal-moderate';
        return 'goal-behind';
    };

    const formatCurrency = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="goals-section">
            <h2 className="goals-title">Goals Progress</h2>
            <div className="goals-grid">
                {goals.map((goal, index) => (
                    <div key={index} className="goal-card glass">
                        <div className="goal-header">
                            <h3 className="goal-label">{goal.label}</h3>
                            <span className={`goal-percentage ${getProgressColor(goal.percentage)}`}>
                                {goal.percentage.toFixed(0)}%
                            </span>
                        </div>

                        <div className="goal-stats">
                            <div className="goal-stat">
                                <span className="goal-stat-label">Actual</span>
                                <span className={`goal-stat-value ${goal.actual >= 0 ? 'positive' : 'negative'}`}>
                                    {formatCurrency(goal.actual)}
                                </span>
                            </div>
                            <div className="goal-stat">
                                <span className="goal-stat-label">Target</span>
                                <span className="goal-stat-value">
                                    ${goal.target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="progress-bar-container">
                            <div
                                className={`progress-bar ${getProgressColor(goal.percentage)}`}
                                style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                            >
                                <div className="progress-glow"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoalsSection;
