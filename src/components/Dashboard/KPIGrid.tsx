// KPIGrid.tsx
import React from 'react';
import { Activity, Users, Timer, Shield } from 'lucide-react';

interface KPIGridProps {
    totalPunches: number;
    clockedIn: number;
    clockedOut: number;
    uniqueStaffCount: number;
    lateArrivals: number;
    avgLateMinutes: number;
    verificationMethodsCount: number;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
    totalPunches,
    clockedIn,
    clockedOut,
    uniqueStaffCount,
    lateArrivals,
    avgLateMinutes,
    verificationMethodsCount
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total Entries</span>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{totalPunches}</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-emerald-600 font-medium">✓ {clockedIn} Active</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{clockedOut} Completed</span>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Active Staff</span>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-500" />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{uniqueStaffCount}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <span>Today's attendance</span>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Late Arrivals</span>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-amber-500" />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{lateArrivals}</p>
            <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="text-amber-600">Avg {avgLateMinutes.toFixed(0)} min late</span>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Verification</span>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-500" />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{verificationMethodsCount}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>methods used</span>
            </div>
        </div>
    </div>
);