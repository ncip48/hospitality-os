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

    MENU_VIEW: 'menu:view',
    MENU_CREATE: 'menu:create',
    MENU_UPDATE: 'menu:edit',
    MENU_DELETE: 'menu:delete',

    TABLE_VIEW: 'table:view',
    TABLE_CREATE: 'table:create',
    TABLE_UPDATE: 'table:edit',
    TABLE_DELETE: 'table:delete',
} as const;

export type Permission =
    typeof Permission[keyof typeof Permission];