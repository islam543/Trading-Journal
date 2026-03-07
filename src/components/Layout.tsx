import { useState } from 'react';
import type { ReactNode } from 'react';
import { Menu, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
    activePage: string;
    onPageChange: (page: string) => void;
    children: ReactNode;
}

const Layout = ({ activePage, onPageChange, children }: LayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const avatarLetter = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

    return (
        <div className="app-layout">
            <div className="mobile-navbar">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
                <span className="mobile-navbar-title">Trade Journal</span>
                <div className="mobile-navbar-right">
                    <div className="mobile-avatar" title={user?.email || ''}>
                        {avatarLetter}
                    </div>
                    <button
                        className="mobile-logout-btn"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <Sidebar
                activePage={activePage}
                onPageChange={onPageChange}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="app-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
