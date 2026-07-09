import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    LogIn,
    Building2,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Shield
} from 'lucide-react';
import { useLogin } from '../hooks/useApi';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState<'username' | 'password' | null>(null);
    const loginMutation = useLogin();

    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password });
    };

    // Clear error on input change
    useEffect(() => {
        if (loginMutation.isError) {
            // Clear error state when user types
            loginMutation.reset?.();
        }
    }, [username, password]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
                    style={{
                        background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
                        animation: 'float 20s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
                    style={{
                        background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
                        animation: 'float 25s ease-in-out infinite reverse'
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.02]"
                    style={{
                        background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
                    }}
                />
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md relative animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10">
                    {/* Logo & Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4" style={{
                            background: theme.primaryGradient,
                            boxShadow: `0 8px 24px ${theme.primary}55`
                        }}>
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Hospitality OS
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Enterprise Platform Login
                        </p>
                    </div>

                    {/* Status Messages */}
                    {loginMutation.isError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-700">Authentication Failed</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                    Please check your credentials and try again.
                                </p>
                            </div>
                        </div>
                    )}

                    {loginMutation.isSuccess && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Login Successful</p>
                                <p className="text-xs text-emerald-600 mt-0.5">
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setIsFocused('username')}
                                    onBlur={() => setIsFocused(null)}
                                    required
                                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: isFocused === 'username' ? theme.primary : '#e2e8f0',
                                        boxShadow: isFocused === 'username' ? `0 0 0 4px ${theme.primary}22` : 'none',
                                        backgroundColor: isFocused === 'username' ? '#fff' : '#f8fafc'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                                    onClick={() => {/* Implement forgot password */ }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsFocused('password')}
                                    onBlur={() => setIsFocused(null)}
                                    required
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: isFocused === 'password' ? theme.primary : '#e2e8f0',
                                        boxShadow: isFocused === 'password' ? `0 0 0 4px ${theme.primary}22` : 'none',
                                        backgroundColor: isFocused === 'password' ? '#fff' : '#f8fafc'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full py-3 rounded-xl text-white font-medium transition-all duration-200 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: theme.primaryGradient,
                                boxShadow: `0 4px 16px ${theme.primary}55`
                            }}
                            onMouseEnter={(e) => {
                                if (!loginMutation.isPending) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primary}66`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 16px ${theme.primary}55`;
                            }}
                        >
                            {loginMutation.isPending ? (
                                <span className="flex items-center justify-center gap-3">
                                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                <span>Secure • Enterprise</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>v2.1.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative bottom text */}
                <div className="text-center mt-6 text-xs text-slate-400">
                    <span>© 2026 Hospitality OS. All rights reserved.</span>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-8 {
          from { 
            opacity: 0;
            transform: translateY(2rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-top-4 {
          from { 
            opacity: 0;
            transform: translateY(-1rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom-8 {
          animation-name: slide-in-from-bottom-8;
        }
        .slide-in-from-top-4 {
          animation-name: slide-in-from-top-4;
        }
        .duration-300 { animation-duration: 300ms; }
        .duration-500 { animation-duration: 500ms; }
      `}</style>
        </div>
    );
};