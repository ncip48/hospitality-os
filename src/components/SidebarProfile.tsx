import React, { useState } from 'react';
import {
    LogOut,
    User,
    Settings,
    HelpCircle,
    ChevronDown,
    Building2,
    Clock
} from 'lucide-react';
import { useMe, useLogout } from '../hooks/useApi';
import { THEME } from '../constants';

// Sidebar Profile Component
export const SidebarProfile: React.FC = () => {
    const { data: profile, isLoading } = useMe();
    const logoutMutation = useLogout();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logoutMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="border-t border-white/5 p-4 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-700/50 animate-pulse" />
                    <div className="flex-1">
                        <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse" />
                        <div className="h-2 w-16 bg-slate-700/50 rounded mt-1.5 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="border-t border-white/5 p-4 bg-black/20">
                <div className="p-3 rounded-lg text-center text-sm" style={{
                    backgroundColor: `${THEME.primary}11`,
                    border: `1px solid ${THEME.primary}33`,
                    color: '#fca5a5'
                }}>
                    ⚠️ Failed to load profile
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-white/5 bg-black/20 relative">
            {/* Profile Card */}
            <div className="p-4">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg flex-shrink-0 relative"
                        style={{
                            background: `linear-gradient(135deg, ${profile.avatar_bg || THEME.primary}, ${profile.avatar_bg || THEME.primaryDark}88)`,
                            boxShadow: `0 4px 12px ${profile.avatar_bg || THEME.primary}44`
                        }}
                    >
                        {profile.initials}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">
                                {profile.full_name}
                            </h4>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                {profile.role?.name || 'Staff'}
                            </span>
                            <span
                                className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ color: THEME.primary, backgroundColor: `${THEME.primary}22` }}
                            >
                                {profile.employment?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <User className="w-3.5 h-3.5" />
                                <span>ID: {profile.pk?.slice(0, 12)}...</span>
                            </div>
                            {profile.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>{profile.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-3 flex items-center gap-2">
                <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-slate-400 hover:text-white"
                    onClick={() => {/* Implement settings */ }}
                >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-slate-400 hover:text-white"
                    onClick={() => {/* Implement help */ }}
                >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Help
                </button>
            </div>

            {/* Logout Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden"
                    style={{
                        color: '#fca5a5',
                        border: `1px solid ${THEME.primary}33`,
                        backgroundColor: `${THEME.primary}11`
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${THEME.primary}22`;
                        e.currentTarget.style.borderColor = `${THEME.primary}55`;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${THEME.primary}11`;
                        e.currentTarget.style.borderColor = `${THEME.primary}33`;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {logoutMutation.isPending ? (
                        <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                            Signing out...
                        </>
                    ) : (
                        <>
                            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            Log Out
                        </>
                    )}
                </button>
            </div>

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