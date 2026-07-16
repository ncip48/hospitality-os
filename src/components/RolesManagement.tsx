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
    Activity,
    LayoutGrid,
    LayoutDashboard,
    Award,
    Key,
    ChevronRight
} from 'lucide-react';
import { useRolesList, useCreateRole, useDeleteRole, useRoleAudit, useUpdateRole } from '../hooks/useApi';
import { Permission } from '../auth/permissions';
import { usePermission } from '../hooks/usePermission';
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
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300" onClick={(e) => e.stopPropagation()}>
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
        if (typeof value === "boolean") return value ? "Yes" : "No";
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
                            <span className="text-xs font-semibold text-slate-500 uppercase">Details</span>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(entry.detail).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-[140px_1fr] gap-3 text-xs">
                                    <span className="font-medium text-slate-500">{formatKey(key)}</span>
                                    <span className="text-slate-700 break-all">{renderValue(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Role Card Component
const RoleCard: React.FC<{
    role: any;
    onEdit: () => void;
    onDelete: () => void;
    onAudit: () => void;
}> = ({ role, onEdit, onDelete, onAudit }) => {

    const getScopeIcon = (isKioskOnly: boolean) => {
        return isKioskOnly ? <Monitor className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
    };

    const getScopeLabel = (isKioskOnly: boolean) => {
        return isKioskOnly ? 'Kiosk Only' : 'Web + Kiosk';
    };

    const getPermissionCount = (permissions: any) => {
        if (!permissions) return 0;
        if (Array.isArray(permissions)) return permissions.length;
        if (typeof permissions === 'object') return Object.keys(permissions).length;
        return 0;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-lg transition-all duration-200 group overflow-hidden">
            {/* Color Bar */}
            <div className="h-1" style={{ backgroundColor: role.color || THEME.primary }} />

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${role.color || THEME.primary}22` }}
                        >
                            <Shield className="w-5 h-5" style={{ color: role.color || THEME.primary }} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                {role.name}
                                {role.is_system && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        System
                                    </span>
                                )}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                    {getScopeIcon(role.is_kiosk_only)}
                                    {getScopeLabel(role.is_kiosk_only)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onAudit}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Audit History"
                        >
                            <History className="w-4 h-4" />
                        </button>
                        {!role.is_locked && (
                            <>
                                <button
                                    onClick={onEdit}
                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Edit Role"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Role"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        {role.is_locked && (
                            <span className="text-xs text-slate-400 italic px-2">Protected</span>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-700">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {role.staff_count || 0}
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Staff</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-700">
                            <Key className="w-3.5 h-3.5 text-slate-400" />
                            {getPermissionCount(role.permissions)}
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Permissions</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-700">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            {role.is_system ? 'Core' : 'Custom'}
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Type</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                        onClick={onAudit}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-600"
                    >
                        <History className="w-3.5 h-3.5" />
                        View Audit History
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Permission Badge Component
const PermissionBadge: React.FC<{ permission: string }> = ({ permission }) => {
    const formatted = permission
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {formatted}
        </span>
    );
};

export const RolesManagement: React.FC = () => {

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

    // State
    const [editingRole, setEditingRole] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState('');
    const [color, setColor] = useState('#2596be');
    const [isKioskOnly, setIsKioskOnly] = useState(false);
    const [activeAuditSubId, setActiveAuditSubId] = useState<string | null>(null);
    const [selectedRoleForAudit, setSelectedRoleForAudit] = useState<any>(null);

    // Hooks
    const { data: rolesData, isLoading } = useRolesList();
    const createMutation = useCreateRole();
    const updateMutation = useUpdateRole();
    const deleteMutation = useDeleteRole();
    const { data: auditData, isFetching: loadingAudit } = useRoleAudit(
        activeAuditSubId || '',
        !!activeAuditSubId
    );

    const { hasPermission } = usePermission();

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
                    name,
                    color,
                    permissions: permissions
                        .split(',')
                        .map(p => p.trim())
                        .filter(Boolean),
                    is_kiosk_only: isKioskOnly
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
        setPermissions(role.permissions?.join(', ') || '');
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

    const handleAuditClick = (role: any) => {
        setSelectedRoleForAudit(role);
        setActiveAuditSubId(String(role.pk));
    };

    const isAuditArray = Array.isArray(auditData);

    // Stats
    const totalRoles = rolesData?.results?.length || 0;
    const totalStaff = rolesData?.results?.reduce((acc: number, r: any) => acc + r.staff_count, 0) || 0;
    const systemRoles = rolesData?.results?.filter((r: any) => r.is_system).length || 0;
    const kioskOnlyRoles = rolesData?.results?.filter((r: any) => r.is_kiosk_only).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-6 h-6" style={{ color: THEME.primary }} />
                        System Access Roles
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage user roles and permissions across the platform
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white shadow-sm text-[#2596be]' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Compact View"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                        </button>
                    </div>

                    {hasPermission(Permission.ROLES_ADMIN_CREATE) && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                                boxShadow: `0 4px 12px ${THEME.primary}44`
                            }}
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
                            Create Role
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Roles</span>
                        <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalRoles}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Staff Assigned</span>
                        <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">System Roles</span>
                        <Lock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{systemRoles}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Kiosk Only</span>
                        <Monitor className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{kioskOnlyRoles}</p>
                </div>
            </div>

            {/* Roles Display */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading roles...</p>
                </div>
            ) : rolesData?.results?.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No roles found</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first role to get started</p>
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rolesData?.results.map((role: any) => (
                        <RoleCard
                            key={role.pk}
                            role={role}
                            onEdit={() => handleEditClick(role)}
                            onDelete={() => handleDelete(String(role.pk), role.name)}
                            onAudit={() => handleAuditClick(role)}
                        />
                    ))}
                </div>
            ) : (
                // COMPACT VIEW
                <div className="space-y-3">
                    {rolesData?.results.map((role: any) => (
                        <div
                            key={role.pk}
                            className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-md transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div
                                        className="w-3 h-10 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: role.color || THEME.primary }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900">{role.name}</h4>
                                            {role.is_system && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />
                                                    System
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-1">
                                                {role.is_kiosk_only ? <Monitor className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                {role.is_kiosk_only ? 'Kiosk Only' : 'Web + Kiosk'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {role.staff_count || 0} staff
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Key className="w-3 h-3" />
                                                {role.permissions?.length || 0} permissions
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                                    <button
                                        onClick={() => handleAuditClick(role)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                        title="Audit History"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    {!role.is_locked && hasPermission(Permission.ROLES_ADMIN_UPDATE) && (
                                        <button
                                            onClick={() => handleEditClick(role)}
                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Edit Role"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {!role.is_locked && hasPermission(Permission.ROLES_ADMIN_DELETE) && (
                                        <button
                                            onClick={() => handleDelete(String(role.pk), role.name)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Delete Role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {role.is_locked && (
                                        <span className="text-xs text-slate-400 italic px-2">Protected</span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {rolesData?.results?.length || 0} roles
                </span>
                <span>
                    {viewMode === 'grid' ? 'Grid View' : 'Compact View'}
                </span>
            </div>

            {/* Audit Side Panel */}
            {activeAuditSubId && (
                <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl border-l border-slate-200 z-40 animate-in slide-in-from-right duration-400 overflow-y-auto">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-5 h-5" style={{ color: THEME.primary }} />
                            Audit Log
                            {selectedRoleForAudit && (
                                <span className="text-sm font-normal text-slate-500">
                                    - {selectedRoleForAudit.name}
                                </span>
                            )}
                        </h3>
                        <button
                            onClick={() => {
                                setActiveAuditSubId(null);
                                setSelectedRoleForAudit(null);
                            }}
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
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Role">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Manager, Supervisor"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                            />
                            <code className="text-sm bg-slate-100 px-3 py-1 rounded-lg font-mono">{color}</code>
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
                                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                                boxShadow: `0 2px 8px ${THEME.primary}44`
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
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Role: ${editingRole?.name || ''}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Manager, Supervisor"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                            />
                            <code className="text-sm bg-slate-100 px-3 py-1 rounded-lg font-mono">{color}</code>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Permissions (comma separated)</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={permissions}
                                onChange={(e) => setPermissions(e.target.value)}
                                placeholder="e.g., view_dashboard, edit_menu, manage_users"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Separate permissions with commas</p>
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
                                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                                boxShadow: `0 2px 8px ${THEME.primary}44`
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