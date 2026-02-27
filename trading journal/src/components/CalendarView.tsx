import { useState } from 'react';
import type { DayPnL } from '../types';
import './CalendarView.css';

interface CalendarViewProps {
    dailyPnL: DayPnL[];
}

const CalendarView = ({ dailyPnL }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (day: number) => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const getPnLForDay = (day: number): DayPnL | undefined => {
        const dateStr = formatDate(day);
        return dailyPnL.find(d => d.date === dateStr);
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = getPnLForDay(day);
            const pnl = dayData?.netPnL || 0;
            const hasTrades = dayData && dayData.trades > 0;

            let dayClass = 'calendar-day';
            if (hasTrades) {
                dayClass += pnl > 0 ? ' profitable' : ' losing';
            } else {
                dayClass += ' no-trades';
            }

            days.push(
                <div key={day} className={dayClass}>
                    <div className="day-number">{day}</div>
                    {hasTrades && (
                        <div className="day-pnl">
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="calendar-view glass">
            <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={previousMonth}>
                    ‹
                </button>
                <h3 className="calendar-month">{monthName}</h3>
                <button className="calendar-nav-btn" onClick={nextMonth}>
                    ›
                </button>
            </div>

            <div className="calendar-weekdays">
                {weekDays.map(day => (
                    <div key={day} className="calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>

            <div className="calendar-grid">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default CalendarView;
