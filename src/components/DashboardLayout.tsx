import React, { useState } from 'react';
import { Building2, Menu, X } from 'lucide-react';
import { THEME } from '../constants';
import { Header } from './Header';
import { SidebarProfile } from './SidebarProfile';
import { SidebarNavigation } from './SidebarNavigation';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">

            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
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
                `}
                style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
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

                {/* Logo Area & Mobile Close Button */}
                <div className="relative px-6 py-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0"
                            style={{
                                background: THEME.primaryGradient,
                                boxShadow: `0 4px 12px ${THEME.primary}55`
                            }}
                        >
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                                Hospitality OS
                            </h1>
                            <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">
                                Enterprise Platform
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <SidebarNavigation />
                <SidebarProfile />

                {/* Footer */}
                <div className="py-2 text-center text-[10px] text-slate-600 border-t border-white/5 bg-black/10">
                    v2.1.0 • © 2026 Hospitality OS
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 min-w-0">
                {/* Header Wrapper for Mobile Toggle */}
                <div className="flex items-center w-full">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-4 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <Header />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10">
                    {children}
                </div>
            </main>

        </div>
    );
};