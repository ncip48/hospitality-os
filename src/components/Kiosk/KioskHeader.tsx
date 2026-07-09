// KioskHeader.tsx
import React from 'react';
import { Fingerprint, ArrowLeft } from 'lucide-react';
import { THEME } from '../../constants';

interface KioskHeaderProps {
    title: string;
    subtitle: string;
    onBack: () => void;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({ title, subtitle, onBack }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
                    background: THEME.primaryGradient,
                    boxShadow: `0 4px 16px ${THEME.primary}55`
                }}>
                    <Fingerprint className="w-5 h-5 text-white" />
                </div>
                {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 ml-14">
                {subtitle}
            </p>
        </div>
        <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
            <ArrowLeft className="w-4 h-4" />
            Back
        </button>
    </div>
);