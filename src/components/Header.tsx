import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    CheckCircle,
    Bell,
    Search,
    Clock,
    Sparkles,
    Zap
} from 'lucide-react';
import { NAV_ITEMS, PAGE_DESCRIPTIONS } from '../constants';

export const Header: React.FC = () => {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const currentNavItem = NAV_ITEMS.find(item => item.path === location.pathname);
    const title = currentNavItem?.label || 'Dashboard';
    const description = PAGE_DESCRIPTIONS[location.pathname] || 'Welcome back to your dashboard';

    // Mock notifications
    const notifications = [
        { id: 1, title: 'New staff registered', time: '5 min ago', type: 'success' },
        { id: 2, title: 'Table 12 is occupied', time: '15 min ago', type: 'info' },
        { id: 3, title: 'Reservation pending approval', time: '1 hour ago', type: 'warning' },
    ];

    // Get time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-6 md:px-10 py-4">
            <div className="flex items-center justify-between">
                {/* Left Side - Title & Description */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                            {title}
                        </h2>
                        {/* Optional badge for page type */}
                        {currentNavItem?.path?.includes('/kiosk') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Zap className="w-3 h-3" />
                                Live
                            </span>
                        )}
                        {currentNavItem?.path?.includes('/enroll') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <Sparkles className="w-3 h-3" />
                                Enrollment
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-sm text-slate-500 truncate">
                            {description}
                        </p>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getGreeting()}
                        </span>
                    </div>
                </div>

                {/* Right Side - Actions & Status */}
                <div className="flex items-center gap-2 md:gap-3 ml-4">
                    {/* Search Button */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 relative"
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                                    <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                        Mark all read
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 ${notif.type === 'success' ? 'bg-emerald-500' :
                                                    notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-900">{notif.title}</p>
                                                    <p className="text-xs text-slate-400">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 border-t border-slate-200 text-center">
                                    <button className="text-xs text-[#2596be] font-medium hover:text-[#1a7a9e] transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-6 bg-slate-200" />

                    {/* System Status */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-700">Online</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Profile / Avatar (quick access) */}
                    {/* <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm" style={{
                            background: THEME.primaryGradient,
                            boxShadow: `0 2px 8px ${THEME.primary}44`
                        }}>
                            JD
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button> */}
                </div>
            </div>

            {/* Search Bar (expandable) */}
            {showSearch && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for pages, staff, reservations..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:border-transparent transition-all"
                            autoFocus
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slide-in-from-top-2 {
          from { 
            opacity: 0;
            transform: translateY(-0.5rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        .duration-200 { animation-duration: 200ms; }
      `}</style>
        </div>
    );
};