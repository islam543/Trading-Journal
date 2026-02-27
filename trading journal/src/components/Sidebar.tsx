import { useState } from 'react';
import { LayoutDashboard, BookOpen, Newspaper, Settings, Menu, X, Activity } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ activePage, onPageChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Trade Journal', icon: BookOpen },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'macro', label: 'Macro Analysis', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isCollapsed && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!isCollapsed && (
              <h2 className="sidebar-title">Trade Journal</h2>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item glass-hover ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
                title={item.label}
              >
                <Icon size={22} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
