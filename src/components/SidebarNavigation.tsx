import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, THEME } from '../constants';
import { usePermission } from '../hooks/usePermission';

export const SidebarNavigation: React.FC = () => {
    const location = useLocation();
    const { hasPermission } = usePermission();

    const visibleItems = NAV_ITEMS.filter(item =>
        hasPermission(item.permission)
    );

    return (
        <nav className="flex-1 px-4 py-6 relative">
            <div className="px-2 pb-3 text-[10px] text-slate-500 tracking-widest uppercase font-semibold">
                Main Menu
            </div>

            <div className="space-y-1">
                {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'text-white font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                            style={{
                                backgroundColor: isActive ? `${THEME.primary}22` : 'transparent'
                            }}
                        >
                            <Icon
                                className={`w-4 h-4 ${isActive ? `text-[${THEME.primary}]` : 'text-slate-500 group-hover:text-slate-300'}`}
                            />
                            <span className="text-sm">{item.label}</span>
                            {isActive && (
                                <>
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                        style={{ backgroundColor: THEME.primary }}
                                    />
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{
                                            backgroundColor: THEME.primary,
                                            boxShadow: `0 0 12px ${THEME.primary}88`
                                        }}
                                    />
                                </>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="px-2 pb-3 text-[10px] text-slate-500 tracking-widest uppercase font-semibold">
                    Workspace
                </div>
            </div>
        </nav>
    );
};