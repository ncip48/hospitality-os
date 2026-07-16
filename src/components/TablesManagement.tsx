import React, { useState, useEffect } from 'react';
import {
    Grid,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    X,
    Plus,
    Users,
    Power,
    QrCode,
    Tablet,
    LinkIcon,
    Unlink,
    LayoutGrid,
    List,
    Coffee,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import {
    useTablesList,
    useCreateTable,
    useUpdateTable,
    useDeleteTable,
    useToggleTableActiveStatus,
    useSeatWalkinGuests,
    useConfirmTablePairing,
    useDeleteTablePairing,
    useTableQr
} from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';
import type { Table } from '../api/types';
import { THEME } from '../constants';

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
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
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">{title}</h3>
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

export const TablesManagement: React.FC = () => {
    const { hasPermission } = usePermission();

    // View State
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

    // Form State
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [activeTable, setActiveTable] = useState<Table | null>(null);
    const [label, setLabel] = useState('');
    const [seats, setSeats] = useState<number>(2);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [walkinGuests, setWalkinGuests] = useState<number>(1);
    const [pairingCode, setPairingCode] = useState('');

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'free' | 'occupied' | 'reserved'>('all');

    // API Hooks
    const { data: tablesData, isLoading, refetch } = useTablesList(1);
    const createTableMutation = useCreateTable();
    const updateTableMutation = useUpdateTable();
    const deleteTableMutation = useDeleteTable();
    const toggleActiveMutation = useToggleTableActiveStatus();
    const seatWalkinMutation = useSeatWalkinGuests();
    const confirmPairingMutation = useConfirmTablePairing();
    const unpairMutation = useDeleteTablePairing();

    const { data: qrData, isLoading: isQrLoading } = useTableQr(
        activeTable?.pk || '',
        isQrModalOpen && !!activeTable
    );

    // Handlers
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTableMutation.mutate(
            { label, seats, is_active: isActive },
            { onSuccess: () => { setIsCreateModalOpen(false); setLabel(''); setSeats(2); } }
        );
    };

    const handleEditClick = (table: Table) => {
        setEditingTable(table);
        setActiveTable(table);
        setLabel(table.label);
        setSeats(table.seats);
        setIsActive(table.is_active);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTable) return;
        updateTableMutation.mutate(
            { subid: activeTable.pk, data: { label, seats, is_active: isActive } },
            { onSuccess: () => setIsEditModalOpen(false) }
        );
    };

    const handleDelete = (tablePk: string, tableLabel: string) => {
        if (confirm(`Are you sure you want to delete table "${tableLabel}"?`)) {
            deleteTableMutation.mutate(tablePk);
        }
    };

    const handleWalkinClick = (table: Table) => {
        setEditingTable(table);
        setActiveTable(table);
        setWalkinGuests(table.seats);
        setIsWalkinModalOpen(true);
    };

    const handleWalkinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTable) return;
        seatWalkinMutation.mutate(
            { subid: activeTable.pk, data: { guests: walkinGuests } },
            { onSuccess: () => setIsWalkinModalOpen(false) }
        );
    };

    const handleConfirmPairingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTable || !pairingCode) return;
        confirmPairingMutation.mutate(
            { subid: activeTable.pk, data: { code: pairingCode } },
            { onSuccess: () => { setPairingCode(''); setIsPairingModalOpen(false); } }
        );
    };

    const handleUnpairTablet = () => {
        if (!activeTable) return;
        if (confirm(`Are you sure you want to unpair the tablet for ${activeTable.label}?`)) {
            unpairMutation.mutate(activeTable.pk, { onSuccess: () => setIsPairingModalOpen(false) });
        }
    };

    // Filtered Data
    const filteredTables = tablesData?.results?.filter((table) => {
        const matchesSearch = table.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    // Stats
    const totalCapacity = tablesData?.results?.reduce((sum, t) => sum + t.seats, 0) || 0;
    const occupiedTables = tablesData?.results?.filter(t => t.status !== 'free').length || 0;
    const activeTables = tablesData?.results?.filter(t => t.is_active).length || 0;

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'free': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'occupied': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'reserved': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'free': return <CheckCircle className="w-4 h-4" />;
            case 'occupied': return <Users className="w-4 h-4" />;
            case 'reserved': return <Clock className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Grid className="w-6 h-6" style={{ color: THEME.primary }} />
                        Table Management
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage restaurant seating, walk-ins, and tablet pairing</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Refresh">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => { setLabel(''); setSeats(2); setIsActive(true); setIsCreateModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{ background: THEME.primaryGradient, boxShadow: `0 4px 12px ${THEME.primary}44` }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 20px ${THEME.primary}55`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.primary}44`;
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            New Table
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Tables</span>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Grid className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{tablesData?.count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Capacity</span>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalCapacity}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Occupied</span>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{occupiedTables}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Active Tables</span>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Power className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{activeTables}</p>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ outlineColor: THEME.primary }}
                    >
                        <option value="all">All Status</option>
                        <option value="free">Free</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
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

            {/* Tables Display */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading tables...</p>
                </div>
            ) : filteredTables.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No tables found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first table to get started'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTables.map((table) => (
                        <div
                            key={table.pk}
                            className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${!table.is_active ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-[#2596be]/30'
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{table.label}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-slate-500">{table.seats} seats</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getStatusColor(table.status)}`}>
                                                {getStatusIcon(table.status)}
                                                {table.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${table.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {table.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                    <span className="capitalize">{table.access_method || 'qr'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span>{table.access_method === 'tablet' ? 'Tablet Paired' : 'QR Code'}</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => { setActiveTable(table); setIsQrModalOpen(true); }}
                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                                        title="View QR Code"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setActiveTable(table); setIsPairingModalOpen(true); }}
                                        className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                                        title="Manage Tablet"
                                    >
                                        <Tablet className="w-4 h-4" />
                                    </button>
                                    {table.status === 'free' && table.is_active && (
                                        <button
                                            onClick={() => handleWalkinClick(table)}
                                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                            title="Seat Walk-in"
                                        >
                                            <Users className="w-4 h-4" />
                                        </button>
                                    )}
                                    {table.status === 'free' && (
                                        <button
                                            onClick={() => toggleActiveMutation.mutate(table.pk)}
                                            className={`p-1.5 rounded-lg transition-colors ${table.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'
                                                }`}
                                            title={table.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditClick(table)}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(table.pk, table.label)}
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
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Seats</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Access</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTables.map((table) => (
                                <tr key={table.pk} className={`hover:bg-slate-50/50 transition-colors ${!table.is_active ? 'opacity-60' : ''}`}>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{table.label}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{table.seats}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(table.status)}`}>
                                            {getStatusIcon(table.status)}
                                            {table.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 capitalize">
                                        <div className="flex items-center gap-1.5">
                                            {table.access_method === 'tablet' ? <Tablet className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                                            {table.access_method || 'qr'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${table.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {table.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {table.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => { setActiveTable(table); setIsQrModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors" title="QR Code">
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setActiveTable(table); setIsPairingModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors" title="Tablet">
                                                <Tablet className="w-4 h-4" />
                                            </button>
                                            {table.status === 'free' && table.is_active && (
                                                <button onClick={() => handleWalkinClick(table)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Walk-in">
                                                    <Users className="w-4 h-4" />
                                                </button>
                                            )}
                                            {table.status === 'free' && (
                                                <button onClick={() => toggleActiveMutation.mutate(table.pk)} className={`p-1.5 rounded-lg transition-colors ${table.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEditClick(table)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(table.pk, table.label)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
                    Showing {filteredTables.length} of {tablesData?.count || 0} tables
                </span>
                <span>
                    {viewMode === 'grid' ? 'Grid View' : 'Table View'}
                </span>
            </div>

            {/* Modals (unchanged from original) */}
            {/* Create Table Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Table">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Table Label (Max 10 chars)</label>
                        <input
                            type="text"
                            maxLength={10}
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g., T-01, VIP-1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Seats (Capacity)</label>
                        <input
                            type="number"
                            min={1}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-2"
                            style={{ accentColor: THEME.primary }}
                        />
                        <span className="text-sm font-medium text-slate-700">Table is Active (Available for seating)</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={createTableMutation.isPending} className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50" style={{ background: THEME.primaryGradient }}>
                            {createTableMutation.isPending ? 'Creating...' : 'Create Table'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Table Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingTable(null); }} title={`Edit Table: ${editingTable?.label}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Table Label (Max 10 chars)</label>
                        <input
                            type="text"
                            maxLength={10}
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Seats (Capacity)</label>
                        <input
                            type="number"
                            min={1}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={updateTableMutation.isPending} className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50" style={{ background: THEME.primaryGradient }}>
                            {updateTableMutation.isPending ? 'Updating...' : 'Update Table'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Seat Walk-in Modal */}
            <Modal isOpen={isWalkinModalOpen} onClose={() => { setIsWalkinModalOpen(false); setEditingTable(null); }} title={`Seat Walk-in Guests: ${editingTable?.label}`}>
                <form onSubmit={handleWalkinSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of Guests</label>
                        <input
                            type="number"
                            min={1}
                            value={walkinGuests}
                            onChange={(e) => setWalkinGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">This table has a physical capacity of {editingTable?.seats} seats.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsWalkinModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={seatWalkinMutation.isPending} className="flex-1 px-4 py-2 rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                            {seatWalkinMutation.isPending ? 'Seating...' : 'Confirm Seating'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* QR Code Modal */}
            <Modal isOpen={isQrModalOpen} onClose={() => { setIsQrModalOpen(false); setActiveTable(null); }} title={`Table QR: ${activeTable?.label}`}>
                <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                    {isQrLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#2596be]" />
                    ) : (
                        <>
                            <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300 w-full flex flex-col items-center justify-center">
                                <QrCode className="w-24 h-24 text-slate-400 mb-4" />
                                <p className="text-slate-600 text-sm">Scan this QR code to access the menu for {activeTable?.label}.</p>
                            </div>
                            <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium w-full hover:bg-slate-700 transition-colors">
                                Print QR Code
                            </button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Tablet Pairing Modal */}
            <Modal isOpen={isPairingModalOpen} onClose={() => { setIsPairingModalOpen(false); setActiveTable(null); setPairingCode(''); }} title={`Tablet Pairing: ${activeTable?.label}`}>
                <div className="space-y-6">
                    {activeTable?.access_method === 'tablet' ? (
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-semibold text-emerald-800 flex items-center gap-2">
                                    <Tablet className="w-4 h-4" /> Tablet Currently Paired
                                </span>
                                <span className="text-sm text-emerald-600 mt-1">This table is actively linked to a device.</span>
                            </div>
                            <button onClick={handleUnpairTablet} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                                <Unlink className="w-4 h-4" /> Unpair
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleConfirmPairingSubmit} className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                Open the tablet app and request a pairing code. Enter the 6-digit code below to bind the device to this table.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pairing Code</label>
                                <input
                                    type="text"
                                    value={pairingCode}
                                    onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., A1B2C3"
                                    maxLength={6}
                                    className="w-full px-3 py-3 text-center tracking-widest text-lg font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 uppercase transition-all"
                                    style={{ outlineColor: THEME.primary }}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsPairingModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={!pairingCode || confirmPairingMutation.isPending} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-all" style={{ background: THEME.primaryGradient }}>
                                    <LinkIcon className="w-4 h-4" /> Link Tablet
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
};