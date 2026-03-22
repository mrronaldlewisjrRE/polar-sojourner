import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    BarChart3,
    Menu,
    ShoppingBag,
    Box,
    ClipboardCheck,
    Sun,
    Moon,
    ArrowUp,
    ArrowDown,
    Activity,
    CalendarDays,
    LogOut,
    MessageCircle,
    Image as ImageIcon,
    Shield,
    TrendingUp,
    FileSpreadsheet,
    Server
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import ChatInterface from './ChatInterface';

export default function Layout() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);


    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Apply Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Scroll Handlers (Window)
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Skip Link */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-cdh-red border border-cdh-red rounded-br-lg transition-all">
                Skip to Content
            </a>

            {/* Sidebar (Desktop) - Fixed Position */}
            <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors duration-200">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/" className="block">
                        <h1 className="text-2xl font-bold text-cdh-red dark:text-red-400 tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
                            CDH<span className="text-gray-900 dark:text-gray-100 ml-1 font-light">Associates</span>
                        </h1>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Internal Ops Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavContent user={user} onChatClick={() => setIsChatOpen(true)} />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <Link to="/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-500">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user?.email}</p>
                            <p className="text-xs text-gray-500 truncate group-hover:text-cdh-red dark:group-hover:text-red-400 transition-colors">Edit Profile</p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme</span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 w-64 h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h1 className="text-xl font-bold text-cdh-red dark:text-red-400">Menu</h1>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                <Menu size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            <NavContent user={user} onChatClick={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }} onClick={() => setIsMobileMenuOpen(false)} />
                        </nav>

                        {/* Mobile Footer (Profile & Logout) */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-500">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user?.email}</p>
                                    <p className="text-xs text-gray-500 truncate group-hover:text-cdh-red dark:group-hover:text-red-400 transition-colors">Edit Profile</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme</span>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                    title="Toggle Theme"
                                >
                                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Layout Layer: Offset for fixed sidebar */}
            <div className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-200">
                {/* Desktop Header / Dark Mode Toggle */}
                <header className="hidden md:flex justify-end items-center p-4 gap-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                {/* Page Content */}
                <main id="main-content" className="flex-1 p-6 md:p-8 pt-20 md:pt-4">
                    <Outlet />

                    {/* Scroll Controls (Floating) */}
                    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
                        <button
                            onClick={scrollToTop}
                            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-cdh-red dark:hover:text-red-400 transition-colors"
                        >
                            <ArrowUp size={20} />
                        </button>
                        <button
                            onClick={scrollToBottom}
                            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-cdh-red dark:hover:text-red-400 transition-colors"
                        >
                            <ArrowDown size={20} />
                        </button>
                    </div>

                    <footer className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 pb-2 text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                            CDH Platform — Internal Use Only
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                            v5A.5-DATA-FIX | Build: {new Date().toLocaleDateString()}
                        </p>
                    </footer>
                </main>
            </div>

            {/* Chat Interface (Overlay) - Moved to Root */}
            <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
}

function NavContent({ user, onClick, onChatClick }) {
    return (
        <>
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={onClick} />
            <NavItem to="/growth" icon={<TrendingUp size={20} />} label="Growth Engine" onClick={onClick} />
            <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Orders</p>
            </div>
            <NavItem to="/new-order" icon={<PlusCircle size={20} />} label="New Order" onClick={onClick} />
            <NavItem to="/orders" icon={<ClipboardCheck size={20} />} label="Order History" onClick={onClick} />

            <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Collaboration</p>
            </div>
            <button
                onClick={() => { if (onChatClick) onChatClick(); if (onClick) onClick(); }}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cdh-red dark:hover:text-red-400 transition-all duration-300"
            >
                <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.15)] dark:group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    <MessageCircle size={20} />
                </div>
                <span className="transition-all duration-300 group-hover:[text-shadow:0_0_8px_rgba(0,0,0,0.15)] dark:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)]">Team Chat</span>
            </button>

            <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Management</p>
            </div>
            <NavItem to="/vendors" icon={<Users size={20} />} label="Vendors" onClick={onClick} />
            <NavItem to="/retailers" icon={<ShoppingBag size={20} />} label="Retailers" onClick={onClick} />
            <NavItem to="/calendar" icon={<CalendarDays size={20} />} label="Calendar" onClick={onClick} />
            <NavItem to="/gallery" icon={<ImageIcon size={20} />} label="Photo Gallery" onClick={onClick} />
            <NavItem to="/products" icon={<Box size={20} />} label="Products" onClick={onClick} />
            <NavItem to="/sku-tracker" icon={<Activity size={20} />} label="Live SKU Tracker" onClick={onClick} />
            <div className="pt-4 pb-1">
                <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">System</p>
            </div>
            <NavItem to="/documents" icon={<FileSpreadsheet size={20} />} label="Documents" onClick={onClick} />
            <NavItem to="/import-staging" icon={<Server size={20} />} label="Data Import" onClick={onClick} />
            <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" onClick={onClick} />

            {/* Admin Link */}
            {user?.email === 'ronald@cdhassociates.com' && (
                <NavItem to="/admin" icon={<Shield size={20} />} label="Admin Dashboard" onClick={onClick} />
            )}
        </>
    );
}

function NavItem({ to, icon, label, onClick }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-md text-sm font-medium transition-all duration-300 min-h-[48px]", // Increased touch target
                isActive
                    ? "bg-cdh-red text-white shadow-sm dark:bg-red-900/50 dark:text-red-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            )}
            data-testid={`nav - ${label.toLowerCase().replace(/\s+/g, '-')} `}
        >
            {({ isActive }) => {
                const iconGlow = isActive
                    ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    : "group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.15)] dark:group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]";

                const textGlow = isActive
                    ? "[text-shadow:0_0_8px_rgba(255,255,255,0.6)]"
                    : "group-hover:[text-shadow:0_0_8px_rgba(0,0,0,0.15)] dark:group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)]";

                return (
                    <>
                        <div className={cn("transition-all duration-300", iconGlow)}>
                            {icon}
                        </div>
                        <span className={cn("transition-all duration-300", textGlow)}>
                            {label}
                        </span>
                    </>
                );
            }}
        </NavLink>
    );
}
