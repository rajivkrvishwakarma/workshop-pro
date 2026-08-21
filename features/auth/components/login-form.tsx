"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

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
      let callbackUrl = searchParams.get("callbackUrl");
      
      if (callbackUrl === "/forgot-password") {
        callbackUrl = null;
      }
      
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      
      {/* Email field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[12px] font-semibold text-blue-300/70 uppercase tracking-widest">
          Email Address
        </label>
        <div className="relative group">
          {/* Glow ring on focus */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-violet-500/0 group-focus-within:from-blue-500/40 group-focus-within:via-blue-400/20 group-focus-within:to-violet-500/30 transition-all duration-300 rounded-xl blur-sm pointer-events-none" />
          
          <div className="relative flex items-center bg-white/[0.07] border border-white/10 rounded-xl group-focus-within:border-blue-500/50 transition-colors duration-200">
            <Mail className="absolute left-4 w-4 h-4 text-blue-400/60 group-focus-within:text-blue-400 transition-colors shrink-0" />
            <input
              id="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              placeholder="you@example.com"
              {...form.register("email")}
              className="w-full h-13 pl-11 pr-4 py-3.5 bg-transparent text-white placeholder:text-white/25 text-[15px] rounded-xl outline-none"
            />
          </div>
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[12px] font-semibold text-blue-300/70 uppercase tracking-widest">
          Password
        </label>
        <div className="relative group">
          {/* Glow ring on focus */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-violet-500/0 group-focus-within:from-blue-500/40 group-focus-within:via-blue-400/20 group-focus-within:to-violet-500/30 transition-all duration-300 blur-sm pointer-events-none" />

          <div className="relative flex items-center bg-white/[0.07] border border-white/10 rounded-xl group-focus-within:border-blue-500/50 transition-colors duration-200">
            <Lock className="absolute left-4 w-4 h-4 text-blue-400/60 group-focus-within:text-blue-400 transition-colors shrink-0" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
              {...form.register("password")}
              className="w-full h-13 pl-11 pr-12 py-3.5 bg-transparent text-white placeholder:text-white/25 text-[15px] rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-white/30 hover:text-white/70 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-red-400 flex items-center gap-1 pl-1">
            <span>⚠</span> {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* {/* Forgot Password — commented out as requested */}
      {/* <div className="flex justify-end">
        <Link href="/forgot-password" className="text-[13px] font-bold text-blue-400 hover:text-blue-300">
          Forgot Password?
        </Link>
      </div> */}

      {/* Remember Me — commented out as requested */}
      {/* <div className="flex items-center space-x-3">
        <input type="checkbox" id="remember" className="h-4 w-4 rounded border-white/20 text-blue-500 cursor-pointer" />
        <label htmlFor="remember" className="text-[15px] text-white/50 font-medium cursor-pointer">Remember Me</label>
      </div> */}

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isLoading}
          className="
            relative w-full h-14 rounded-xl overflow-hidden
            font-bold text-[16px] text-white
            disabled:opacity-70 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-[0.98]
            group
          "
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-violet-500 transition-all duration-300" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
          
          {/* Bottom shadow glow */}
          <div className="absolute -bottom-2 inset-x-4 h-6 bg-blue-500/40 blur-lg rounded-full" />
          
          {/* Content */}
          <span className="relative flex items-center justify-center gap-2.5">
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </span>
        </button>
      </div>

      {/* Bottom hint */}
      <p className="text-center text-white/20 text-xs pt-1">
        Workshop Pro · Secure Login
      </p>
    </form>
  );
}
