// utils.ts
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const getStatusBadge = (log: any) => {
    if (log.clock_in && log.clock_out) {
        return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle };
    }
    if (log.clock_in && !log.clock_out) {
        return { label: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock };
    }
    return { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle };
};