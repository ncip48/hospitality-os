// Dashboard.tsx
import React, { useState, useMemo } from 'react';
import { useTodayAttendance, useStaffAttendanceHistory } from '../hooks/useApi';
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { KPIGrid } from '../components/Dashboard/KPIGrid';
import { AttendanceFeed } from '../components/Dashboard/AttendanceFeed';
import { StaffHistorySidebar } from '../components/Dashboard/StaffHistorySidebar';
import { VerificationSummary } from '../components/Dashboard/VerificationSummary';

export const Dashboard: React.FC = () => {
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    const { data: todayLogs, isLoading: loadingToday, refetch } = useTodayAttendance();
    const { data: historyLogs, isFetching: loadingHistory } = useStaffAttendanceHistory(
        selectedStaffId || '',
        !!selectedStaffId
    );

    // Compute metrics
    const metrics = useMemo(() => {
        const logs = todayLogs || [];
        const totalPunches = logs.length;
        const uniqueStaffCount = new Set(logs.map(log => log.staff_id)).size;
        const clockedIn = logs.filter(log => log.clock_in && !log.clock_out).length;
        const clockedOut = logs.filter(log => log.clock_in && log.clock_out).length;

        const lateArrivals = logs.filter(log => (log.late_minutes || 0) > 0).length;
        const avgLateMinutes = logs.reduce((acc, log) => acc + (log.late_minutes || 0), 0) / (totalPunches || 1);

        const verificationMethods = logs.reduce((acc: Record<string, number>, log) => {
            if (log.verification_method) {
                acc[log.verification_method] = (acc[log.verification_method] || 0) + 1;
            }
            return acc;
        }, {});

        return {
            totalPunches,
            uniqueStaffCount,
            clockedIn,
            clockedOut,
            lateArrivals,
            avgLateMinutes,
            verificationMethods
        };
    }, [todayLogs]);

    return (
        <div className="space-y-6">
            <DashboardHeader onRefresh={refetch} />

            <KPIGrid
                totalPunches={metrics.totalPunches}
                clockedIn={metrics.clockedIn}
                clockedOut={metrics.clockedOut}
                uniqueStaffCount={metrics.uniqueStaffCount}
                lateArrivals={metrics.lateArrivals}
                avgLateMinutes={metrics.avgLateMinutes}
                verificationMethodsCount={Object.keys(metrics.verificationMethods).length}
            />

            <div className="flex flex-col xl:flex-row gap-6">
                <AttendanceFeed
                    logs={todayLogs || []}
                    isLoading={loadingToday}
                    selectedStaffId={selectedStaffId}
                    onSelectStaff={setSelectedStaffId}
                />

                <StaffHistorySidebar
                    logs={historyLogs || []}
                    isLoading={loadingHistory}
                    selectedStaffId={selectedStaffId}
                    onClearSelection={() => setSelectedStaffId(null)}
                />
            </div>

            <VerificationSummary methods={metrics.verificationMethods} />
        </div>
    );
};