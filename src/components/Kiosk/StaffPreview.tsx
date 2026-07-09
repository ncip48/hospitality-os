import React from 'react';
import { User, X } from 'lucide-react';
import { THEME } from '../../constants';

interface StaffPreviewProps {
    staff: any;
    onClear: () => void;
}

export const StaffPreview: React.FC<StaffPreviewProps> = ({ staff, onClear }) => {
    if (!staff) return null;

    return (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-4 animate-in fade-in duration-300">
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
                style={{ backgroundColor: staff.avatar_bg || THEME.primary, color: staff.avatar_color || '#fff' }}
            >
                {staff.initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{staff.full_name}</div>
                <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        @{staff.username}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {staff.employment?.toUpperCase().replace('_', ' ')}
                    </span>
                    {staff.role && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {staff.role.name}
                        </span>
                    )}
                    {staff.is_enrolled && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Enrolled
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={onClear}
                className="p-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};