import React, { useState, useEffect } from 'react';
import {
    UtensilsCrossed,
    Plus,
    Trash2,
    Edit2,
    Search,
    Filter,
    RefreshCw,
    X,
    Tag,
    Coins,
    Sparkles
} from 'lucide-react';
import {
    useMenuItems,
    useMenuCategories,
    useCreateMenuItem,
    useUpdateMenuItem,
    useDeleteMenuItem
} from '../hooks/useApi'; // Swap with your actual API hooks file
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';

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

export const MenuItemManagement: React.FC = () => {
    const { hasPermission } = usePermission();
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'available' | 'soldout'>('available');
    const [isPopular, setIsPopular] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Hooks
    const { data: itemsData, isLoading: loadingItems, refetch: refetchItems } = useMenuItems();
    const { data: categoriesData } = useMenuCategories();
    const createItemMutation = useCreateMenuItem();
    const updateItemMutation = useUpdateMenuItem();
    const deleteItemMutation = useDeleteMenuItem();

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createItemMutation.mutate(
            { name, category_id: categoryId, price, description, status, is_popular: isPopular },
            {
                onSuccess: () => {
                    resetForm();
                    setIsCreateModalOpen(false);
                    refetchItems();
                }
            }
        );
    };

    const handleEditClick = (item: any) => {
        setEditingItem(item);
        setName(item.name);
        setCategoryId(item.category?.pk || '');
        setPrice(item.price);
        setDescription(item.description || '');
        setStatus(item.status);
        setIsPopular(item.is_popular);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        updateItemMutation.mutate(
            { pk: editingItem.pk, data: { name, category_id: categoryId, price, description, status, is_popular: isPopular } },
            {
                onSuccess: () => {
                    resetForm();
                    setIsEditModalOpen(false);
                    refetchItems();
                }
            }
        );
    };

    const handleDelete = (itemPk: number | string, itemName: string) => {
        if (confirm(`Are you sure you want to permanently remove "${itemName}" from the database?`)) {
            deleteItemMutation.mutate(itemPk, { onSuccess: () => refetchItems() });
        }
    };

    const resetForm = () => {
        setName('');
        setCategoryId('');
        setPrice('');
        setDescription('');
        setStatus('available');
        setIsPopular(false);
        setEditingItem(null);
    };

    // Filter Logic
    const filteredItems = itemsData?.results?.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || String(item.category?.pk) === filterCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6" style={{ color: theme.primary }} />
                        Menu Inventory
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Configure individual dishes, beverages, pricing structures, and stock availability.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetchItems()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{ background: theme.primaryGradient, boxShadow: `0 4px 12px ${theme.primary}44` }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Menu Item
                        </button>
                    )}
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                        style={{ outlineColor: theme.primary }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                        style={{ outlineColor: theme.primary }}
                    >
                        <option value="all">All Categories</option>
                        {categoriesData?.results?.map((cat: any) => (
                            <option key={cat.pk} value={String(cat.pk)}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Items Layout */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loadingItems ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                        <p className="mt-2 text-slate-500">Loading catalog...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No items found matching the filter</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Item Info</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pricing</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Availability</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Popular</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredItems.map((item: any) => (
                                <tr key={item.pk} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                {item.name}
                                                {item.is_popular && (
                                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Sparkles className="w-2.5 h-2.5" /> POPULAR
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{item.description || 'No description added.'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs">
                                            <Tag className="w-3 h-3 text-slate-400" />
                                            {item.category?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">Rp{parseFloat(item.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'available'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {item.status === 'available' ? 'In Stock' : 'Sold Out'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.is_popular
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {item.is_popular ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.pk, item.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
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

            {/* Create Item Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); }} title="Add New Menu Item">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                                style={{ outlineColor: theme.primary }}
                                required
                            >
                                <option value="">Select Category</option>
                                {categoriesData?.results?.map((cat: any) => (
                                    <option key={cat.pk} value={cat.pk}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (IDR)</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="8.99"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                                    style={{ outlineColor: theme.primary }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-2 py-1 border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="available">Available</option>
                                <option value="soldout">Sold Out</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Add Item</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Item Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title={`Edit Item: ${editingItem?.name}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                                style={{ outlineColor: theme.primary }}
                                required
                            >
                                <option value="">Select Category</option>
                                {categoriesData?.results?.map((cat: any) => (
                                    <option key={cat.pk} value={cat.pk}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (IDR)</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                                    style={{ outlineColor: theme.primary }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-2 py-1 border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="available">Available</option>
                                <option value="soldout">Sold Out</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Save Changes</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};