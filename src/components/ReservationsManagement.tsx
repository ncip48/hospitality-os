import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    Search,
    Plus,
    RefreshCw,
    Wand2,
    Check,
    X,
    Users,
    Clock,
    Trash2,
    Edit2,
    Ban,
    DollarSign,
    ArrowUpCircle,
    AlertCircle,
    LayoutGrid,
    List,
    Phone,
    User,
    Coffee,
    Table,
    Calendar,
    Globe,
    MessageCircle} from 'lucide-react';
import { format } from 'date-fns';
import {
    useReservationsList,
    useCreateReservation,
    useUpdateReservation,
    useDeleteReservation,
    useApproveReservation,
    useDeclineReservation,
    useSeatReservation,
    useCloseBillReservation,
    useNoShowReservation,
    useWaitlistReservation,
    usePromoteReservation,
    useSuggestTable,
    useTablesList
} from '../hooks/useApi';
import type { Reservation, ReservationStatus, ReservationSource, SuggestTableParams } from '../api/types';

const statusColors: Record<ReservationStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    waitlist: 'bg-purple-50 text-purple-700 border-purple-200',
    seated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
    no_show: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
    declined: 'bg-rose-50 text-rose-700 border-rose-200'
};

const statusIcons: Record<ReservationStatus, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    confirmed: <Check className="w-3 h-3" />,
    waitlist: <Users className="w-3 h-3" />,
    seated: <Coffee className="w-3 h-3" />,
    completed: <Check className="w-3 h-3" />,
    no_show: <X className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
    declined: <X className="w-3 h-3" />
};

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300`} onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-8 {
          from { 
            opacity: 0;
            transform: translateY(2rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom-8 {
          animation-name: slide-in-from-bottom-8;
        }
        .duration-200 { animation-duration: 200ms; }
        .duration-300 { animation-duration: 300ms; }
      `}</style>
        </>
    );
};

export const ReservationsManagement: React.FC = () => {
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    // View State
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);

    // Form State for Create/Edit
    const initialFormState = {
        guest_name: '',
        phone: '',
        party_size: 2,
        time: '',
        duration_minutes: 90,
        source: 'walkin' as ReservationSource,
        notes: '',
        assigned_table_id: '',
    };
    const [formData, setFormData] = useState(initialFormState);

    // Form State for Suggest Table
    const [suggestParams, setSuggestParams] = useState<SuggestTableParams>({
        time: '',
        party_size: 2,
        duration: 90
    });

    // Queries & Mutations
    const { data: tableData } = useTablesList(1);
    const { data: reservationsData, isLoading, refetch } = useReservationsList(page, searchTerm);
    const createMutation = useCreateReservation();
    const updateMutation = useUpdateReservation();
    const deleteMutation = useDeleteReservation();

    // Action Mutations
    const approveMutation = useApproveReservation();
    const declineMutation = useDeclineReservation();
    const seatMutation = useSeatReservation();
    const closeBillMutation = useCloseBillReservation();
    const noShowMutation = useNoShowReservation();
    const waitlistMutation = useWaitlistReservation();
    const promoteMutation = usePromoteReservation();

    // Suggest Table Query
    const { data: suggestedTable, isFetching: isSuggestLoading, refetch: fetchSuggestion, isError: suggestError } = useSuggestTable(suggestParams, false);

    // Filtered Data
    const filteredReservations = reservationsData?.results?.filter((res: Reservation) => {
        if (statusFilter === 'all') return true;
        return res.status === statusFilter;
    }) || [];

    // Stats
    const totalReservations = reservationsData?.count || 0;
    const pendingCount = reservationsData?.results?.filter((r: Reservation) => r.status === 'pending').length || 0;
    const confirmedCount = reservationsData?.results?.filter((r: Reservation) => r.status === 'confirmed').length || 0;
    const seatedCount = reservationsData?.results?.filter((r: Reservation) => r.status === 'seated').length || 0;

    // Handlers
    const handleOpenCreate = () => {
        setFormData({
            ...initialFormState,
            time: new Date().toISOString().slice(0, 16)
        });
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (res: Reservation) => {
        setActiveReservation(res);
        setFormData({
            guest_name: res.guest_name,
            phone: res.phone || '',
            party_size: res.party_size,
            time: new Date(res.time).toISOString().slice(0, 16),
            duration_minutes: res.duration_minutes,
            source: res.source,
            notes: res.notes || '',
            assigned_table_id: res.assigned_table?.pk || '',
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDetails = (res: Reservation) => {
        setActiveReservation(res);
        setIsDetailsModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(
            { ...formData, time: new Date(formData.time).toISOString() },
            { onSuccess: () => setIsCreateModalOpen(false) }
        );
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeReservation) return;
        updateMutation.mutate(
            { subid: activeReservation.pk, data: { ...formData, time: new Date(formData.time).toISOString() } },
            { onSuccess: () => setIsEditModalOpen(false) }
        );
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete reservation for ${name}?`)) deleteMutation.mutate(id);
    };

    const handleSuggestTable = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSuggestion();
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'website': return <Globe className="w-3 h-3" />;
            case 'whatsapp': return <MessageCircle className="w-3 h-3" />;
            case 'phone': return <Phone className="w-3 h-3" />;
            default: return <User className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="w-6 h-6" style={{ color: theme.primary }} />
                        Reservations
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage bookings, waitlists, and table seating</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => {
                            setSuggestParams({ time: new Date().toISOString().slice(0, 16), party_size: 2, duration: 90 });
                            setIsSuggestModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        Suggest Table
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                        style={{ background: theme.primaryGradient, boxShadow: `0 4px 12px ${theme.primary}44` }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 8px 20px ${theme.primary}55`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary}44`;
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        New Reservation
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total</span>
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalReservations}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Pending</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Confirmed</span>
                        <Check className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{confirmedCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Seated</span>
                        <Coffee className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{seatedCount}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search guest..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ outlineColor: theme.primary }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlist">Waitlist</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="no_show">No Show</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Table View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Reservations Display */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading reservations...</p>
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No reservations found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first reservation to get started'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredReservations.map((res: Reservation) => (
                        <div
                            key={res.pk}
                            className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => handleOpenDetails(res)}
                        >
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{res.guest_name}</h4>
                                        {res.phone && (
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                                                <Phone className="w-3 h-3" />
                                                {res.phone}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[res.status]}`}>
                                        {statusIcons[res.status]}
                                        {res.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {format(new Date(res.time), 'MMM dd')}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {format(new Date(res.time), 'HH:mm')}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        {res.party_size} pax
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Table className="w-3.5 h-3.5 text-slate-400" />
                                        {res.assigned_table?.label || 'Unassigned'}
                                    </div>
                                </div>

                                {/* Source Badge */}
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                        {getSourceIcon(res.source)}
                                        {res.source}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {res.duration_minutes}m
                                    </span>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                                    {res.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); approveMutation.mutate(res.pk); }}
                                                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); declineMutation.mutate(res.pk); }}
                                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                                title="Decline"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {res.status === 'waitlist' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); promoteMutation.mutate(res.pk); }}
                                            className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                                            title="Promote"
                                        >
                                            <ArrowUpCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    {res.status === 'confirmed' && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); seatMutation.mutate(res.pk); }}
                                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                title="Seat"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); noShowMutation.mutate(res.pk); }}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                title="No Show"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {res.status === 'seated' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); closeBillMutation.mutate(res.pk); }}
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                            title="Close Bill"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(res); }}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(res.pk, res.guest_name); }}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // TABLE VIEW
                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Table</th>
                                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReservations.map((res: Reservation) => (
                                <tr key={res.pk} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{res.guest_name}</div>
                                        {res.phone && <div className="text-slate-500 text-xs mt-0.5">{res.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-slate-900">{format(new Date(res.time), 'MMM dd, yyyy')}</div>
                                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {format(new Date(res.time), 'HH:mm')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-700">
                                            <Users className="w-4 h-4" /> {res.party_size} Pax
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5 capitalize flex items-center gap-1">
                                            {getSourceIcon(res.source)}
                                            {res.source}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {res.assigned_table?.label || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[res.status]}`}>
                                            {statusIcons[res.status]}
                                            {res.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => approveMutation.mutate(res.pk)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => declineMutation.mutate(res.pk)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Decline">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {res.status === 'waitlist' && (
                                                <button onClick={() => promoteMutation.mutate(res.pk)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Promote">
                                                    <ArrowUpCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {res.status === 'confirmed' && (
                                                <>
                                                    <button onClick={() => seatMutation.mutate(res.pk)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Seat">
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => noShowMutation.mutate(res.pk)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="No Show">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {res.status === 'seated' && (
                                                <button onClick={() => closeBillMutation.mutate(res.pk)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Close Bill">
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleOpenDetails(res)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors" title="View Details">
                                                <CalendarDays className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleOpenEdit(res)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(res.pk, res.guest_name)} className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {filteredReservations.length} of {totalReservations} reservations
                </span>
                <span>
                    {viewMode === 'grid' ? 'Grid View' : 'Table View'}
                </span>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                title={isEditModalOpen ? "Edit Reservation" : "New Reservation"}
            >
                <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.guest_name}
                                onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Party Size *</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.party_size}
                                onChange={e => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time *</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                            <input
                                type="number"
                                min="15"
                                step="15"
                                required
                                value={formData.duration_minutes}
                                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                            <select
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value as ReservationSource })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                                style={{ outlineColor: theme.primary }}
                            >
                                <option value="website">Website</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="phone">Phone</option>
                                <option value="walkin">Walk-in</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                                placeholder="Special requests, allergies, etc."
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                            style={{ background: theme.primaryGradient }}
                        >
                            {isEditModalOpen ? 'Save Changes' : 'Create Reservation'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Suggest Table Modal */}
            <Modal
                isOpen={isSuggestModalOpen}
                onClose={() => setIsSuggestModalOpen(false)}
                title="Suggest Best Table"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSuggestTable} className="space-y-4">
                    <div className="bg-purple-50 text-purple-800 text-sm p-4 rounded-xl border border-purple-100 flex items-start gap-2">
                        <Wand2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>The system will calculate existing bookings, waitlists, and capacities to find the optimal table.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Desired Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={suggestParams.time}
                                onChange={e => setSuggestParams({ ...suggestParams, time: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Party Size</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={suggestParams.party_size}
                                onChange={e => setSuggestParams({ ...suggestParams, party_size: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                            <input
                                type="number"
                                min="15"
                                step="15"
                                required
                                value={suggestParams.duration}
                                onChange={e => setSuggestParams({ ...suggestParams, duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                style={{ outlineColor: theme.primary }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSuggestLoading || !suggestParams.time}
                        className="w-full mt-2 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-all"
                        style={{ background: theme.primaryGradient }}
                    >
                        {isSuggestLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {isSuggestLoading ? 'Calculating...' : 'Find Table'}
                    </button>

                    {/* Result Banner */}
                    {suggestedTable && !isSuggestLoading && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-in fade-in duration-300">
                            <h4 className="font-bold text-emerald-900 text-lg">{suggestedTable.label}</h4>
                            <p className="text-emerald-700 text-sm mt-1">Optimal match: {suggestedTable.seats} seats available.</p>
                        </div>
                    )}
                    {suggestError && !isSuggestLoading && (
                        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 animate-in fade-in duration-300">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">No available tables found for this criteria.</p>
                        </div>
                    )}
                </form>
            </Modal>

            {/* Reservation Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => { setIsDetailsModalOpen(false); setActiveReservation(null); }}
                title="Reservation Details"
                maxWidth="max-w-md"
            >
                {activeReservation && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">{activeReservation.guest_name}</h4>
                                {activeReservation.phone && (
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {activeReservation.phone}
                                    </p>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[activeReservation.status]}`}>
                                {statusIcons[activeReservation.status]}
                                {activeReservation.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-xs text-slate-500">Date & Time</p>
                                <p className="font-medium text-slate-900">
                                    {format(new Date(activeReservation.time), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {format(new Date(activeReservation.time), 'HH:mm')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Duration</p>
                                <p className="font-medium text-slate-900">{activeReservation.duration_minutes} minutes</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Party Size</p>
                                <p className="font-medium text-slate-900">{activeReservation.party_size} guests</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Table</p>
                                <p className="font-medium text-slate-900">{activeReservation.assigned_table?.label || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Source</p>
                                <p className="font-medium text-slate-900 capitalize">{activeReservation.source}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Created</p>
                                <p className="font-medium text-slate-900 text-sm">
                                    {format(new Date(activeReservation.created_at), 'MMM dd, HH:mm')}
                                </p>
                            </div>
                        </div>

                        {activeReservation.notes && (
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Notes</p>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {activeReservation.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setIsDetailsModalOpen(false); }}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    handleOpenEdit(activeReservation);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
                                style={{ background: theme.primaryGradient }}
                            >
                                <Edit2 className="w-4 h-4 inline mr-2" />
                                Edit Reservation
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};