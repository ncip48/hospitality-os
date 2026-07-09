import {
    LayoutDashboard,
    Fingerprint,
    UserPlus,
    Users,
    Shield
} from 'lucide-react';

export const THEME = {
    primary: '#2596be',
    primaryLight: '#2596be15',
    primaryDark: '#1a7a9e',
    primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
};

export const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/kiosk', icon: Fingerprint, label: 'Attendance Kiosk' },
    { path: '/enroll', icon: UserPlus, label: 'Staff Enrollment' },
    { path: '/staff', icon: Users, label: 'Staff Directory' },
    { path: '/roles', icon: Shield, label: 'System Roles' }
];

export const PAGE_DESCRIPTIONS: Record<string, string> = {
    '/dashboard': 'Your dashboard today',
    '/kiosk': 'Manage daily attendance tracking with facial recognition',
    '/enroll': 'Register and onboard new staff members seamlessly',
    '/staff': 'View and manage your complete team directory',
    '/roles': 'Configure system permissions and access control'
};