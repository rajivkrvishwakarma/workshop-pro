"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard", fill: true },
    { label: "Orders", href: "/orders", icon: "list_alt", fill: false },
    { label: "New Order", href: "/orders/new", icon: "add_circle", fill: false },
    { label: "Settings", href: "/settings", icon: "settings", fill: false },
    { label: "Profile", href: "/profile", icon: "person", fill: false },
  ];

  const isFullScreenMobile = pathname.startsWith("/orders/new");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block border-r border-outline-variant bg-surface w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className={isFullScreenMobile ? "hidden md:block" : "block"}>
          <TopNavbar onMenuClick={() => {}} />
        </div>
        <main className={cn(
          "flex-1 overflow-y-auto",
          isFullScreenMobile ? "p-0 md:p-6 lg:p-8" : "pb-24 md:pb-6 p-2 sm:p-4 md:p-6 lg:p-8"
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className={cn(
          "bg-surface fixed bottom-0 left-0 w-full z-50 justify-around items-center px-2 py-3 pb-[env(safe-area-inset-bottom)] border-t border-outline-variant font-label-sm text-label-sm",
          isFullScreenMobile ? "hidden" : "flex md:hidden"
        )}>
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href);
              
            return (
              <Link href={item.href} key={item.label}>
                <div className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-90 duration-150 ease-in-out w-[72px] ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-primary'}`}>
                  <span className="material-symbols-outlined mb-1" style={isActive || item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {item.icon}
                  </span>
                  <span className="truncate w-full text-center">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
