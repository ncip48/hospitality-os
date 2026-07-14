import axios from 'axios';
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
    MenuCategoryRequest
} from './types';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// 1. Request Interceptor: Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor: Catch global 401 errors and force logout
apiClient.interceptors.response.use(
    (response) => {
        // Pass successful responses right through
        return response;
    },
    (error) => {
        // Check if the server responded with a 401 Unauthorized status code
        if (error.response && error.response.status === 401) {
            console.warn('Session expired or unauthorized token detected. Forcing logout...');

            // Clear out stale authorization items
            localStorage.removeItem('access_token');

            // Force a hard redirect back to the root login route
            window.location.href = '/';
        }

        // Return the error so local TanStack Queries/Mutations can still catch it if needed
        return Promise.reject(error);
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
    await apiClient.post('/api/auth/logout/');
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