"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LogOut, Monitor, Moon, Sun, Shield, User, Mail, UserCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth.service";

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = ROUTES.LOGIN;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
        <Avatar className="h-24 w-24 border-4 border-surface shadow-sm">
          <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName || "User"} />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {user?.firstName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {user?.firstName} {user?.lastName}
          </h1>
          <div className="flex items-center justify-center text-muted-foreground gap-1.5">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{user?.email}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {user?.roles?.map((role) => (
            <span key={role} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              Theme Preference
            </CardTitle>
            <CardDescription>
              Customize the appearance of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className={`h-auto flex-col py-4 gap-2 ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-6 w-6 mb-1" />
                  <span>Light</span>
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className={`h-auto flex-col py-4 gap-2 ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-6 w-6 mb-1" />
                  <span>Dark</span>
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className={`h-auto flex-col py-4 gap-2 ${theme === 'system' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-6 w-6 mb-1" />
                  <span>System</span>
                </Button>
              </div>
            ) : (
              <div className="h-[92px] w-full bg-muted animate-pulse rounded-lg"></div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="shadow-sm border-slate-200/60 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Your Permissions
            </CardTitle>
            <CardDescription>
              Actions and areas you have access to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((perm) => (
                  <span 
                    key={perm} 
                    className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-border"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No special permissions assigned.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="mt-4">
        <Button 
          variant="destructive" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-6 text-base font-medium shadow-sm hover:shadow-md transition-all"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out of Workshop Pro
        </Button>
      </div>
    </div>
  );
}
