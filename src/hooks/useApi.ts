import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    login, getVenueLocation, enrollKiosk,
    matchFace, verifyLiveness, clockAttendance,
    getStaffList,
    getMe,
    logout,
    createRole,
    createStaff,
    deleteRole,
    deleteStaff,
    getRoleAudit,
    getRolesList,
    patchStaffRole,
    updateStaff,
    updateRole,
    getStaffAttendanceHistory,
    getTodayAttendance,
    createMenuCategory,
    createMenuItem,
    deleteMenuCategory,
    deleteMenuItem,
    getMenuCategories,
    getMenuItems,
    updateMenuCategory,
    updateMenuItem
} from '../api/client';
import type {
    LoginRequest, KioskEnrollRequest, KioskMatchFaceRequest,
    KioskVerifyLivenessRequest, KioskClockRequest,
    RoleRequest,
    StaffRequest,
    MenuItemRequest,
    MenuCategoryRequest
} from '../api/types';

export const useLogin = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (credentials: LoginRequest) => login(credentials),
        onSuccess: (data) => {
            if (data?.access) localStorage.setItem('access_token', data.access);
            navigate('/dashboard');
        },
    });
};

export const useVenueLocation = () => {
    return useQuery({
        queryKey: ['venueLocation'],
        queryFn: getVenueLocation,
    });
};

export const useEnrollKiosk = () => {
    return useMutation({
        mutationFn: (data: KioskEnrollRequest) => enrollKiosk(data),
    });
};

export const useMatchFace = () => {
    return useMutation({
        mutationFn: (data: KioskMatchFaceRequest) => matchFace(data),
    });
};

export const useVerifyLiveness = () => {
    return useMutation({
        mutationFn: (data: KioskVerifyLivenessRequest) => verifyLiveness(data),
    });
};

export const useKioskClock = () => {
    return useMutation({
        mutationFn: (payload: KioskClockRequest) => clockAttendance(payload),
    });
};

export const useStaffList = () => {
    return useQuery({
        queryKey: ['staffList'],
        queryFn: getStaffList,
    });
};

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false,
        placeholderData: (previousData) => previousData,
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            localStorage.removeItem('access_token');
            queryClient.clear(); // Wipe the TanStack cache clean on sign out
            navigate('/');
        },
        onError: () => {
            // Fallback clean-up if token already expired
            localStorage.removeItem('access_token');
            queryClient.clear();
            navigate('/');
        }
    });
};

// --- Roles hooks ---
export const useRolesList = () => useQuery({ queryKey: ['rolesList'], queryFn: getRolesList });

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RoleRequest) => createRole(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolesList'] }),
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: RoleRequest }) => updateRole(subid, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolesList'] }),
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => deleteRole(subid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolesList'] }),
    });
};

export const useRoleAudit = (subid: string, enabled: boolean) => useQuery({
    queryKey: ['roleAudit', subid],
    queryFn: () => getRoleAudit(subid),
    enabled,
});

// --- Staff management hooks ---
export const useCreateStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StaffRequest) => createStaff(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staffList'] }),
    });
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: StaffRequest }) => updateStaff(subid, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolesList'] }),
    });
};

export const usePatchStaffRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, roleId }: { subid: string, roleId: string }) => patchStaffRole(subid, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staffList'] });
            queryClient.invalidateQueries({ queryKey: ['me'] }); // Invalidate profile session context if role altered
        },
    });
};

export const useDeleteStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => deleteStaff(subid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staffList'] }),
    });
};

export const useTodayAttendance = () => {
    return useQuery({
        queryKey: ['todayAttendance'],
        queryFn: getTodayAttendance,
        refetchInterval: 15000, // Auto-refresh every 15 seconds for real-time kiosk tracking
    });
};

export const useStaffAttendanceHistory = (staffSubId: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['staffAttendanceHistory', staffSubId],
        queryFn: () => getStaffAttendanceHistory(staffSubId),
        enabled,
    });
};

// --- Menu Category hooks ---
export const useMenuCategories = (page = 1) => useQuery({
    queryKey: ['menuCategories', page],
    queryFn: () => getMenuCategories(page),
});

export const useCreateMenuCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: MenuCategoryRequest) => createMenuCategory(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuCategories'] }),
    });
};

export const useUpdateMenuCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pk, data }: { pk: string | number, data: MenuCategoryRequest }) => updateMenuCategory(pk, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuCategories'] }),
    });
};

export const useDeleteMenuCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pk: string | number) => deleteMenuCategory(pk),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuCategories'] }),
    });
};

// --- Menu Item hooks ---
export const useMenuItems = (page = 1, categoryId?: string) => useQuery({
    queryKey: ['menuItems', page, categoryId],
    queryFn: () => getMenuItems(page, categoryId),
});

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: MenuItemRequest) => createMenuItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            queryClient.invalidateQueries({ queryKey: ['menuCategories'] }); // Triggers list item-count recalculation[cite: 2]
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pk, data }: { pk: string | number, data: MenuItemRequest }) => updateMenuItem(pk, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pk: string | number) => deleteMenuItem(pk),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menuItems'] });
            queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
        },
    });
};