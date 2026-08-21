"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS, NavSection, NavItem } from "@/constants/nav";
import { cn } from "@/lib/utils/cn";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";

function SidebarSection({
  section,
  visibleItems,
  pathname
}: {
  section: NavSection;
  visibleItems: NavItem[];
  pathname: string;
}) {
  // Collapse 'System' by default, expand others
  const [isExpanded, setIsExpanded] = useState(section.label !== 'System');

  return (
    <div className="flex flex-col gap-1">
      {section.label && (
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider">
            {section.label}
          </h4>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          ) : (
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          )}
        </div>
      )}

      {(!section.label || isExpanded) && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "justify-start rounded-xl mb-1 h-11",
                  isActive ? "bg-primary-container text-on-primary-container font-semibold hover:bg-primary-container/90" : "text-on-surface-variant font-normal hover:bg-surface-container-low hover:text-on-surface"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { can, isSuperAdmin } = usePermissions();

  return (
    <div className="flex h-full w-64 flex-col bg-surface border-r border-outline-variant py-4 shadow-sm">
      <div className="mb-8 px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Workshop Pro" width={32} height={32} className="rounded-md object-contain" />
          <h2 className="text-xl font-bold tracking-tight text-primary">
            Workshop Pro
          </h2>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-6">
          {NAV_SECTIONS.map((section, index) => {
            // Filter sections for SuperAdmin
            if (isSuperAdmin() && (section.label === 'Operations' || section.label === 'Management')) {
              return null;
            }

            // Filter items based on permissions
            const visibleItems = section.items.filter(
              (item) => !item.requiredPermission || can(item.requiredPermission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <SidebarSection
                key={index}
                section={section}
                visibleItems={visibleItems}
                pathname={pathname}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-6 pt-4 border-t border-outline-variant flex items-center justify-between">
        <span className="text-sm text-on-surface-variant font-medium">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );
}
