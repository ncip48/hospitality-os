// EnrollmentStats.tsx
import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

interface EnrollmentStatsProps {
    totalStaff: number;
    enrolledStaff: number;
}

export const EnrollmentStats: React.FC<EnrollmentStatsProps> = ({ totalStaff, enrolledStaff }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">Total Staff</p>
                <p className="text-xl font-bold text-slate-900">{totalStaff}</p>
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">Enrolled</p>
                <p className="text-xl font-bold text-slate-900">{enrolledStaff}</p>
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">Pending Enrollment</p>
                <p className="text-xl font-bold text-slate-900">{totalStaff - enrolledStaff}</p>
            </div>
        </div>
    </div>
);