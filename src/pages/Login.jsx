import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Redirect to where they came from, or home
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (isSignUp) {
                await signUp(email, password);
                setMessage('Account created! Check your email to confirm.');
                setIsSignUp(false);
            } else {
                await signIn(email, password);
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cdh-red/10 rounded-full flex items-center justify-center text-cdh-red mb-4">
                        {isSignUp ? <UserPlus size={32} /> : <Lock size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isSignUp ? 'Create Account' : 'CDH Portal'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {isSignUp ? 'Sign up to get started.' : 'Sign in to access your dashboard.'}
                    </p>
                </div>

                {message && (
                    <div className="mb-4 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm justify-center bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                        <CheckCircle size={16} />
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none transition-all"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm justify-center bg-red-50 dark:bg-red-900/10 p-2 rounded-lg animate-pulse">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cdh-red hover:bg-cdh-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-cdh-red dark:hover:text-red-400 font-medium transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Protected by Supabase Authentication
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        CDH Associates &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
