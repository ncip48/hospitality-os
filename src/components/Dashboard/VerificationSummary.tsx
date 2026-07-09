// VerificationSummary.tsx
import React from 'react';
import { Fingerprint } from 'lucide-react';

interface VerificationSummaryProps {
    methods: Record<string, number>;
}

export const VerificationSummary: React.FC<VerificationSummaryProps> = ({ methods }) => {
    if (Object.keys(methods || {}).length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-4 h-4 text-slate-400" />
                <h4 className="font-medium text-slate-900 text-sm">Verification Methods</h4>
            </div>
            <div className="flex flex-wrap gap-3">
                {Object.entries(methods).map(([method, count]) => (
                    <div key={method} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                            {method.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};