// DashboardHeader.tsx
import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { THEME } from '../../constants';

interface HeaderProps {
    onRefresh: () => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({ onRefresh }) => (
    <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" style={{ color: THEME.primary }} />
                Operations Control Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                Real-time tracking of venue attendance, schedules, and verification metrics
            </p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onRefresh}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                title="Refresh"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
            </div>
        </div>
    </div>
);