import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import TradeJournal from './pages/TradeJournal';
import News from './pages/News';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import MacroAnalysis from './pages/MacroAnalysis';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function LoadingSpinner() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-black)',
            color: 'var(--text-gray)',
            fontSize: '1rem',
        }}>
            Loading…
        </div>
    );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (user) return <Navigate to="/" />;
    return <>{children}</>;
}

const pageRouteMap: Record<string, string> = {
    dashboard: '/',
    journal: '/journal',
    news: '/news',
    macro: '/macro',
    settings: '/settings',
};

const routePageMap: Record<string, string> = {
    '/': 'dashboard',
    '/journal': 'journal',
    '/news': 'news',
    '/macro': 'macro',
    '/settings': 'settings',
};

function AuthenticatedApp() {
    const location = useLocation();
    const navigate = useNavigate();

    const activePage = routePageMap[location.pathname] || 'dashboard';

    const handlePageChange = (page: string) => {
        const route = pageRouteMap[page] || '/';
        navigate(route);
    };

    return (
        <Layout activePage={activePage} onPageChange={handlePageChange}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journal" element={<TradeJournal />} />
                <Route path="/news" element={<News />} />
                <Route path="/macro" element={<MacroAnalysis />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/*" element={
                <ProtectedRoute>
                    <AuthenticatedApp />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
