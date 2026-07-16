import {
    LayoutDashboard,
    Fingerprint,
    UserPlus,
    Users,
    Shield,
    FolderKanban,
    UtensilsCrossed,
    LayoutGrid,
    CalendarDays
} from 'lucide-react';
import { Permission } from '../auth/permissions';

export const THEME = {
    primary: '#2596be',
    primaryLight: '#2596be',
    primaryDark: '#1a7a9e',
    primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
};


export const NAV_ITEMS = [
    {
        path: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
        permission: Permission.DASHBOARD_VIEW,
    },
    {
        path: '/kiosk',
        icon: Fingerprint,
        label: 'Attendance Kiosk',
        permission: null,
    },
    {
        path: '/enroll',
        icon: UserPlus,
        label: 'Staff Enrollment',
        permission: Permission.STAFF_UPDATE,
    },
    {
        path: '/staff',
        icon: Users,
        label: 'Staff Directory',
        permission: Permission.STAFF_VIEW,
    },
    {
        path: '/roles',
        icon: Shield,
        label: 'System Roles',
        permission: Permission.ROLES_ADMIN_VIEW,
    },
    {
        path: '/menu-categories',
        icon: FolderKanban,
        label: 'Menu Categories',
        permission: Permission.MENU_VIEW,
    },
    {
        path: '/menu-items',
        icon: UtensilsCrossed,
        label: 'Menu Items',
        permission: Permission.MENU_VIEW,
    },
    {
        path: '/tables',
        icon: LayoutGrid,
        label: 'Tables',
        permission: Permission.TABLE_VIEW,
    },
    {
        path: '/reservations',
        icon: CalendarDays,
        label: 'Reservations',
        permission: Permission.TABLE_VIEW, // Assuming you have this permission
    }
] as const;

export const PAGE_DESCRIPTIONS: Record<string, string> = {
    '/dashboard': 'Your dashboard today',
    '/kiosk': 'Manage daily attendance tracking with facial recognition',
    '/enroll': 'Register and onboard new staff members seamlessly',
    '/staff': 'View and manage your complete team directory',
    '/roles': 'Configure system permissions and access control'
};