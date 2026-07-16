import React, { useState, useEffect } from 'react';
import {
    CalendarDays, Search, Plus, RefreshCw, Wand2,
    Check, X, Users, Clock, Trash2, Edit2, Ban, DollarSign, ArrowUpCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
    useReservationsList, useCreateReservation, useUpdateReservation, useDeleteReservation,
    useApproveReservation, useDeclineReservation, useSeatReservation,
    useCloseBillReservation, useNoShowReservation, useWaitlistReservation,
    usePromoteReservation, useSuggestTable,
    useTablesList
} from '../hooks/useApi';
import type { Reservation, ReservationStatus, ReservationSource, SuggestTableParams } from '../api/types';

const statusColors: Record<ReservationStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    waitlist: 'bg-purple-100 text-purple-800',
    seated: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-800',
    no_show: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    declined: 'bg-rose-100 text-rose-800'
};

// Reusable Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
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
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </>
    );
};

export const ReservationsManagement: React.FC = () => {
    const theme = {
        primary: '#2596be',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
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

    // Suggest Table Query (disabled by default, manually refetched)
    const { data: suggestedTable, isFetching: isSuggestLoading, refetch: fetchSuggestion, isError: suggestError } = useSuggestTable(suggestParams, false);

    // Handlers
    const handleOpenCreate = () => {
        setFormData(initialFormState);
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (res: Reservation) => {
        setActiveReservation(res);
        setFormData({
            guest_name: res.guest_name,
            phone: res.phone || '',
            party_size: res.party_size,
            time: new Date(res.time).toISOString().slice(0, 16), // Format for datetime-local
            duration_minutes: res.duration_minutes,
            source: res.source,
            notes: res.notes || '',
            assigned_table_id: res.assigned_table.pk || '',
        });
        setIsEditModalOpen(true);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="w-6 h-6" style={{ color: theme.primary }} />
                        Reservations
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage bookings, waitlists, and seating.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => {
                            setSuggestParams({ time: new Date().toISOString().slice(0, 16), party_size: 2, duration: 90 });
                            setIsSuggestModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                    >
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        Suggest Table
                    </button>

                    <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-lg hover:opacity-90" style={{ background: theme.primaryGradient }}>
                        <Plus className="w-4 h-4" />
                        New Reservation
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search guest name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading reservations...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Table</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reservationsData?.results?.map((res: Reservation) => (
                                <tr key={res.pk} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{res.guest_name}</div>
                                        <div className="text-slate-500 text-xs mt-0.5">{res.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-slate-900">{format(new Date(res.time), 'MMM dd, yyyy')}</div>
                                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {format(new Date(res.time), 'HH:mm')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2 py-1 rounded-md w-fit">
                                            <Users className="w-4 h-4" /> {res.party_size} Pax
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 capitalize">{res.source}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {res.assigned_table ? res.assigned_table.label : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[res.status]}`}>
                                            {res.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Status-specific Actions */}
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => approveMutation.mutate(res.pk)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => declineMutation.mutate(res.pk)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Decline"><X className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            {res.status === 'waitlist' && (
                                                <button onClick={() => promoteMutation.mutate(res.pk)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Promote to Confirmed"><ArrowUpCircle className="w-4 h-4" /></button>
                                            )}
                                            {res.status === 'confirmed' && (
                                                <>
                                                    <button onClick={() => seatMutation.mutate(res.pk)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Seat Guests"><Users className="w-4 h-4" /></button>
                                                    <button onClick={() => waitlistMutation.mutate(res.pk)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Move to Waitlist"><Clock className="w-4 h-4" /></button>
                                                    <button onClick={() => noShowMutation.mutate(res.pk)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Mark No-Show"><Ban className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            {res.status === 'seated' && (
                                                <button onClick={() => closeBillMutation.mutate(res.pk)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Close Bill"><DollarSign className="w-4 h-4" /></button>
                                            )}

                                            {/* Standard Actions */}
                                            <button onClick={() => handleOpenEdit(res)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(res.pk, res.guest_name)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create & Edit Modal */}
            <Modal isOpen={isCreateModalOpen || isEditModalOpen} onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} title={isEditModalOpen ? "Edit Reservation" : "New Reservation"}>
                <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name</label>
                            <input type="text" required value={formData.guest_name} onChange={e => setFormData({ ...formData, guest_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Party Size</label>
                            <input type="number" min="1" required value={formData.party_size} onChange={e => setFormData({ ...formData, party_size: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                            <input type="datetime-local" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                            <input type="number" min="15" step="15" required value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Table</label>
                            <select value={formData.assigned_table_id} onChange={e => setFormData({ ...formData, assigned_table_id: e.target.value as ReservationSource })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none bg-white" style={{ outlineColor: theme.primary }}>
                                {tableData?.results?.map(table => {
                                    return <option value={table.pk}>{table.label}</option>
                                })}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                            <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value as ReservationSource })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none bg-white" style={{ outlineColor: theme.primary }}>
                                <option value="website">Website</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="phone">Phone</option>
                                <option value="walkin">Walk-in</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                            <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: theme.primaryGradient }}>
                            {isEditModalOpen ? 'Save Changes' : 'Create Reservation'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Suggest Table Modal */}
            <Modal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} title="Suggest Best Table">
                <form onSubmit={handleSuggestTable} className="space-y-4">
                    <div className="bg-purple-50 text-purple-800 text-sm p-4 rounded-xl border border-purple-100 flex items-start gap-2">
                        <Wand2 className="w-5 h-5 shrink-0" />
                        <p>Enter the reservation details below. The system will calculate existing bookings, waitlists, and capacities to find the optimal table.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Desired Date & Time</label>
                            <input type="datetime-local" required value={suggestParams.time} onChange={e => setSuggestParams({ ...suggestParams, time: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Party Size</label>
                            <input type="number" min="1" required value={suggestParams.party_size} onChange={e => setSuggestParams({ ...suggestParams, party_size: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                            <input type="number" min="15" step="15" required value={suggestParams.duration} onChange={e => setSuggestParams({ ...suggestParams, duration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none" style={{ outlineColor: theme.primary }} />
                        </div>
                    </div>

                    <button type="submit" disabled={isSuggestLoading || !suggestParams.time} className="w-full mt-2 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: theme.primaryGradient }}>
                        {isSuggestLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {isSuggestLoading ? 'Calculating...' : 'Find Table'}
                    </button>

                    {/* Result Banner */}
                    {suggestedTable && !isSuggestLoading && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                            <h4 className="font-bold text-emerald-900 text-lg">{suggestedTable.label}</h4>
                            <p className="text-emerald-700 text-sm mt-1">Optimal match: {suggestedTable.seats} seats available.</p>
                        </div>
                    )}
                    {suggestError && !isSuggestLoading && (
                        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">No available tables found for this criteria.</p>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};