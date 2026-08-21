"use client";

import { Bell, Search, Menu, ArrowLeft } from "lucide-react";
import { InstallPwaButton } from "@/components/common/install-pwa-button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const rootPaths = ['/', '/dashboard', '/orders', '/settings', '/profile'];
  const isSubPage = !rootPaths.includes(pathname);

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/orders') return 'All Orders';
    if (path.startsWith('/orders/') && path !== '/orders/new') return 'Order Details';
    if (path === '/settings') return 'Settings';
    if (path === '/profile') return 'Profile';
    return '';
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-outline-variant bg-surface px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isSubPage ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go Back</span>
            </Button>
          ) : null}
          {/* onMenuClick ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          ) : null */}
          <h1 className="text-lg font-bold text-primary md:hidden truncate max-w-[180px]">
            {getPageTitle(pathname)}
          </h1>
        </div>
        <div className="relative hidden max-w-md md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-9 md:w-[300px] lg:w-[400px] focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <InstallPwaButton />
        
        <ThemeToggle />

        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600"></span>
          <span className="sr-only">Notifications</span>
        </Button> */}
      </div>
    </header>
  );
}
