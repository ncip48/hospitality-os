export const Permission = {
    DASHBOARD_VIEW: 'dashboard:view',

    KIOSK_VIEW: 'kiosk:view',

    STAFF_VIEW: 'staff:view',
    STAFF_CREATE: 'staff:create',
    STAFF_UPDATE: 'staff:edit',
    STAFF_DELETE: 'staff:delete',

    ROLES_ADMIN_VIEW: 'rolesadmin:view',
    ROLES_ADMIN_CREATE: 'rolesadmin:create',
    ROLES_ADMIN_UPDATE: 'rolesadmin:edit',
    ROLES_ADMIN_DELETE: 'rolesadmin:delete',
} as const;

export type Permission =
    typeof Permission[keyof typeof Permission];