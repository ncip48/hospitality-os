import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { NAV_ITEMS, PAGE_DESCRIPTIONS } from '../constants'; // Adjust import path

export const Header: React.FC = () => {
    const location = useLocation();

    const currentNavItem = NAV_ITEMS.find(item => item.path === location.pathname);
    const title = currentNavItem?.label || 'Dashboard';
    const description = PAGE_DESCRIPTIONS[location.pathname] || 'Welcome back to your dashboard';

    return (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-10 py-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {description}
                    </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>System Online</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
                </div>
            </div>
        </div>
    );
};