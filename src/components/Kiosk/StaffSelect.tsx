// StaffSelect.tsx
import React from 'react';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import { THEME } from '../../constants';

interface StaffSelectProps {
    staffData: any[];
    selectedPk: string;
    isLoading: boolean;
    isError: boolean;
    onChange: (pk: string) => void;
    onRefresh: () => void;
}

export const StaffSelect: React.FC<StaffSelectProps> = ({ staffData, selectedPk, isLoading, isError, onChange, onRefresh }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-[#2596be]" />
                <span className="text-sm text-slate-500">Loading staff directory...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium">Error loading staff records</p>
                    <p className="text-xs text-red-600">Verify permission token layer</p>
                </div>
                <button onClick={onRefresh} className="ml-auto p-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
                value={selectedPk}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all appearance-none"
                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
            >
                <option value="">-- Choose Staff Member --</option>
                {staffData?.map((person) => (
                    <option key={person.pk} value={person.pk}>
                        {person.full_name} (@{person.username})
                    </option>
                ))}
            </select>
        </div>
    );
};