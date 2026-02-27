import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
    activePage: string;
    onPageChange: (page: string) => void;
    children: ReactNode;
}

const Layout = ({ activePage, onPageChange, children }: LayoutProps) => {
    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} onPageChange={onPageChange} />
            <main className="app-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
