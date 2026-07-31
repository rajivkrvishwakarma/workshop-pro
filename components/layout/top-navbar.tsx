"use client";

import { Bell, Search, Menu, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import { usePathname } from "next/navigation";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user } = useAuth();
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

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = ROUTES.LOGIN;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-4 shadow-sm md:px-6">
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
          ) : onMenuClick ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          ) : null}
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

      <div className="flex items-center gap-4">
        <ThemeToggle className="hidden md:flex" />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName || "User"} />
                <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
