import React, { useState, useEffect } from 'react';
import {
    UtensilsCrossed,
    Plus,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    X,
    Coins,
    LayoutGrid,
    List,
    LayoutDashboard,
    CheckCircle,
    AlertCircle,
    ChefHat,
    Coffee,
    Pizza,
    Salad,
    Beer,
    Wine,
    Cake,
    IceCream,
    Flame,
    Star
} from 'lucide-react';
import {
    useMenuItems,
    useMenuCategories,
    useCreateMenuItem,
    useUpdateMenuItem,
    useDeleteMenuItem
} from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';
import { THEME } from '../constants';

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

export const MenuItemManagement: React.FC = () => {
    const { hasPermission } = usePermission();

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('grid');

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
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'soldout'>('all');

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
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    }) || [];

    // Stats
    const totalItems = itemsData?.count || 0;
    const availableItems = itemsData?.results?.filter((i: any) => i.status === 'available').length || 0;
    const soldOutItems = itemsData?.results?.filter((i: any) => i.status === 'soldout').length || 0;
    const popularItems = itemsData?.results?.filter((i: any) => i.is_popular).length || 0;

    // Group items by category for kanban view
    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName?.toLowerCase() || '';
        if (name.includes('appetizer') || name.includes('starter')) return <Pizza className="w-4 h-4" />;
        if (name.includes('main') || name.includes('entree')) return <ChefHat className="w-4 h-4" />;
        if (name.includes('salad')) return <Salad className="w-4 h-4" />;
        if (name.includes('drink') || name.includes('beverage')) return <Coffee className="w-4 h-4" />;
        if (name.includes('beer')) return <Beer className="w-4 h-4" />;
        if (name.includes('wine')) return <Wine className="w-4 h-4" />;
        if (name.includes('dessert')) return <Cake className="w-4 h-4" />;
        if (name.includes('ice') || name.includes('gelato')) return <IceCream className="w-4 h-4" />;
        return <UtensilsCrossed className="w-4 h-4" />;
    };

    // Get color based on category
    const getCategoryColor = (categoryName: string) => {
        const name = categoryName?.toLowerCase() || '';
        if (name.includes('appetizer') || name.includes('starter')) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (name.includes('main') || name.includes('entree')) return 'bg-red-100 text-red-700 border-red-200';
        if (name.includes('salad')) return 'bg-green-100 text-green-700 border-green-200';
        if (name.includes('drink') || name.includes('beverage')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (name.includes('beer')) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (name.includes('wine')) return 'bg-purple-100 text-purple-700 border-purple-200';
        if (name.includes('dessert')) return 'bg-pink-100 text-pink-700 border-pink-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UtensilsCrossed className="w-6 h-6" style={{ color: THEME.primary }} />
                        Menu Inventory
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Configure dishes, beverages, pricing, and availability</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetchItems()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => {
                                resetForm();
                                setIsCreateModalOpen(true);
                            }}
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
                            Add Menu Item
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Items</span>
                        <UtensilsCrossed className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Available</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{availableItems}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Sold Out</span>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{soldOutItems}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Popular</span>
                        <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{popularItems}</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ outlineColor: THEME.primary }}
                    >
                        <option value="all">All Categories</option>
                        {categoriesData?.results?.map((cat: any) => (
                            <option key={cat.pk} value={String(cat.pk)}>{cat.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ outlineColor: THEME.primary }}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="soldout">Sold Out</option>
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
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Kanban View"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Items Display */}
            {loadingItems ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading menu items...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No items found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Add your first menu item to get started'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item: any) => (
                        <div
                            key={item.pk}
                            className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-md transition-all duration-200 p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                                        {item.is_popular && (
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${getCategoryColor(item.category?.name)}`}>
                                            {getCategoryIcon(item.category?.name)}
                                            {item.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${item.status === 'available'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {item.status === 'available' ? 'In Stock' : 'Sold Out'}
                                </span>
                            </div>

                            {item.description && (
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-lg font-bold text-emerald-600">
                                    Rp{parseFloat(item.price).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.pk, item.name)}
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
            ) : viewMode === 'table' ? (
                // TABLE VIEW
                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Info</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Popular</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredItems.map((item: any) => (
                                <tr key={item.pk} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{item.name}</div>
                                        {item.description && (
                                            <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${getCategoryColor(item.category?.name)}`}>
                                            {getCategoryIcon(item.category?.name)}
                                            {item.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-emerald-600">
                                        Rp{parseFloat(item.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${item.status === 'available'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {item.status === 'available' ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            {item.status === 'available' ? 'Available' : 'Sold Out'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.is_popular ? (
                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border bg-amber-50 text-amber-700 border-amber-200">
                                                <Star className="w-3 h-3 fill-amber-500" />
                                                Popular
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => handleEditClick(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.pk, item.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // KANBAN VIEW - Group by Category
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoriesData?.results?.map((category: any) => {
                        const itemsInCategory = filteredItems.filter((item: any) => item.category?.pk === category.pk);
                        if (itemsInCategory.length === 0) return null;

                        return (
                            <div key={category.pk} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                        {getCategoryIcon(category.name)}
                                        {category.name}
                                    </h4>
                                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                        {itemsInCategory.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {itemsInCategory.map((item: any) => (
                                        <div
                                            key={item.pk}
                                            className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-medium text-sm text-slate-900 truncate">{item.name}</span>
                                                        {item.is_popular && (
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            Rp{parseFloat(item.price).toLocaleString()}
                                                        </span>
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${item.status === 'available'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                            {item.status === 'available' ? '✓' : '✗'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 ml-2">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.pk, item.name)}
                                                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {filteredItems.length} of {totalItems} items
                </span>
                <span>
                    {viewMode === 'grid' && 'Grid View'}
                    {viewMode === 'table' && 'Table View'}
                    {viewMode === 'kanban' && 'Kanban View'}
                </span>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); }} title="Add New Menu Item">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            placeholder="e.g., Grilled Salmon"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                                style={{ outlineColor: THEME.primary }}
                                required
                            >
                                <option value="">Select Category</option>
                                {categoriesData?.results?.map((cat: any) => (
                                    <option key={cat.pk} value={cat.pk}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (IDR) *</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g., 85000"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    style={{ outlineColor: THEME.primary }}
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
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            placeholder="Brief description of the item"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                                style={{ outlineColor: THEME.primary }}
                            >
                                <option value="available">Available</option>
                                <option value="soldout">Sold Out</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPopular}
                                    onChange={(e) => setIsPopular(e.target.checked)}
                                    className="w-4 h-4 rounded focus:ring-2"
                                    style={{ accentColor: THEME.primary }}
                                />
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Mark as Popular
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createItemMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                            style={{ background: THEME.primaryGradient }}
                        >
                            {createItemMutation.isPending ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} title={`Edit Item: ${editingItem?.name}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                                style={{ outlineColor: THEME.primary }}
                                required
                            >
                                <option value="">Select Category</option>
                                {categoriesData?.results?.map((cat: any) => (
                                    <option key={cat.pk} value={cat.pk}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (IDR) *</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    style={{ outlineColor: THEME.primary }}
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
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: THEME.primary }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                                style={{ outlineColor: THEME.primary }}
                            >
                                <option value="available">Available</option>
                                <option value="soldout">Sold Out</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPopular}
                                    onChange={(e) => setIsPopular(e.target.checked)}
                                    className="w-4 h-4 rounded focus:ring-2"
                                    style={{ accentColor: THEME.primary }}
                                />
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Popular
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateItemMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                            style={{ background: THEME.primaryGradient }}
                        >
                            {updateItemMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};