import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
    LoginRequest, KioskClockRequest, KioskClockResponse,
    KioskEnrollRequest, KioskMatchFaceRequest, KioskMatchFaceResponse,
    KioskVerifyLivenessRequest, KioskVerifyLivenessResponse, VenueLocation,
    PaginatedStaffList,
    Staff,
    PaginatedRoleList,
    Role,
    RoleRequest,
    StaffRequest,
    AttendanceSummary,
    PaginatedMenuCategoryList,
    PaginatedMenuItemList,
    MenuItem,
    MenuCategory,
    MenuItemRequest,
    MenuCategoryRequest,
    PaginatedTableList,
    PairingConfirmRequest,
    SeatWalkinRequest,
    Table,
    TableRequest,
    PaginatedReservationList,
    Reservation,
    ReservationRequest,
    SuggestTableParams
} from './types';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token?: string) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });

    failedQueue = [];
};

// Attach access token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Refresh token on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryRequestConfig;

        if (
            error.response?.status !== 401 ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        // Don't refresh when refresh endpoint itself fails
        if (originalRequest.url?.includes("/auth/refresh")) {
            logout();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                logout();
                return Promise.reject(error);
            }

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/refresh/`,
                {
                    refresh: refreshToken,
                }
            );

            localStorage.setItem("access_token", data.access);

            apiClient.defaults.headers.common.Authorization =
                `Bearer ${data.access}`;

            processQueue(null, data.access);

            originalRequest.headers.Authorization =
                `Bearer ${data.access}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            logout();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const login = async (data: LoginRequest) => {
    const response = await apiClient.post('/api/auth/login/', data);
    return response.data;
};

// --- New Kiosk Endpoints ---

export const getVenueLocation = async (): Promise<VenueLocation> => {
    const response = await apiClient.get('/api/kiosk/venue-location/');
    return response.data;
};

export const enrollKiosk = async (data: KioskEnrollRequest) => {
    const formData = new FormData();
    formData.append('staff_id', data.staff_id);
    formData.append('consent_given_at', data.consent_given_at);
    formData.append('image', data.image);

    const response = await apiClient.post('/api/kiosk/enroll/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const matchFace = async (data: KioskMatchFaceRequest): Promise<KioskMatchFaceResponse> => {
    const formData = new FormData();
    formData.append('image', data.image);

    const response = await apiClient.post('/api/kiosk/match-face/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const verifyLiveness = async (data: KioskVerifyLivenessRequest): Promise<KioskVerifyLivenessResponse> => {
    const response = await apiClient.post('/api/kiosk/verify-liveness/', data);
    return response.data;
};

export const clockAttendance = async (data: KioskClockRequest): Promise<KioskClockResponse> => {
    const response = await apiClient.post('/api/kiosk/clock/', data);
    return response.data;
};

export const getStaffList = async (): Promise<PaginatedStaffList> => {
    const response = await apiClient.get('/api/staff/');
    return response.data;
};

export const getMe = async (): Promise<Staff> => {
    const response = await apiClient.get('/api/auth/me/');
    return response.data;
};

export const logout = async () => {
    // Even if 204 is empty, hitting the endpoint clears the token session server-side
    // await apiClient.post('/api/auth/logout/');
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
};

// --- Roles CRUD Operations ---
export const getRolesList = async (): Promise<PaginatedRoleList> => {
    const response = await apiClient.get('/api/roles/');
    return response.data;
};

export const createRole = async (data: RoleRequest): Promise<Role> => {
    const response = await apiClient.post('/api/roles/', data);
    return response.data;
};
export const updateRole = async (subid: string, data: RoleRequest): Promise<Role> => {
    const response = await apiClient.patch(`/api/roles/${subid}/`, data);
    return response.data;
};

export const deleteRole = async (subid: string): Promise<void> => {
    await apiClient.delete(`/api/roles/${subid}/`);
};

export const getRoleAudit = async (subid: string): Promise<Role> => {
    const response = await apiClient.get(`/api/roles/${subid}/audit/`);
    return response.data;
};

// --- Staff CRUD & Role Patching Operations ---
export const createStaff = async (data: StaffRequest): Promise<Staff> => {
    const response = await apiClient.post('/api/staff/', data);
    return response.data;
};

export const updateStaff = async (
    subid: string,
    data: StaffRequest
): Promise<Staff> => {
    const payload = { ...data };

    if (!payload.password?.trim()) {
        delete payload.password;
    }

    const response = await apiClient.patch(`/api/staff/${subid}/`, payload);
    return response.data;
};

export const patchStaffRole = async (subid: string, roleId: string): Promise<Staff> => {
    const response = await apiClient.patch(`/api/staff/${subid}/role/`, { role_id: roleId });
    return response.data;
};

export const deleteStaff = async (subid: string): Promise<void> => {
    await apiClient.delete(`/api/staff/${subid}/`);
};

export const getTodayAttendance = async (): Promise<AttendanceSummary[]> => {
    const response = await apiClient.get('/api/attendance/today/');
    return response.data;
};

export const getStaffAttendanceHistory = async (staffSubId: string): Promise<AttendanceSummary[]> => {
    const response = await apiClient.get(`/api/attendance/${staffSubId}/`);
    return response.data;
};

// --- Menu Categories Operations ---
export const getMenuCategories = async (page = 1): Promise<PaginatedMenuCategoryList> => {
    const response = await apiClient.get('/api/menu-categories/', { params: { page } });
    return response.data;
};

export const createMenuCategory = async (data: MenuCategoryRequest): Promise<MenuCategory> => {
    const response = await apiClient.post('/api/menu-categories/', data);
    return response.data;
};

export const updateMenuCategory = async (
    pk: number | string,
    data: MenuCategoryRequest
): Promise<MenuCategory> => {
    const response = await apiClient.patch(`/api/menu-categories/${pk}/`, data);
    return response.data;
};

export const deleteMenuCategory = async (pk: number | string): Promise<void> => {
    await apiClient.delete(`/api/menu-categories/${pk}/`);
};

// --- Menu Items Operations ---
export const getMenuItems = async (page = 1, categoryId?: string): Promise<PaginatedMenuItemList> => {
    const response = await apiClient.get('/api/menu/', { params: { page, category_id: categoryId } });
    return response.data;
};

export const createMenuItem = async (data: MenuItemRequest): Promise<MenuItem> => {
    const response = await apiClient.post('/api/menu/', data);
    return response.data;
};

export const updateMenuItem = async (
    pk: number | string,
    data: MenuItemRequest
): Promise<MenuItem> => {
    const response = await apiClient.patch(`/api/menu/${pk}/`, data);
    return response.data;
};

export const deleteMenuItem = async (pk: number | string): Promise<void> => {
    await apiClient.delete(`/api/menu/${pk}/`);
};

// --- Tables CRUD Operations ---
export const getTablesList = async (page = 1): Promise<PaginatedTableList> => {
    const response = await apiClient.get('/api/tables/', { params: { page } });
    return response.data;
};

export const getTable = async (subid: string): Promise<Table> => {
    const response = await apiClient.get(`/api/tables/${subid}/`);
    return response.data;
};

export const createTable = async (data: TableRequest): Promise<Table> => {
    const response = await apiClient.post('/api/tables/', data);
    return response.data;
};

export const updateTable = async (subid: string, data: TableRequest): Promise<Table> => {
    const response = await apiClient.patch(`/api/tables/${subid}/`, data);
    return response.data;
};

export const deleteTable = async (subid: string): Promise<void> => {
    await apiClient.delete(`/api/tables/${subid}/`);
};

// --- Tables Features Operations ---
export const deleteTablePairing = async (subid: string): Promise<void> => {
    await apiClient.delete(`/api/tables/${subid}/pairing/`);
};

export const confirmTablePairing = async (subid: string, data: PairingConfirmRequest): Promise<void> => {
    await apiClient.post(`/api/tables/${subid}/pairing/confirm/`, data);
};

export const getTableQr = async (subid: string): Promise<Table> => {
    const response = await apiClient.get(`/api/tables/${subid}/qr/`);
    return response.data;
};

export const seatWalkinGuests = async (subid: string, data: SeatWalkinRequest): Promise<Table> => {
    const response = await apiClient.post(`/api/tables/${subid}/seat-walkin/`, data);
    return response.data;
};

export const toggleTableActiveStatus = async (subid: string): Promise<Table> => {
    const response = await apiClient.patch(`/api/tables/${subid}/toggle-active/`);
    return response.data;
};

export const requestTablePairingCode = async (): Promise<void> => {
    await apiClient.post('/api/tables/pairing/request-code/');
};

// --- Reservations CRUD Operations ---
export const getReservationsList = async (page = 1, search = ''): Promise<PaginatedReservationList> => {
    const response = await apiClient.get('/api/reservations/', {
        params: { page, ...(search && { search }) }
    });
    return response.data;
};

export const getReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.get(`/api/reservations/${subid}/`);
    return response.data;
};

export const createReservation = async (data: ReservationRequest): Promise<Reservation> => {
    const response = await apiClient.post('/api/reservations/', data);
    return response.data;
};

export const updateReservation = async (subid: string, data: Partial<ReservationRequest>): Promise<Reservation> => {
    const response = await apiClient.patch(`/api/reservations/${subid}/`, data);
    return response.data;
};

export const deleteReservation = async (subid: string): Promise<void> => {
    await apiClient.delete(`/api/reservations/${subid}/`);
};

// --- Reservations Feature Operations ---
export const approveReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/approve/`);
    return response.data;
};

export const closeBillReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/close-bill/`);
    return response.data;
};

export const declineReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/decline/`);
    return response.data;
};

export const noShowReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/no-show/`);
    return response.data;
};

export const promoteReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/promote/`);
    return response.data;
};

export const seatReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/seat/`);
    return response.data;
};

export const waitlistReservation = async (subid: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${subid}/waitlist/`);
    return response.data;
};

export const suggestTable = async (params: SuggestTableParams): Promise<Table> => {
    const response = await apiClient.get('/api/reservations/suggest-table/', { params });
    return response.data;
};