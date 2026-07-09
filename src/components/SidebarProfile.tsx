import React from 'react';
import { LogOut } from 'lucide-react';
import { useMe, useLogout } from '../hooks/useApi';
import { THEME } from '../constants';

export const SidebarProfile: React.FC = () => {
    const { data: profile, isLoading } = useMe();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logoutMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="border-t border-white/5 p-4 bg-black/20 relative">
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
            <div className="border-t border-white/5 p-4 bg-black/20 relative">
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
        <div className="border-t border-white/5 p-4 bg-black/20 relative">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg flex-shrink-0"
                    style={{
                        background: `linear-gradient(135deg, ${profile.avatar_bg || THEME.primary}, ${profile.avatar_bg || THEME.primaryDark}88)`,
                        boxShadow: `0 4px 12px ${profile.avatar_bg || THEME.primary}44`
                    }}
                >
                    {profile.initials}
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                        {profile.full_name}
                    </h4>
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

            <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                    color: '#fca5a5',
                    border: `1px solid ${THEME.primary}33`,
                    backgroundColor: `${THEME.primary}11`
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${THEME.primary}22`;
                    e.currentTarget.style.borderColor = `${THEME.primary}55`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${THEME.primary}11`;
                    e.currentTarget.style.borderColor = `${THEME.primary}33`;
                }}
            >
                {logoutMutation.isPending ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        Signing out...
                    </>
                ) : (
                    <>
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </>
                )}
            </button>
        </div>
    );
};