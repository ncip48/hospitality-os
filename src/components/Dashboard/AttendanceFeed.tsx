// AttendanceFeed.tsx
import React from 'react';
import { Clock, Calendar, Fingerprint, ChevronRight, AlertTriangle } from 'lucide-react';
import { formatDate, formatTime, getStatusBadge } from '../../utils';
import { THEME } from '../../constants';

interface AttendanceFeedProps {
    logs: any[];
    isLoading: boolean;
    selectedStaffId: string | null;
    onSelectStaff: (id: string) => void;
}

export const AttendanceFeed: React.FC<AttendanceFeedProps> = ({ logs, isLoading, selectedStaffId, onSelectStaff }) => (
    <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Today's Attendance</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {formatDate(new Date().toISOString())}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{logs?.length || 0} entries</span>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-2 text-slate-500">Loading attendance data...</p>
                </div>
            ) : logs && logs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Staff</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Schedule</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Clock In</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Clock Out</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Details</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {logs.map((log) => {
                                const status = getStatusBadge(log);
                                const StatusIcon = status.icon;
                                const isLate = log.late_minutes && log.late_minutes > 0;

                                return (
                                    <tr
                                        key={log.pk}
                                        onClick={() => onSelectStaff(log.staff_id)}
                                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer group ${selectedStaffId === log.staff_id ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                                                    style={{ backgroundColor: THEME.primary, color: '#fff' }}
                                                >
                                                    {log.staff_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{log.staff_name}</div>
                                                    <div className="text-xs text-slate-400 truncate max-w-[100px]">ID: {log.staff_id?.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{log.scheduled_start ? log.scheduled_start : '--:--'}</div>
                                            {isLate ? (
                                                <div className="flex items-center gap-1 mt-0.5 text-xs text-red-600">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{log.late_minutes} min late</span>
                                                </div>
                                            ) : <></>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {log.clock_in ? formatTime(log.clock_in) : <span className="text-xs text-slate-400">--:--</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {log.clock_out ? formatTime(log.clock_out) : <span className="text-xs text-slate-400">--:--</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.verification_method && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-slate-600 capitalize">{log.verification_method.replace('_', ' ')}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-colors ${selectedStaffId === log.staff_id ? 'opacity-100 text-slate-600' : 'opacity-0 group-hover:opacity-100 group-hover:text-slate-600'}`} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No attendance records for today</p>
                    <p className="text-sm text-slate-400 mt-1">Records will appear here as staff clock in</p>
                </div>
            )}
        </div>
    </div>
);