import { LayoutDashboard, BookOpen, Newspaper, Settings, X, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ activePage, onPageChange, isOpen, onClose }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'journal', label: 'Trade Journal', icon: BookOpen },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'macro', label: 'Macro Analysis', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleNavClick = (pageId: string) => {
        onPageChange(pageId);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}

            <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <h2 className="sidebar-title">Trade Journal</h2>
                    </div>
                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                className={`nav-item glass-hover ${isActive ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.id)}
                                title={item.label}
                            >
                                <Icon size={22} className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <button className="nav-item sidebar-logout" onClick={handleLogout}>
                    <LogOut size={22} className="nav-icon" />
                    <span className="nav-label">Logout</span>
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
