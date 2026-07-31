"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });

      toast.success("Login successful");
      const callbackUrl = searchParams.get("callbackUrl");
      
      // Use window.location for hard navigation to ensure cookies are sent properly 
      // or to trigger middleware correctly if needed, but router.push is fine for Next.js App router
      window.location.href = callbackUrl || ROUTES.DASHBOARD;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Failed to log in. Please check your credentials.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          disabled={isLoading}
          {...form.register("email")}
          className="h-12 bg-white border-slate-300 text-slate-900 rounded-lg focus-visible:ring-1 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] shadow-sm text-[15px]"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
            Password
          </label>
          <Link href="/forgot-password" className="text-[13px] font-bold text-[#2563EB] hover:text-blue-700">
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoading}
            {...form.register("password")}
            className="h-12 pr-12 bg-white border-slate-300 text-slate-900 rounded-lg focus-visible:ring-1 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB] shadow-sm text-[15px] placeholder:tracking-[0.3em] placeholder:text-slate-700 placeholder:text-lg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 p-1"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3 pt-1 pb-1">
        <input 
          type="checkbox" 
          id="remember" 
          className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
        />
        <label htmlFor="remember" className="text-[15px] text-slate-600 font-medium cursor-pointer">
          Remember Me
        </label>
      </div>

      <Button 
        disabled={isLoading} 
        className="w-full h-[52px] rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[16px] flex items-center justify-center transition-colors shadow-sm"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <>
            Login
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
