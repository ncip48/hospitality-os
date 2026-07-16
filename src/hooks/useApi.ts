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
    updateMenuItem,
    confirmTablePairing,
    createTable,
    deleteTable,
    deleteTablePairing,
    getTable,
    getTableQr,
    getTablesList,
    requestTablePairingCode,
    seatWalkinGuests,
    toggleTableActiveStatus,
    updateTable,
    approveReservation,
    closeBillReservation,
    createReservation,
    declineReservation,
    deleteReservation,
    getReservation,
    getReservationsList,
    noShowReservation,
    promoteReservation,
    seatReservation,
    suggestTable,
    updateReservation,
    waitlistReservation
} from '../api/client';
import type {
    LoginRequest, KioskEnrollRequest, KioskMatchFaceRequest,
    KioskVerifyLivenessRequest, KioskClockRequest,
    RoleRequest,
    StaffRequest,
    MenuItemRequest,
    MenuCategoryRequest,
    PairingConfirmRequest,
    SeatWalkinRequest,
    TableRequest,
    ReservationRequest,
    SuggestTableParams
} from '../api/types';

export const useLogin = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (credentials: LoginRequest) => login(credentials),
        onSuccess: (data) => {
            if (data?.access) localStorage.setItem('access_token', data.access);
            if (data?.refresh) localStorage.setItem('refresh_token', data.refresh);
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

// --- Tables CRUD Hooks ---
export const useTablesList = (page = 1) => useQuery({
    queryKey: ['tablesList', page],
    queryFn: () => getTablesList(page)
});

export const useTableDetail = (subid: string, enabled = true) => useQuery({
    queryKey: ['tableDetail', subid],
    queryFn: () => getTable(subid),
    enabled,
});

export const useCreateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TableRequest) => createTable(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tablesList'] }),
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: TableRequest }) => updateTable(subid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tablesList'] });
            queryClient.invalidateQueries({ queryKey: ['tableDetail', variables.subid] });
        },
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => deleteTable(subid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tablesList'] }),
    });
};

// --- Tables Feature Hooks ---
export const useDeleteTablePairing = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => deleteTablePairing(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['tablesList'] });
            queryClient.invalidateQueries({ queryKey: ['tableDetail', subid] });
        },
    });
};

export const useConfirmTablePairing = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: PairingConfirmRequest }) => confirmTablePairing(subid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tablesList'] });
            queryClient.invalidateQueries({ queryKey: ['tableDetail', variables.subid] });
        },
    });
};

export const useTableQr = (subid: string, enabled = false) => useQuery({
    queryKey: ['tableQr', subid],
    queryFn: () => getTableQr(subid),
    enabled,
});

export const useSeatWalkinGuests = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: SeatWalkinRequest }) => seatWalkinGuests(subid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tablesList'] });
            queryClient.invalidateQueries({ queryKey: ['tableDetail', variables.subid] });
        },
    });
};

export const useToggleTableActiveStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => toggleTableActiveStatus(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['tablesList'] });
            queryClient.invalidateQueries({ queryKey: ['tableDetail', subid] });
        },
    });
};

export const useRequestTablePairingCode = () => {
    // Note: No invalidation needed for generating a code
    return useMutation({
        mutationFn: () => requestTablePairingCode(),
    });
};

// --- Reservations CRUD Hooks ---
export const useReservationsList = (page = 1, search = '') => useQuery({
    queryKey: ['reservationsList', page, search],
    queryFn: () => getReservationsList(page, search)
});

export const useReservationDetail = (subid: string, enabled = true) => useQuery({
    queryKey: ['reservationDetail', subid],
    queryFn: () => getReservation(subid),
    enabled,
});

export const useCreateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ReservationRequest) => createReservation(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservationsList'] }),
    });
};

export const useUpdateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ subid, data }: { subid: string, data: Partial<ReservationRequest> }) => updateReservation(subid, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', variables.subid] });
        },
    });
};

export const useDeleteReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => deleteReservation(subid),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservationsList'] }),
    });
};

// --- Reservations Feature Hooks ---

export const useApproveReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => approveReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
        },
    });
};

export const useCloseBillReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => closeBillReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
            queryClient.invalidateQueries({ queryKey: ['tablesList'] }); // Table frees up
        },
    });
};

export const useDeclineReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => declineReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
        },
    });
};

export const useNoShowReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => noShowReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
            queryClient.invalidateQueries({ queryKey: ['tablesList'] }); // Table frees up
        },
    });
};

export const usePromoteReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => promoteReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
        },
    });
};

export const useSeatReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => seatReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
            queryClient.invalidateQueries({ queryKey: ['tablesList'] }); // Table status changes
        },
    });
};

export const useWaitlistReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subid: string) => waitlistReservation(subid),
        onSuccess: (_, subid) => {
            queryClient.invalidateQueries({ queryKey: ['reservationsList'] });
            queryClient.invalidateQueries({ queryKey: ['reservationDetail', subid] });
        },
    });
};

export const useSuggestTable = (params: SuggestTableParams, enabled = false) => useQuery({
    queryKey: ['suggestTable', params],
    queryFn: () => suggestTable(params),
    enabled: enabled && !!params.time,
    retry: false
});