import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    Edit2,
    Search,
    Filter,
    RefreshCw,
    Briefcase,
    Clock,
    Award,
    User,
    X,
    Hash,
    Mail,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle,
    Building2,
    Shield,
    MoreVertical,
    ChevronDown,
    Key
} from 'lucide-react';
import { useStaffList, useRolesList, useCreateStaff, useDeleteStaff, usePatchStaffRole, useUpdateStaff } from '../hooks/useApi';

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
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300"
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

export const StaffManagement: React.FC = () => {
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

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
        setRoleId(staff.role?.pk || '');
        setEmployment(staff.employment);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        updateStaffMutation.mutate(
            { subid: String(editingStaff.pk), data: { username, full_name: fullName, password, role_id: roleId, employment } },
            {
                onSuccess: () => {
                    setEditingStaff(null);
                    setUsername('');
                    setFullName('');
                    setRoleId('');
                    setEmployment('full_time');
                    setIsEditModalOpen(false);
                    // Refetch to get updated data
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6" style={{ color: theme.primary }} />
                        Staff Directory
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your team members and their access permissions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-lg"
                        style={{
                            background: theme.primaryGradient,
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
                        <UserPlus className="w-4 h-4" />
                        Register Staff
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Staff</span>
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Full Time</span>
                        <Briefcase className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{fullTimeStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Part Time</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{partTimeStaff}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Roles Available</span>
                        <Award className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{rolesData?.results?.length || 0}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{
                            borderColor: '#e2e8f0',
                            outlineColor: theme.primary
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filterEmployment}
                        onChange={(e) => setFilterEmployment(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all appearance-none"
                        style={{
                            borderColor: '#e2e8f0',
                            outlineColor: theme.primary
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                    </select>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loadingStaff ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2596be]" />
                        <p className="mt-2 text-slate-500">Loading staff directory...</p>
                    </div>
                ) : filteredStaff?.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No staff members found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {searchTerm || filterEmployment !== 'all' ? 'Try adjusting your filters' : 'Register your first team member'}
                        </p>
                        {!searchTerm && filterEmployment === 'all' && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
                                style={{
                                    background: theme.primaryGradient,
                                    boxShadow: `0 2px 8px ${theme.primary}44`
                                }}
                            >
                                <UserPlus className="w-4 h-4 inline mr-2" />
                                Register Staff
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Staff Profile
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Employment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Biometric Enrollment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Access Role
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredStaff?.map((member: any) => (
                                    <tr key={member.pk} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0"
                                                    style={{
                                                        backgroundColor: member.avatar_bg || theme.primary,
                                                        color: member.avatar_color || '#fff'
                                                    }}
                                                >
                                                    {member.initials}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{member.full_name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        @{member.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${member.employment === 'full_time'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {member.employment === 'full_time' ? (
                                                    <Briefcase className="w-3 h-3" />
                                                ) : (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                {member.employment.toUpperCase().replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.is_enrolled ?
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                    Enrolled
                                                </span> : <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                                    Not Enrolled
                                                </span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={member.role?.pk || ''}
                                                onChange={(e) => handleRoleChangePatch(member.pk, e.target.value)}
                                                disabled={patchRoleMutation.isPending}
                                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all appearance-none pr-8"
                                                style={{
                                                    borderColor: '#e2e8f0',
                                                    outlineColor: theme.primary
                                                }}
                                            >
                                                {rolesData?.results.map((r: any) => (
                                                    <option key={r.pk} value={r.pk}>{r.name}</option>
                                                ))}
                                            </select>
                                            {patchRoleMutation.isPending && isActiveStaffMutation(patchRoleMutation.variables, member.pk) && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600">
                                                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                                                    Updating...
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(member)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-600 group"
                                                    title="Edit Staff"
                                                >
                                                    <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.pk, member.full_name)}
                                                    disabled={deleteStaffMutation.isPending}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    title="Terminate Staff"
                                                >
                                                    {deleteStaffMutation.isPending && isActiveStaffMutation(deleteStaffMutation.variables, member.pk) ? (
                                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                    Showing {filteredStaff?.length || 0} of {staffData?.results?.length || 0} staff members
                </span>
                <span>
                    Last updated: {new Date().toLocaleString()}
                </span>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Register New Staff Member"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., johndoe"
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
                            Full Legal Name
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., John Doe"
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
                            Password
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
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
                            Access Role
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
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
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Employment Type
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={employment}
                                onChange={(e) => setEmployment(e.target.value as any)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
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
                            style={{
                                background: theme.primaryGradient,
                                boxShadow: `0 2px 8px ${theme.primary}44`
                            }}
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
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingStaff(null);
                }}
                title={`Edit Staff: ${editingStaff?.full_name || ''}`}
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., johndoe"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow bg-slate-50"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
                                required
                                disabled
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Username cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Full Legal Name
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., John Doe"
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
                            Password
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Access Role
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
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
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Employment Type
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={employment}
                                onChange={(e) => setEmployment(e.target.value as any)}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-shadow appearance-none"
                                style={{
                                    borderColor: '#e2e8f0',
                                    outlineColor: theme.primary
                                }}
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
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingStaff(null);
                            }}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={patchRoleMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: theme.primaryGradient,
                                boxShadow: `0 2px 8px ${theme.primary}44`
                            }}
                        >
                            {patchRoleMutation.isPending ? (
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