export interface LoginRequest {
    username?: string;
    password?: string;
}

export interface KioskClockRequest {
    staff_id: string;
    action: 'in' | 'out';
    lat: number;
    lng: number;
    liveness_passed: boolean;
    face_match_score: number;
}

export interface KioskClockResponse {
    status: string;
    action: string;
    time: string;
}

export interface KioskEnrollRequest {
    staff_id: string;
    consent_given_at: string; // ISO-8601 string
    image: File; // File from camera/input
}

export interface KioskMatchFaceRequest {
    image: File;
}

export interface KioskMatchFaceResponse {
    staff_id: string;
    full_name?: string; // Optional helper based on your example
    score: number;
}

export interface KioskVerifyLivenessRequest {
    liveness_payload: Record<string, unknown>; // SDK payload structure
}

export interface KioskVerifyLivenessResponse {
    passed: boolean;
}

export interface VenueLocation {
    lat: number;
    lng: number;
    name: string;
    radius_m: number;
}

export interface Role {
    pk: number;
    name: string;
    color: string;
    is_system: boolean;
    is_locked: boolean;
    is_kiosk_only: boolean;
    permissions: string[];
    staff_count: number;
}

export interface Staff {
    pk: number;
    username: string;
    full_name: string;
    role: Role;
    employment: 'full_time' | 'part_time';
    hourly_rate: string | null;
    bpjs_active: boolean;
    avatar_bg: string;
    avatar_color: string;
    date_joined: string;
    initials: string;
    is_active: boolean;
    is_enrolled: boolean;
}

export interface PaginatedStaffList {
    count: number;
    next: string | null;
    previous: string | null;
    results: Staff[];
}

export interface RoleRequest {
    name: string;
    color: string;
    is_kiosk_only: boolean;
    permissions?: string[];
}

export interface PaginatedRoleList {
    count: number;
    next: string | null;
    previous: string | null;
    results: Role[];
}

export interface StaffRequest {
    username: string;
    full_name: string;
    role_id: string; // writeOnly write mapping
    employment: 'full_time' | 'part_time';
    password?: string;
    hourly_rate?: string | null;
    bpjs_active?: boolean;
    avatar_bg?: string;
    avatar_color?: string;
    is_active?: boolean;
}

export interface AttendanceSummary {
    pk: string
    staff_id: string
    staff_name: string
    date: string
    clock_in: string
    clock_out: string
    scheduled_start: string
    late_minutes: number
    verification_method: string
}

// ==========================================
// 4. Menu Category Types
// ==========================================
export interface MenuCategory {
    pk: number;
    name: string;
    sort_order?: number;
    item_count?: number; // Live calculation counter for items assigned to this category
}

export interface MenuCategoryRequest {
    name: string;
    sort_order?: number;
}

export interface PaginatedMenuCategoryList {
    count: number;
    next: string | null;
    previous: string | null;
    results: MenuCategory[];
}

// ==========================================
// 5. Menu Item Types
// ==========================================
export interface MenuItem {
    pk: number;
    name: string;
    category: MenuCategory | null;
    price: string; // Transmitted as string to preserve exact decimal precision
    description?: string;
    status: 'available' | 'soldout';
    is_popular: boolean;
}

export interface MenuItemRequest {
    name: string;
    category_id: string | number;
    price: string;
    description?: string;
    status?: 'available' | 'soldout';
    is_popular?: boolean;
}

export interface PaginatedMenuItemList {
    count: number;
    next: string | null;
    previous: string | null;
    results: MenuItem[];
}

// ==========================================
// 6. Tables & Seating Types
// ==========================================
export type TableStatusEnum = 'free' | 'seated' | 'ordered' | 'bill' | 'reserved';
export type AccessMethodEnum = 'tablet' | 'qr';

export interface Table {
    pk: string;
    label: string;
    seats: number;
    status: TableStatusEnum;
    is_active: boolean;
    access_method: AccessMethodEnum;
    current_guests: number;
    seated_since: string | null;
}

export interface TableRequest {
    label: string;
    seats: number;
    is_active?: boolean;
}

export interface PaginatedTableList {
    count: number;
    next: string | null;
    previous: string | null;
    results: Table[];
}

export interface PairingConfirmRequest {
    code: string;
}

export interface SeatWalkinRequest {
    guests?: number; // Defaults to 1 if omitted
}

// --- Reservations Types ---
export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'waitlist'
    | 'seated'
    | 'no_show'
    | 'cancelled'
    | 'declined'
    | 'completed';

export type ReservationSource = 'website' | 'whatsapp' | 'phone' | 'walkin';

export interface Reservation {
    pk: string;
    guest_name: string;
    phone?: string;
    party_size: number;
    time: string; // ISO date-time
    duration_minutes: number;
    status: ReservationStatus;
    source: ReservationSource;
    assigned_table: Table;
    notes?: string;
    created_at: string; // ISO date-time
}

export interface ReservationRequest {
    guest_name: string;
    phone?: string;
    party_size: number;
    time: string; // ISO date-time
    duration_minutes?: number;
    source: ReservationSource;
    assigned_table_id?: string | null;
    notes?: string;
}

export interface PaginatedReservationList {
    count: number;
    next: string | null;
    previous: string | null;
    results: Reservation[];
}

export interface SuggestTableParams {
    time: string; // ISO-8601
    duration?: number;
    party_size?: number;
}