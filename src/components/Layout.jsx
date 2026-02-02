import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, BarChart3, Menu, ShoppingBag, Box, ClipboardCheck, Sun, Moon, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const mainRef = useRef(null);

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

    // Scroll Handlers
    const scrollToTop = () => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors duration-200">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/" className="block">
                        <h1 className="text-2xl font-bold text-cdh-red dark:text-red-400 tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
                            CDH<span className="text-gray-900 dark:text-gray-100 ml-1 font-light">Associates</span>
                        </h1>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Internal Ops Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/new-order" icon={<PlusCircle size={20} />} label="New Order" />
                    <NavItem to="/orders" icon={<ClipboardCheck size={20} />} label="Order History" />
                    <div className="pt-4 pb-1">
                        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Management</p>
                    </div>
                    <NavItem to="/vendors" icon={<Users size={20} />} label="Vendors" />
                    <NavItem to="/retailers" icon={<ShoppingBag size={20} />} label="Retailers" />
                    <NavItem to="/products" icon={<Box size={20} />} label="Products" />
                    <div className="pt-4 pb-1">
                        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">System</p>
                    </div>
                    <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between md:hidden">
                    <Link to="/" className="font-bold text-cdh-red dark:text-red-400">CDH Associates</Link>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main ref={mainRef} className="flex-1 overflow-auto p-6 md:p-8 scroll-smooth">
                    <Outlet />

                    {/* Scroll Controls (Floating) */}
                    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
                        <button
                            onClick={scrollToTop}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-cdh-red dark:hover:text-red-400 transition-all opacity-50 hover:opacity-100"
                            title="Scroll to Top"
                        >
                            <ArrowUp size={20} />
                        </button>
                        <button
                            onClick={scrollToBottom}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-cdh-red dark:hover:text-red-400 transition-all opacity-50 hover:opacity-100"
                            title="Scroll to Bottom"
                        >
                            <ArrowDown size={20} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200",
                isActive
                    ? "bg-cdh-red text-white shadow-sm dark:bg-red-900/50 dark:text-red-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            )}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}
