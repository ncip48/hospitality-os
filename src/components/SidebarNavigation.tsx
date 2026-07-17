import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    ChevronRight,
    Circle,
    ArrowRight,
    LayoutDashboard,
    Grid,
    Clock
} from 'lucide-react';
import { NAV_ITEMS, THEME } from '../constants';
import { usePermission } from '../hooks/usePermission';

// Section type for grouping
type Section = {
    title: string;
    icon?: React.ReactNode;
    items: typeof NAV_ITEMS;
};

export const SidebarNavigation: React.FC = () => {
    const location = useLocation();
    const { hasPermission } = usePermission();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    // Filter visible items
    const visibleItems = NAV_ITEMS.filter(item =>
        hasPermission(item.permission)
    );

    // Group items into sections
    const sections: Section[] = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard className="w-3.5 h-3.5" />,
            items: visibleItems.filter(item => item.path === '/dashboard')
        },
        {
            title: 'Operations',
            icon: <Clock className="w-3.5 h-3.5" />,
            items: visibleItems.filter(item =>
                ['/kiosk', '/enroll', '/staff'].includes(item.path)
            )
        },
        {
            title: 'Management',
            icon: <Grid className="w-3.5 h-3.5" />,
            items: visibleItems.filter(item =>
                ['/roles', '/tables', '/reservations', '/menu-items', '/menu-categories'].includes(item.path)
            )
        }
    ];

    // Toggle section collapse
    const toggleSection = (title: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Get icon for section
    const getSectionIcon = (title: string) => {
        switch (title) {
            case 'Dashboard': return <LayoutDashboard className="w-3.5 h-3.5" />;
            case 'Operations': return <Clock className="w-3.5 h-3.5" />;
            case 'Management': return <Grid className="w-3.5 h-3.5" />;
            default: return <Circle className="w-3.5 h-3.5" />;
        }
    };

    // Check if any item in section is active
    const isSectionActive = (items: typeof NAV_ITEMS) => {
        return items.some(item => location.pathname === item.path);
    };

    return (
        <nav className="flex-1 px-3 py-4 relative overflow-y-auto">

            {/* Navigation Sections */}
            <div className="space-y-4">
                {sections.map((section) => {
                    const isActive = isSectionActive(section.items);
                    const isCollapsed = collapsedSections[section.title];
                    const hasItems = section.items.length > 0;

                    if (!hasItems) return null;

                    return (
                        <div key={section.title} className="space-y-1">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <span className={`text-[11px] font-medium uppercase tracking-wider ${isActive ? 'text-[#2596be]' : 'text-slate-500'
                                    }`}>
                                    {section.title}
                                </span>
                                <div className="flex-1" />
                                <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                                    {isCollapsed ? (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                </div>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                                        backgroundColor: THEME.primary,
                                        boxShadow: `0 0 12px ${THEME.primary}88`
                                    }} />
                                )}
                            </button>

                            {/* Section Items */}
                            {!isCollapsed && (
                                <div className="ml-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                                    {section.items.map((item) => {
                                        const isItemActive = location.pathname === item.path;
                                        const Icon = item.icon;
                                        const isHovered = hoveredItem === item.path;

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${isItemActive
                                                    ? 'text-white font-medium'
                                                    : 'text-slate-400 hover:text-slate-200'
                                                    }`}
                                                style={{
                                                    backgroundColor: isItemActive ? `${THEME.primary}22` : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent'
                                                }}
                                                onMouseEnter={() => setHoveredItem(item.path)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                            >
                                                <div className={`relative ${isItemActive ? 'text-[#2596be]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                    <Icon className="w-4 h-4" />
                                                    {isItemActive && (
                                                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#2596be] animate-pulse" />
                                                    )}
                                                </div>
                                                <span className="text-sm">{item.label}</span>
                                                {isItemActive && (
                                                    <div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                                                        style={{ backgroundColor: THEME.primary }}
                                                    />
                                                )}
                                                {!isItemActive && isHovered && (
                                                    <ArrowRight className="ml-auto w-3.5 h-3.5 text-slate-500 animate-in slide-in-from-right duration-200" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
        @keyframes slide-in-from-top-2 {
          from { 
            opacity: 0;
            transform: translateY(-0.5rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-right {
          from { 
            opacity: 0;
            transform: translateX(0.5rem);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
        .duration-200 { animation-duration: 200ms; }
      `}</style>
        </nav>
    );
};