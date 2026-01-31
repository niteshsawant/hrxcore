'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Mentor Dashboard', href: '/mentor/dashboard', role: 'MENTOR' },
        { name: 'HR Dashboard', href: '/hr/dashboard', role: 'HR_PRO' },
        { name: 'Portfolio', href: '/portfolio', role: 'ALL' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-200 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary tracking-tight">HRX Platform</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-primary'
                                        : 'text-text-secondary hover:bg-slate-50 hover:text-text'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
