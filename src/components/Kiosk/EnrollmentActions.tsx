// EnrollmentActions.tsx
import React from 'react';
import { CheckCircle, AlertCircle, UserPlus, Building2 } from 'lucide-react';
import { THEME } from '../../constants';

interface EnrollmentActionsProps {
    isReady: boolean;
    isPending: boolean;
    staffName?: string;
    onEnroll: () => void;
}

export const EnrollmentActions: React.FC<EnrollmentActionsProps> = ({ isReady, isPending, staffName, onEnroll }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isReady ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in duration-300 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-emerald-700">Ready for Enrollment</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                        Face structure mapping will be linked to {staffName}'s profile
                    </p>
                </div>
            </div>
        ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-slate-700">Awaiting Selection</p>
                    <p className="text-xs text-slate-500 mt-0.5">Select a staff member and upload their photo to begin enrollment</p>
                </div>
            </div>
        )}

        <button
            onClick={onEnroll}
            disabled={isPending || !isReady}
            className="w-full px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
                background: !isReady ? '#cbd5e1' : THEME.primaryGradient,
                boxShadow: !isReady ? 'none' : `0 4px 16px ${THEME.primary}55`
            }}
        >
            {isPending ? (
                <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Compiling Face Vector Maps...
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Confirm Upload & Assign Registration
                </>
            )}
        </button>

        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                <span>Hospitality OS v2.1.0</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Secure Connection</span>
            </div>
        </div>
    </div>
);