// StaffHistorySidebar.tsx
import React from 'react';
import { User, XCircle, Users, Calendar, AlertTriangle, Fingerprint } from 'lucide-react';
import { formatDate, formatTime } from '../../utils';

interface StaffHistorySidebarProps {
    logs: any[];
    isLoading: boolean;
    selectedStaffId: string | null;
    onClearSelection: () => void;
}

export const StaffHistorySidebar: React.FC<StaffHistorySidebarProps> = ({ logs, isLoading, selectedStaffId, onClearSelection }) => (
    <div className="xl:w-[420px] flex-shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Staff History</h3>
                </div>
                {selectedStaffId && (
                    <button
                        onClick={onClearSelection}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
                {!selectedStaffId ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Select a staff member</p>
                        <p className="text-xs text-slate-400 mt-1">Click on any employee in the feed to view their history</p>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                        <p className="mt-2 text-sm text-slate-500">Loading history...</p>
                    </div>
                ) : logs && logs.length > 0 ? (
                    <div className="space-y-3">
                        {logs.map((item, index) => {
                            const isCompleted = item.clock_in && item.clock_out;
                            const isLate = item.late_minutes && item.late_minutes > 0;

                            return (
                                <div key={item.pk} className={`relative pl-6 pb-4 ${index < logs.length - 1 ? 'border-l-2 border-slate-200' : ''}`}>
                                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-emerald-100 border-emerald-500' : 'bg-blue-100 border-blue-500'}`} />

                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-700' : 'text-blue-700'}`}>
                                                {isCompleted ? 'Completed Shift' : 'Active Shift'}
                                            </span>
                                            <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            <div>
                                                <span className="text-xs text-slate-400">In:</span>
                                                <span className="ml-1 text-slate-700">{item.clock_in ? formatTime(item.clock_in) : '--:--'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-400">Out:</span>
                                                <span className="ml-1 text-slate-700">{item.clock_out ? formatTime(item.clock_out) : '--:--'}</span>
                                            </div>
                                        </div>

                                        {item.scheduled_start && <div className="text-xs text-slate-500 mt-1">Scheduled: {item.scheduled_start}</div>}

                                        {isLate ? (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>{item.late_minutes} minutes late</span>
                                            </div>
                                        ) : <></>}

                                        {item.verification_method && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                <Fingerprint className="w-3 h-3" />
                                                <span className="capitalize">{item.verification_method.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500">No history found</p>
                        <p className="text-xs text-slate-400 mt-1">This staff member has no recorded attendance</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);