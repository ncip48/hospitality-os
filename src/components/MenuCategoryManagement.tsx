import React, { useState, useEffect } from 'react';
import {
    FolderKanban,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    X,
    FolderPlus,
    LayoutGrid,
    List,
    FolderOpen,
    Package,
    ChevronRight,
    Pizza,
    Salad,
    Coffee,
    Beer,
    Wine,
    Cake,
    IceCream,
    ChefHat,
    UtensilsCrossed,
    ArrowUp,
    ArrowDown,
    Star,
    Clock,
    TrendingUp
} from 'lucide-react';
import {
    useMenuCategories,
    useCreateMenuCategory,
    useUpdateMenuCategory,
    useDeleteMenuCategory
} from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';

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

// Category Icon Mapping
const getCategoryIcon = (name: string, size: number = 5) => {
    const iconName = name?.toLowerCase() || '';
    const iconProps = { className: `w-${size} h-${size}` };

    if (iconName.includes('pizza')) return <Pizza {...iconProps} />;
    if (iconName.includes('salad') || iconName.includes('green')) return <Salad {...iconProps} />;
    if (iconName.includes('coffee') || iconName.includes('tea') || iconName.includes('drink')) return <Coffee {...iconProps} />;
    if (iconName.includes('beer')) return <Beer {...iconProps} />;
    if (iconName.includes('wine')) return <Wine {...iconProps} />;
    if (iconName.includes('cake') || iconName.includes('dessert') || iconName.includes('sweet')) return <Cake {...iconProps} />;
    if (iconName.includes('ice') || iconName.includes('gelato')) return <IceCream {...iconProps} />;
    if (iconName.includes('main') || iconName.includes('entree') || iconName.includes('grill')) return <ChefHat {...iconProps} />;
    if (iconName.includes('appetizer') || iconName.includes('starter')) return <UtensilsCrossed {...iconProps} />;
    return <FolderOpen {...iconProps} />;
};

// Category Color Mapping
const getCategoryColor = (name: string) => {
    const iconName = name?.toLowerCase() || '';
    if (iconName.includes('pizza')) return 'from-orange-500 to-red-500';
    if (iconName.includes('salad') || iconName.includes('green')) return 'from-green-500 to-emerald-500';
    if (iconName.includes('coffee') || iconName.includes('tea')) return 'from-amber-500 to-yellow-600';
    if (iconName.includes('drink') || iconName.includes('beverage')) return 'from-blue-500 to-cyan-500';
    if (iconName.includes('beer')) return 'from-amber-600 to-orange-600';
    if (iconName.includes('wine')) return 'from-purple-500 to-pink-500';
    if (iconName.includes('cake') || iconName.includes('dessert')) return 'from-pink-400 to-rose-500';
    if (iconName.includes('ice') || iconName.includes('gelato')) return 'from-cyan-400 to-blue-400';
    if (iconName.includes('main') || iconName.includes('entree')) return 'from-red-500 to-rose-600';
    if (iconName.includes('appetizer') || iconName.includes('starter')) return 'from-amber-400 to-orange-500';
    return 'from-slate-400 to-slate-600';
};

// Category Background Color
const getCategoryBg = (name: string) => {
    const iconName = name?.toLowerCase() || '';
    if (iconName.includes('pizza')) return 'bg-orange-50 border-orange-200';
    if (iconName.includes('salad') || iconName.includes('green')) return 'bg-emerald-50 border-emerald-200';
    if (iconName.includes('coffee') || iconName.includes('tea')) return 'bg-amber-50 border-amber-200';
    if (iconName.includes('drink') || iconName.includes('beverage')) return 'bg-blue-50 border-blue-200';
    if (iconName.includes('beer')) return 'bg-amber-50 border-amber-200';
    if (iconName.includes('wine')) return 'bg-purple-50 border-purple-200';
    if (iconName.includes('cake') || iconName.includes('dessert')) return 'bg-pink-50 border-pink-200';
    if (iconName.includes('ice') || iconName.includes('gelato')) return 'bg-cyan-50 border-cyan-200';
    if (iconName.includes('main') || iconName.includes('entree')) return 'bg-red-50 border-red-200';
    if (iconName.includes('appetizer') || iconName.includes('starter')) return 'bg-amber-50 border-amber-200';
    return 'bg-slate-50 border-slate-200';
};

export const MenuCategoryManagement: React.FC = () => {
    const { hasPermission } = usePermission();
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Hooks
    const { data: categoriesData, isLoading, refetch } = useMenuCategories();
    const createCategoryMutation = useCreateMenuCategory();
    const updateCategoryMutation = useUpdateMenuCategory();
    const deleteCategoryMutation = useDeleteMenuCategory();

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCategoryMutation.mutate(
            { name, sort_order: sortOrder },
            {
                onSuccess: () => {
                    setName('');
                    setSortOrder(0);
                    setIsCreateModalOpen(false);
                    refetch();
                }
            }
        );
    };

    const handleEditClick = (category: any) => {
        setEditingCategory(category);
        setName(category.name);
        setSortOrder(category.sort_order || 0);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        updateCategoryMutation.mutate(
            { pk: editingCategory.pk, data: { name, sort_order: sortOrder } },
            {
                onSuccess: () => {
                    setEditingCategory(null);
                    setName('');
                    setSortOrder(0);
                    setIsEditModalOpen(false);
                    refetch();
                }
            }
        );
    };

    const handleDelete = (categoryPk: number | string, categoryName: string) => {
        if (confirm(`Are you sure you want to delete "${categoryName}"? Existing items assigned to this category may lose their association.`)) {
            deleteCategoryMutation.mutate(categoryPk, { onSuccess: () => refetch() });
        }
    };

    const filteredCategories = categoriesData?.results?.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Sort by sort_order
    const sortedCategories = [...filteredCategories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Stats
    const totalCategories = categoriesData?.results?.length || 0;
    const totalItems = categoriesData?.results?.reduce((sum: number, c: any) => sum + (c.item_count || 0), 0) || 0;
    const avgItemsPerCategory = totalCategories > 0 ? (totalItems / totalCategories).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FolderKanban className="w-6 h-6" style={{ color: theme.primary }} />
                        Menu Categories
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Organize your menu items into categories and subcategories</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title="Refresh">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
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
                            <FolderPlus className="w-4 h-4" />
                            New Category
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Categories</span>
                        <FolderKanban className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalCategories}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Menu Items</span>
                        <Package className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Avg Items per Category</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{avgItemsPerCategory}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Top Sort Order</span>
                        <ArrowUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {categoriesData?.results?.length ? Math.max(...categoriesData.results.map((c: any) => c.sort_order || 0)) : 0}
                    </p>
                </div>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ outlineColor: theme.primary }}
                    />
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
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Categories Display */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading categories...</p>
                </div>
            ) : sortedCategories.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No categories found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm ? 'Try adjusting your search' : 'Create your first category to organize your menu'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-lg text-white font-medium transition-all"
                            style={{ background: theme.primaryGradient }}
                        >
                            <FolderPlus className="w-4 h-4 inline mr-2" />
                            Create Category
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW - Category Cards
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedCategories.map((category: any) => {
                        const gradient = getCategoryColor(category.name);
                        const bgClass = getCategoryBg(category.name);

                        return (
                            <div
                                key={category.pk}
                                className="group bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-lg transition-all duration-200 overflow-hidden"
                            >
                                {/* Gradient Header */}
                                <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 rounded-xl ${bgClass} border`}>
                                            {getCategoryIcon(category.name, 6)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(category)}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.pk, category.name)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-lg text-slate-900 mb-1">{category.name}</h4>

                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Package className="w-3.5 h-3.5" />
                                            <span>{category.item_count || 0} items</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ArrowUp className="w-3.5 h-3.5" />
                                            <span>Rank #{category.sort_order || 0}</span>
                                        </div>
                                    </div>

                                    {category.item_count && category.item_count > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span>Active menu items in this category</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // LIST VIEW - Clean List
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-200">
                        {sortedCategories.map((category: any) => (
                            <div
                                key={category.pk}
                                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`p-2.5 rounded-xl ${getCategoryBg(category.name)} border flex-shrink-0`}>
                                        {getCategoryIcon(category.name, 5)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-900 truncate">{category.name}</h4>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                                                #{category.sort_order || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span>{category.item_count || 0} items</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => handleEditClick(category)}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.pk, category.name)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {sortedCategories.length} of {totalCategories} categories
                </span>
                <span>
                    {viewMode === 'grid' ? 'Grid View' : 'List View'}
                </span>
            </div>

            {/* Create Category Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Menu Category">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Cold Brew Coffees"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">This will be used to group related menu items</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Priority (Rank Order)</label>
                        <input
                            type="number"
                            min="0"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: theme.primary }}
                            placeholder="0"
                        />
                        <p className="text-xs text-slate-400 mt-1">Lower numbers appear first in the menu</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createCategoryMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                            style={{ background: theme.primaryGradient }}
                        >
                            {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingCategory(null); }} title={`Edit Category: ${editingCategory?.name}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Priority (Rank Order)</label>
                        <input
                            type="number"
                            min="0"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    {editingCategory?.item_count > 0 && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-start gap-2">
                            <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>This category has {editingCategory.item_count} items. Changing the name may affect menu organization.</span>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateCategoryMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                            style={{ background: theme.primaryGradient }}
                        >
                            {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};