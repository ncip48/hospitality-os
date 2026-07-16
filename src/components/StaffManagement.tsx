import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    Edit2,
    Search,
    RefreshCw,
    Briefcase,
    Clock,
    User,
    X,
    Hash,
    AlertCircle,
    Shield,
    Key,
    LayoutGrid,
    LayoutDashboard,
    ChevronRight,
    Fingerprint
} from 'lucide-react';
import { useStaffList, useRolesList, useCreateStaff, useDeleteStaff, usePatchStaffRole, useUpdateStaff } from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../auth/permissions';
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

// Helper
const isActiveStaffMutation = (variables: any, currentPk: number | string) => {
    return variables && Number(variables.subid) === Number(currentPk);
};

// Staff Card Component
const StaffCard: React.FC<{
    member: any;
    onEdit: () => void;
    onDelete: () => void;
    onRoleChange: (roleId: string) => void;
    rolesData: any;
    patchRoleMutation: any;
    theme: any;
    hasPermission: (permission: string) => boolean;
}> = ({ member, onEdit, onDelete, onRoleChange, rolesData, patchRoleMutation, theme, hasPermission }) => {
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const getEmploymentIcon = (employment: string) => {
        return employment === 'full_time' ? <Briefcase className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />;
    };

    const getEmploymentColor = (employment: string) => {
        return employment === 'full_time'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-lg transition-all duration-200 group overflow-hidden">
            {/* Gradient bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.primaryDark})` }} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
                            style={{
                                backgroundColor: member.avatar_bg || THEME.primary,
                                color: member.avatar_color || '#fff'
                            }}
                        >
                            {member.initials}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{member.full_name}</div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User className="w-3 h-3" />
                                @{member.username}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEmploymentColor(member.employment)}`}>
                                    {getEmploymentIcon(member.employment)}
                                    {member.employment.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasPermission(Permission.STAFF_UPDATE) && (
                            <button
                                onClick={onEdit}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit Staff"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {hasPermission(Permission.STAFF_DELETE) && (
                            <button
                                onClick={onDelete}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete Staff"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{member.role?.name || 'No Role'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                        <span className={member.is_enrolled ? 'text-emerald-600' : 'text-red-500'}>
                            {member.is_enrolled ? 'Enrolled' : 'Not Enrolled'}
                        </span>
                    </div>
                </div>

                {/* Role Change */}
                {hasPermission(Permission.STAFF_UPDATE) && hasPermission(Permission.ROLES_ADMIN_VIEW) && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="relative">
                            <select
                                value={member.role?.pk || ''}
                                onChange={(e) => onRoleChange(e.target.value)}
                                disabled={patchRoleMutation.isPending}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all appearance-none pr-8"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: THEME.primary
                                }}
                            >
                                {rolesData?.results.map((r: any) => (
                                    <option key={r.pk} value={r.pk}>{r.name}</option>
                                ))}
                            </select>
                            {patchRoleMutation.isPending && isActiveStaffMutation(patchRoleMutation.variables, member.pk) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Compact Staff Item
const CompactStaffItem: React.FC<{
    member: any;
    onEdit: () => void;
    onDelete: () => void;
    onRoleChange: (roleId: string) => void;
    rolesData: any;
    patchRoleMutation: any;
    theme: any;
    hasPermission: (permission: string) => boolean;
}> = ({ member, onEdit, onDelete, onRoleChange, rolesData, patchRoleMutation, theme, hasPermission }) => {
    const getEmploymentColor = (employment: string) => {
        return employment === 'full_time'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-[#2596be]/30 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
                        style={{
                            backgroundColor: member.avatar_bg || THEME.primary,
                            color: member.avatar_color || '#fff'
                        }}
                    >
                        {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{member.full_name}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEmploymentColor(member.employment)}`}>
                                {member.employment === 'full_time' ? <Briefcase className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {member.employment.toUpperCase().replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                @{member.username}
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                {member.role?.name || 'No Role'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Fingerprint className="w-3 h-3" />
                                <span className={member.is_enrolled ? 'text-emerald-600' : 'text-red-500'}>
                                    {member.is_enrolled ? 'Enrolled' : 'Not Enrolled'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {hasPermission(Permission.STAFF_UPDATE) && hasPermission(Permission.ROLES_ADMIN_VIEW) && (
                        <select
                            value={member.role?.pk || ''}
                            onChange={(e) => onRoleChange(e.target.value)}
                            disabled={patchRoleMutation.isPending}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 transition-all appearance-none pr-6"
                            style={{
                                borderColor: '#e2e8f0',
                                outlineColor: THEME.primary
                            }}
                        >
                            {rolesData?.results.map((r: any) => (
                                <option key={r.pk} value={r.pk}>{r.name}</option>
                            ))}
                        </select>
                    )}
                    {patchRoleMutation.isPending && isActiveStaffMutation(patchRoleMutation.variables, member.pk) && (
                        <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                    )}
                    <div className="flex items-center gap-0.5">
                        {hasPermission(Permission.STAFF_UPDATE) && (
                            <button
                                onClick={onEdit}
                                className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit Staff"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {hasPermission(Permission.STAFF_DELETE) && (
                            <button
                                onClick={onDelete}
                                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete Staff"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};

export const StaffManagement: React.FC = () => {
    const { hasPermission } = usePermission();

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [employment, setEmployment] = useState<'full_time' | 'part_time'>('full_time');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEmployment, setFilterEmployment] = useState<'all' | 'full_time' | 'part_time'>('all');

    // Hooks
    const { data: staffData, isLoading: loadingStaff, refetch } = useStaffList();
    const { data: rolesData } = useRolesList();
    const createStaffMutation = useCreateStaff();
    const updateStaffMutation = useUpdateStaff();
    const deleteStaffMutation = useDeleteStaff();
    const patchRoleMutation = usePatchStaffRole();

    // Handlers
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleId) {
            alert("Please assign an initial baseline execution role.");
            return;
        }
        createStaffMutation.mutate(
            { username, full_name: fullName, password, role_id: roleId, employment },
            {
                onSuccess: () => {
                    setUsername('');
                    setFullName('');
                    setPassword('');
                    setRoleId('');
                    setEmployment('full_time');
                    setIsCreateModalOpen(false);
                }
            }
        );
    };

    const handleEditClick = (staff: any) => {
        setEditingStaff(staff);
        setUsername(staff.username);
        setFullName(staff.full_name);
        setPassword('');
        setRoleId(staff.role?.pk || '');
        setEmployment(staff.employment);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        const updateData: any = { username, full_name: fullName, role_id: roleId, employment };
        if (password) {
            updateData.password = password;
        }
        updateStaffMutation.mutate(
            { subid: String(editingStaff.pk), data: updateData },
            {
                onSuccess: () => {
                    setEditingStaff(null);
                    setUsername('');
                    setFullName('');
                    setPassword('');
                    setRoleId('');
                    setEmployment('full_time');
                    setIsEditModalOpen(false);
                    refetch();
                }
            }
        );
    };

    const handleRoleChangePatch = (staffSubId: string | number, targetRoleId: string) => {
        if (!targetRoleId) return;
        patchRoleMutation.mutate({ subid: String(staffSubId), roleId: targetRoleId });
    };

    const handleDelete = (staffId: string | number, staffName: string) => {
        if (confirm(`Are you sure you want to terminate "${staffName}"? This action cannot be undone.`)) {
            deleteStaffMutation.mutate(String(staffId));
        }
    };

    // Filter staff
    const filteredStaff = staffData?.results?.filter((member: any) => {
        const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEmployment = filterEmployment === 'all' || member.employment === filterEmployment;
        return matchesSearch && matchesEmployment;
    });

    // Stats
    const totalStaff = staffData?.results?.length || 0;
    const fullTimeStaff = staffData?.results?.filter((s: any) => s.employment === 'full_time').length || 0;
    const partTimeStaff = staffData?.results?.filter((s: any) => s.employment === 'part_time').length || 0;
    const enrolledStaff = staffData?.results?.filter((s: any) => s.is_enrolled).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6" style={{ color: THEME.primary }} />
                        Staff Directory
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your team members and their access permissions
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

                    <button
                        onClick={() => refetch()}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    {hasPermission(Permission.STAFF_CREATE) && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                            style={{
                                background: THEME.primaryGradient,
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
                            <UserPlus className="w-4 h-4" />
                            Register Staff
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Staff</span>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Full Time</span>
                        <Briefcase className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{fullTimeStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Part Time</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{partTimeStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Enrolled</span>
                        <Fingerprint className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{enrolledStaff}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                            style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                        />
                    </div>
                    <select
                        value={filterEmployment}
                        onChange={(e) => setFilterEmployment(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all appearance-none"
                        style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                    >
                        <option value="all">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{filteredStaff?.length || 0} members</span>
                </div>
            </div>

            {/* Staff Display */}
            {loadingStaff ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#2596be]" />
                    <p className="mt-3 text-slate-500">Loading staff directory...</p>
                </div>
            ) : filteredStaff?.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No staff members found</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {searchTerm || filterEmployment !== 'all' ? 'Try adjusting your filters' : 'Register your first team member'}
                    </p>
                    {!searchTerm && filterEmployment === 'all' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
                            style={{ background: THEME.primaryGradient, boxShadow: `0 2px 8px ${THEME.primary}44` }}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            Register Staff
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStaff?.map((member: any) => (
                        <StaffCard
                            key={member.pk}
                            member={member}
                            onEdit={() => handleEditClick(member)}
                            onDelete={() => handleDelete(member.pk, member.full_name)}
                            onRoleChange={(roleId) => handleRoleChangePatch(member.pk, roleId)}
                            rolesData={rolesData}
                            patchRoleMutation={patchRoleMutation}
                            theme={THEME}
                            hasPermission={hasPermission}
                        />
                    ))}
                </div>
            ) : (
                // COMPACT VIEW
                <div className="space-y-3">
                    {filteredStaff?.map((member: any) => (
                        <CompactStaffItem
                            key={member.pk}
                            member={member}
                            onEdit={() => handleEditClick(member)}
                            onDelete={() => handleDelete(member.pk, member.full_name)}
                            onRoleChange={(roleId) => handleRoleChangePatch(member.pk, roleId)}
                            rolesData={rolesData}
                            patchRoleMutation={patchRoleMutation}
                            theme={THEME}
                            hasPermission={hasPermission}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {filteredStaff?.length || 0} of {totalStaff} staff members
                </span>
                <span>
                    {viewMode === 'grid' ? 'Grid View' : 'Compact View'}
                </span>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register New Staff Member">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., johndoe"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Legal Name</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., John Doe"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            >
                                <option value="">Select a role</option>
                                {rolesData?.results.map((r: any) => (
                                    <option key={r.pk} value={r.pk}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Type</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={employment}
                                onChange={(e) => setEmployment(e.target.value as any)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                            >
                                <option value="full_time">Full-Time</option>
                                <option value="part_time">Part-Time</option>
                            </select>
                        </div>
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
                            disabled={createStaffMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: THEME.primaryGradient, boxShadow: `0 2px 8px ${THEME.primary}44` }}
                        >
                            {createStaffMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Registering...
                                </span>
                            ) : (
                                'Register Staff'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingStaff(null); }} title={`Edit Staff: ${editingStaff?.full_name || ''}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow bg-slate-50"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Username cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Legal Name</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password (leave blank to keep current)</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password or leave blank"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                                required
                            >
                                <option value="">Select a role</option>
                                {rolesData?.results.map((r: any) => (
                                    <option key={r.pk} value={r.pk}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Type</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={employment}
                                onChange={(e) => setEmployment(e.target.value as any)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{ borderColor: '#e2e8f0', outlineColor: THEME.primary }}
                            >
                                <option value="full_time">Full-Time</option>
                                <option value="part_time">Part-Time</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Changes will be applied immediately to this staff member's profile.</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsEditModalOpen(false); setEditingStaff(null); }}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateStaffMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: THEME.primaryGradient, boxShadow: `0 2px 8px ${THEME.primary}44` }}
                        >
                            {updateStaffMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Updating...
                                </span>
                            ) : (
                                'Update Staff'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};