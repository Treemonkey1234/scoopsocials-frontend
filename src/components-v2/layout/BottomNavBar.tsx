import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, MagnifyingGlassIcon, InboxIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, UserGroupIcon as UserGroupIconSolid, MagnifyingGlassIcon as MagnifyingGlassIconSolid, InboxIcon as InboxIconSolid, UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid';

const navItems = [
    { href: '/home', label: 'Home', icon: HomeIcon, solidIcon: HomeIconSolid },
    { href: '/events', label: 'Groups', icon: UserGroupIcon, solidIcon: UserGroupIconSolid },
    { href: '/search', label: 'Search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIconSolid },
    { href: '/inbox', label: 'Inbox', icon: InboxIcon, solidIcon: InboxIconSolid },
    { href: '/profile', label: 'Profile', icon: UserCircleIcon, solidIcon: UserCircleIconSolid },
];

const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (href: string) => location.pathname === href;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-paper border-t border-gray-200 shadow-lg">
            <div className="flex justify-around items-center h-full max-w-md mx-auto">
                {navItems.map(({ href, label, icon: Icon, solidIcon: SolidIcon }) => {
                    const active = isActive(href);
                    const CurrentIcon = active ? SolidIcon : Icon;
                    return (
                        <button key={label} onClick={() => navigate(href)} className="flex flex-col items-center justify-center w-full h-full">
                            <CurrentIcon className={`h-6 w-6 ${active ? 'text-brand' : 'text-secondary'}`} />
                            <span className={`text-xs mt-1 ${active ? 'text-brand' : 'text-secondary'}`}>{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavBar; 