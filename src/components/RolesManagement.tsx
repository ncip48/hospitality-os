import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    History,
    X,
    Edit2,
    AlertCircle,
    Users,
    Monitor,
    Globe,
    Shield,
    Hash,
    Clock,
    Lock,
    Calendar,
    FileText,
    Activity
} from 'lucide-react';
import { useRolesList, useCreateRole, useDeleteRole, useRoleAudit, useUpdateRole } from '../hooks/useApi';

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
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
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
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
        .duration-200 { animation-duration: 200ms; }
        .duration-300 { animation-duration: 300ms; }
        .duration-400 { animation-duration: 400ms; }
      `}</style>
        </>
    );
};

// Audit Log Entry Component
const AuditLogEntry: React.FC<{ entry: any }> = ({ entry }) => {
    const getActionIcon = (action: string) => {
        switch (action) {
            case 'role_created': return <Plus className="w-4 h-4 text-emerald-500" />;
            case 'role_updated': return <Edit2 className="w-4 h-4 text-blue-500" />;
            case 'role_deleted': return <Trash2 className="w-4 h-4 text-red-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'role_created': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'role_updated': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'role_deleted': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatKey = (key: string) =>
        key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const renderValue = (value: any) => {
        if (value === null || value === undefined) return "-";

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (typeof value === "object") {
            return (
                <pre className="whitespace-pre-wrap break-all text-xs">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }

        return String(value);
    };

    return (
        <div className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors bg-white">
            <div className="flex-shrink-0 mt-0.5">
                {getActionIcon(entry.action)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                            {entry.actor_name || 'Unknown User'}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getActionColor(entry.action)}`}>
                            {entry.action?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                    </span>
                </div>
                {entry.detail && Object.keys(entry.detail).length > 0 && (
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">
                                Details
                            </span>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(entry.detail).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="grid grid-cols-[140px_1fr] gap-3 text-xs"
                                >
                                    <span className="font-medium text-slate-500">
                                        {formatKey(key)}
                                    </span>

                                    <span className="text-slate-700 break-all">
                                        {renderValue(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const RolesManagement: React.FC = () => {
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e'
    };

    // State
    const [editingRole, setEditingRole] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState('');
    const [color, setColor] = useState('#2596be');
    const [isKioskOnly, setIsKioskOnly] = useState(false);
    const [activeAuditSubId, setActiveAuditSubId] = useState<string | null>(null);

    // Hooks
    const { data: rolesData, isLoading } = useRolesList();
    const createMutation = useCreateRole();
    const updateMutation = useUpdateRole();
    const deleteMutation = useDeleteRole();
    const { data: auditData, isFetching: loadingAudit } = useRoleAudit(
        activeAuditSubId || '',
        !!activeAuditSubId
    );

    // Handlers
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(
            { name, color, is_kiosk_only: isKioskOnly },
            {
                onSuccess: () => {
                    setName('');
                    setPermissions('');
                    setColor('#2596be');
                    setIsKioskOnly(false);
                    setIsCreateModalOpen(false);
                }
            }
        );
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;
        updateMutation.mutate(
            {
                subid: String(editingRole.pk),
                data: {
                    name, color, permissions: permissions
                        .split(',')
                        .map(p => p.trim())
                        .filter(Boolean), is_kiosk_only: isKioskOnly
                }
            },
            {
                onSuccess: () => {
                    setEditingRole(null);
                    setName('');
                    setPermissions('');
                    setColor('#2596be');
                    setIsKioskOnly(false);
                    setIsEditModalOpen(false);
                }
            }
        );
    };

    const handleEditClick = (role: any) => {
        setEditingRole(role);
        setPermissions(role.permissions);
        setName(role.name);
        setColor(role.color);
        setIsKioskOnly(role.is_kiosk_only);
        setIsEditModalOpen(true);
    };

    const handleDelete = (roleId: string, roleName: string) => {
        if (confirm(`Are you sure you want to delete role "${roleName}"?`)) {
            deleteMutation.mutate(roleId);
        }
    };

    // Check if audit data is an array (list of audit entries)
    const isAuditArray = Array.isArray(auditData);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-6 h-6" style={{ color: theme.primary }} />
                        System Access Roles
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage user roles and permissions across the platform
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                        boxShadow: `0 4px 12px ${theme.primary}44`
                    }}
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
                    Create Role
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Roles</span>
                        <Shield className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {rolesData?.results?.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Staff Assigned</span>
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {rolesData?.results?.reduce((acc: number, r: any) => acc + r.staff_count, 0) || 0}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Kiosk Only</span>
                        <Monitor className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {rolesData?.results?.filter((r: any) => r.is_kiosk_only).length || 0}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                        <p className="mt-2 text-slate-500">Loading roles...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Role Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Scope Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Staff Count
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rolesData?.results.map((role: any) => (
                                    <tr key={role.pk} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: role.color }}
                                                />
                                                <span className="font-medium text-slate-900">{role.name}</span>
                                                {role.is_system && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                                        <Lock className="w-3 h-3" />
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                {role.is_kiosk_only ? (
                                                    <>
                                                        <Monitor className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-600">Kiosk Dedicated</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Globe className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-600">Web + Kiosk</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                                <Users className="w-3 h-3" />
                                                {role.staff_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setActiveAuditSubId(String(role.pk))}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                                                    title="View Audit History"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                                {!role.is_locked && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(role)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-600"
                                                            title="Edit Role"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(String(role.pk), role.name)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-500 hover:text-red-600"
                                                            title="Delete Role"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {role.is_locked && (
                                                    <span className="text-xs text-slate-400 italic">Protected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Audit Side Panel */}
            {activeAuditSubId && (
                <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl border-l border-slate-200 z-40 animate-in slide-in-from-right duration-400 overflow-y-auto">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-5 h-5" style={{ color: theme.primary }} />
                            Audit Log
                        </h3>
                        <button
                            onClick={() => setActiveAuditSubId(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {loadingAudit ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                                <p className="mt-3 text-slate-500">Loading audit entries...</p>
                            </div>
                        ) : isAuditArray && auditData.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-slate-500">
                                        {auditData.length} {auditData.length === 1 ? 'entry' : 'entries'} found
                                    </span>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Latest first
                                    </span>
                                </div>
                                {auditData.map((entry: any, index: number) => (
                                    <AuditLogEntry key={entry.pk || index} entry={entry} />
                                ))}
                            </div>
                        ) : auditData && !isAuditArray ? (
                            // Handle case where audit data might be an object (single entry)
                            <div className="space-y-3">
                                <AuditLogEntry entry={auditData} />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No audit entries found</p>
                                <p className="text-sm text-slate-400 mt-1">This role has no activity history</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Role"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Role Name
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Manager, Supervisor"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Role Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                            />
                            <code className="text-sm bg-slate-100 px-3 py-1 rounded-lg font-mono">
                                {color}
                            </code>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="kiosk-only-create"
                            checked={isKioskOnly}
                            onChange={(e) => setIsKioskOnly(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#2596be]"
                        />
                        <label htmlFor="kiosk-only-create" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-slate-400" />
                            Kiosk Only Access
                        </label>
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
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                                boxShadow: `0 2px 8px ${theme.primary}44`
                            }}
                        >
                            {createMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Creating...
                                </span>
                            ) : (
                                'Create Role'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Role: ${editingRole?.name || ''}`}
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Role Name
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Manager, Supervisor"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Role Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                            />
                            <code className="text-sm bg-slate-100 px-3 py-1 rounded-lg font-mono">
                                {color}
                            </code>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Permissions
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={permissions}
                                onChange={(e) => setPermissions(e.target.value)}
                                placeholder="e.g., Manager, Supervisor"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="kiosk-only-edit"
                            checked={isKioskOnly}
                            onChange={(e) => setIsKioskOnly(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 accent-[#2596be]"
                        />
                        <label htmlFor="kiosk-only-edit" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-slate-400" />
                            Kiosk Only Access
                        </label>
                    </div>

                    {editingRole?.is_system && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>This is a system role. Some properties may be restricted.</span>
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
                            disabled={updateMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                                boxShadow: `0 2px 8px ${theme.primary}44`
                            }}
                        >
                            {updateMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Updating...
                                </span>
                            ) : (
                                'Update Role'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};