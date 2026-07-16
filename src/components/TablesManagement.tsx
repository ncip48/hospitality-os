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
    Unlink
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

// Reusable Modal Matching Your Theme
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
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">{title}</h3>
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

export const TablesManagement: React.FC = () => {
    const { hasPermission } = usePermission()
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

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

    // API Hooks
    const { data: tablesData, isLoading, refetch } = useTablesList(1);
    const createTableMutation = useCreateTable();
    const updateTableMutation = useUpdateTable();
    const deleteTableMutation = useDeleteTable();
    const toggleActiveMutation = useToggleTableActiveStatus();
    const seatWalkinMutation = useSeatWalkinGuests();
    const confirmPairingMutation = useConfirmTablePairing();
    const unpairMutation = useDeleteTablePairing();

    // QR Query - Only runs when QR modal is open and table is selected[cite: 3]
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

    // Derived Data
    const filteredTables = tablesData?.results?.filter((table) =>
        table.label.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    const totalCapacity = tablesData?.results?.reduce((sum, t) => sum + t.seats, 0) || 0;
    const occupiedTables = tablesData?.results?.filter(t => t.status !== 'free').length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Grid className="w-6 h-6" style={{ color: theme.primary }} />
                        Table Management
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage restaurant seating, walk-ins, and active statuses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="Refresh">
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => {
                                setLabel(''); setSeats(2); setIsActive(true); setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{ background: theme.primaryGradient, boxShadow: `0 4px 12px ${theme.primary}44` }}
                        >
                            <Plus className="w-4 h-4" />
                            New Table
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Total Tables</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{tablesData?.count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Total Capacity (Seats)</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalCapacity}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Occupied Tables</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{occupiedTables}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search table labels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ outlineColor: theme.primary }}
                />
            </div>

            {/* Tables Grid */}
            {/* Tables Grid */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Seats</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Access</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTables.map((table) => (
                                <tr key={table.pk} className={`transition-colors ${!table.is_active ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                                    <td className="px-6 py-4 font-semibold text-slate-900">{table.label}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{table.seats} Pax</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-slate-100 text-slate-700">
                                            {table.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 capitalize">{table.access_method}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">

                                            {/* Access method buttons based on integration request[cite: 3] */}
                                            <button onClick={() => { setActiveTable(table); setIsQrModalOpen(true); }} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50" title="View Table QR">
                                                <QrCode className="w-4 h-4" />
                                            </button>

                                            <button onClick={() => { setActiveTable(table); setIsPairingModalOpen(true); }} className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50" title="Manage Tablet Pairing">
                                                <Tablet className="w-4 h-4" />
                                            </button>

                                            {table.status === 'free' && table.is_active && (
                                                <button onClick={() => handleWalkinClick(table)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Seat Walk-in">
                                                    <Users className="w-4 h-4" />
                                                </button>
                                            )}

                                            {table.status === 'free' && (
                                                <button onClick={() => toggleActiveMutation.mutate(table.pk)} className={`p-1.5 rounded-lg ${table.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`} title="Toggle Active">
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button onClick={() => handleEditClick(table)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(table.pk, table.label)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2596be] focus:ring-[#2596be]"
                        />
                        <span className="text-sm font-medium text-slate-700">Table is Active (Available for seating)</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Create Table</button>
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Update Table</button>
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">This table has a physical capacity of {editingTable?.seats} seats.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsWalkinModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium bg-emerald-600 hover:bg-emerald-700">Confirm Seating</button>
                    </div>
                </form>
            </Modal>

            {/* Feature 1: QR Code Modal */}
            <Modal isOpen={isQrModalOpen} onClose={() => { setIsQrModalOpen(false); setActiveTable(null); }} title={`Table QR: ${activeTable?.label}`}>
                <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                    {isQrLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#2596be]" />
                    ) : (
                        <>
                            <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300 w-full flex flex-col items-center justify-center">
                                <QrCode className="w-24 h-24 text-slate-400 mb-4" />
                                {/* Replace icon above with an actual <img src={qrData.qr_url} /> once you hook up a real image payload */}
                                <p className="text-slate-600 text-sm">Scan this QR code to access the menu for {activeTable?.label}.</p>
                            </div>
                            <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium w-full">
                                Print QR Code
                            </button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Feature 2: Tablet Pairing Modal */}
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
                            <button onClick={handleUnpairTablet} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium">
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
                                    className="w-full px-3 py-3 text-center tracking-widest text-lg font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 uppercase"
                                    style={{ outlineColor: theme.primary }}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsPairingModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                                <button type="submit" disabled={!pairingCode || confirmPairingMutation.isPending} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: theme.primaryGradient }}>
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