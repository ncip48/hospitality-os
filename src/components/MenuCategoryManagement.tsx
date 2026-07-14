import React, { useState, useEffect } from 'react';
import {
    FolderKanban,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    X,
    FolderPlus
} from 'lucide-react';
import {
    useMenuCategories,
    useCreateMenuCategory,
    useUpdateMenuCategory,
    useDeleteMenuCategory
} from '../hooks/useApi'; // Swap with your actual API hooks file
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';

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

export const MenuCategoryManagement: React.FC = () => {
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
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Hooks (Mirroring your staff hook setup)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FolderKanban className="w-6 h-6" style={{ color: theme.primary }} />
                        Menu Categories
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage system categories and structures for your food and drink offerings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="Refresh">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {hasPermission(Permission.MENU_VIEW) && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{ background: theme.primaryGradient, boxShadow: `0 4px 12px ${theme.primary}44` }}
                        >
                            <FolderPlus className="w-4 h-4" />
                            New Category
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Total Categories</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{categoriesData?.results?.length || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Highest Sort Rank</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {categoriesData?.results?.length ? Math.max(...categoriesData.results.map((c: any) => c.sort_order || 0)) : 0}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">Linked Active Items</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {categoriesData?.results?.reduce((sum: number, c: any) => sum + (c.item_count || 0), 0) || 0} items
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ outlineColor: theme.primary }}
                />
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                        <p className="mt-2 text-slate-500">Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="p-12 text-center">
                        <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No Categories Found</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
                            style={{ background: theme.primaryGradient }}
                        >
                            Create One Now
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Display Order</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item Count</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredCategories.map((category: any) => (
                                <tr key={category.pk} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{category.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">Rank: #{category.sort_order ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                                            {category.item_count ?? 0} Associated Items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(category)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(category.pk, category.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
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

            {/* Create Category Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Menu Category">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Title</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Cold Brew Coffees"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Priority (Rank Order)</label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Create</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingCategory(null); }} title={`Edit Category: ${editingCategory?.name}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Title</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Priority (Rank Order)</label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2"
                            style={{ outlineColor: theme.primary }}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white font-medium" style={{ background: theme.primaryGradient }}>Update</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};