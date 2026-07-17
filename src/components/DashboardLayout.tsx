import React, { useState, useEffect } from 'react';
import { Building2, Menu, X, Sparkles, Shield, Bell } from 'lucide-react';
import { THEME } from '../constants';
import { Header } from './Header';
import { SidebarProfile } from './SidebarProfile';
import { SidebarNavigation } from './SidebarNavigation';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isSidebarOpen]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
          fixed md:static inset-y-0 left-0 z-50 w-[280px] flex flex-col text-slate-200 overflow-hidden
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          shadow-2xl md:shadow-none
        `}
                style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: isSidebarOpen ? '4px 0 40px rgba(0,0,0,0.3)' : 'none'
                }}
            >
                {/* Decorative Blobs */}
                <div
                    className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)` }}
                />
                <div
                    className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-5 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)` }}
                />

                {/* Logo Area */}
                <div className="relative px-5 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0"
                            style={{
                                background: THEME.primaryGradient,
                                boxShadow: `0 4px 16px ${THEME.primary}55`
                            }}
                        >
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                                Hospitality OS
                            </h1>
                            <span className="text-[9px] text-slate-400 tracking-widest uppercase font-medium">
                                Enterprise Platform
                            </span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <SidebarNavigation />
                </div>

                {/* Profile - Fixed at bottom */}
                <div className="shrink-0">
                    <SidebarProfile />
                </div>

                {/* Footer */}
                <div className="py-2 text-center text-[10px] text-slate-600 border-t border-white/5 bg-black/10">
                    v2.1.0 • © 2026 Hospitality OS
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 min-w-0">
                {/* Header with Mobile Toggle */}
                <div className="flex items-center w-full shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-1 rounded-lg"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <Header />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {/* Optional decorative gradient overlay at top of content */}
                    <div className="relative">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 pointer-events-none" style={{
                            background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)`
                        }} />
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Bar - Quick Actions */}
                {isMobile && (
                    <div className="md:hidden flex items-center justify-around bg-white border-t border-slate-200 px-4 py-2 shrink-0">
                        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2596be] transition-colors">
                            <Building2 className="w-4 h-4" />
                            <span className="text-[8px]">Home</span>
                        </button>
                        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2596be] transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="text-[8px]">Alerts</span>
                        </button>
                        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#2596be] transition-colors">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[8px]">Actions</span>
                        </button>
                    </div>
                )}
            </main>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .duration-200 { animation-duration: 200ms; }
        .duration-300 { animation-duration: 300ms; }
      `}</style>
        </div>
    );
};