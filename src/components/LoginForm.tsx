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
    Shield,
    Fingerprint,
    Clock,
    Users,
    CreditCard,
    Smartphone,
    Zap,
    Award,
    Star,
    Check,
    ArrowRight,
    Coffee,
    Sparkles,
    TrendingUp,
    Headphones
} from 'lucide-react';
import { useLogin } from '../hooks/useApi';
import { THEME } from '../constants';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState<'username' | 'password' | null>(null);
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password });
    };

    useEffect(() => {
        if (loginMutation.isError) {
            loginMutation.reset?.();
        }
    }, [username, password]);

    // Features list
    const features = [
        {
            icon: <Fingerprint className="w-5 h-5" />,
            text: 'Biometric Authentication',
            description: 'Secure facial recognition & fingerprint'
        },
        {
            icon: <Clock className="w-5 h-5" />,
            text: 'Real-time Attendance',
            description: 'Live tracking with GPS verification'
        },
        {
            icon: <Users className="w-5 h-5" />,
            text: 'Staff Management',
            description: 'Complete team administration'
        },
        {
            icon: <CreditCard className="w-5 h-5" />,
            text: 'Secure Payments',
            description: 'PCI compliant transaction processing'
        },
    ];

    const stats = [
        { value: '500+', label: 'Venues' },
        { value: '10K+', label: 'Staff Members' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'Support' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* LEFT COLUMN - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-white p-8 md:p-12 relative overflow-hidden">
                {/* Subtle Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2596be]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2596be]/5 rounded-full blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Logo & Brand */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{
                                background: THEME.primaryGradient,
                                boxShadow: `0 8px 24px ${THEME.primary}55`
                            }}>
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Hospitality OS
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Enterprise Platform Login
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                            Welcome back! Please enter your credentials to access your dashboard.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {loginMutation.isError && (
                        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
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
                        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Username or Email
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
                                    className="w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 bg-white"
                                    style={{
                                        borderColor: isFocused === 'username' ? THEME.primary : '#e2e8f0',
                                        boxShadow: isFocused === 'username' ? `0 0 0 4px ${THEME.primary}15` : 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-[#2596be] hover:text-[#1a7a9e] transition-colors font-medium"
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
                                    className="w-full pl-10 pr-12 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 bg-white"
                                    style={{
                                        borderColor: isFocused === 'password' ? THEME.primary : '#e2e8f0',
                                        boxShadow: isFocused === 'password' ? `0 0 0 4px ${THEME.primary}15` : 'none',
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
                            className="w-full py-3 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-lg"
                            style={{
                                background: THEME.primaryGradient,
                                boxShadow: `0 4px 20px ${THEME.primary}55`
                            }}
                            onMouseEnter={(e) => {
                                if (!loginMutation.isPending) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 8px 28px ${THEME.primary}66`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 20px ${THEME.primary}55`;
                            }}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                <span>Secure • Enterprise</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>Privacy Policy</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>Terms of Service</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Brand Content with Color Background */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{
                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`
            }}>
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
                </div>

                {/* Floating Cards Decoration */}
                <div className="absolute top-10 right-10 opacity-20">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20" />
                </div>
                <div className="absolute bottom-20 left-10 opacity-20">
                    <div className="w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20" />
                </div>

                <div className="flex flex-col justify-center px-16 relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Hospitality OS</h2>
                            <p className="text-white/60 text-sm">Enterprise Platform</p>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 text-xs font-medium mb-4">
                            <Sparkles className="w-3 h-3" />
                            All-in-One Solution
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight mb-3">
                            Smart Hospitality
                            <br />
                            Management Platform
                        </h2>
                        <p className="text-white/80 text-lg max-w-md">
                            Streamline your operations with our comprehensive solution for
                            attendance tracking, staff management, and venue control.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition-all duration-200"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-white/90">
                                        {feature.icon}
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {feature.text}
                                    </span>
                                </div>
                                <p className="text-xs text-white/60">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/20">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-white/60">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center gap-2 text-white/80">
                            <Award className="w-4 h-4" />
                            <span className="text-xs font-medium">ISO Certified</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-medium">GDPR Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Headphones className="w-4 h-4" />
                            <span className="text-xs font-medium">24/7 Support</span>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-8 flex items-center gap-4">
                        <button
                            type="button"
                            className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20"
                        >
                            Request a demo
                            <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            className="text-sm text-white/60 hover:text-white/80 transition-colors"
                        >
                            Contact sales
                        </button>
                    </div>
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
        .slide-in-from-top-4 {
          animation-name: slide-in-from-top-4;
        }
        .duration-300 { animation-duration: 300ms; }
      `}</style>
        </div>
    );
};