import { useMe } from "./useApi";

export const usePermission = () => {
    const { data: me } = useMe();

    const permissions = me?.role?.permissions ?? [];

    const hasPermission = (permission: string | null) => {
        if (me?.role?.is_locked) return true;

        if (!permission) return true;

        if (permissions.includes("*")) return true;

        if (permissions.includes(permission)) return true;

        const module = permission.split(":")[0];

        return permissions.includes(`${module}:*`);
    };

    return {
        permissions,
        hasPermission,
    };
};