"use client";

import { LoginForm } from "@/features/auth/components/login-form";
import { Suspense } from "react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#F8F9FB] p-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 mb-6 shadow-sm overflow-hidden rounded-[14px]">
            <Image src="/logo.png" alt="Workshop Pro Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-[26px] font-bold text-center text-slate-900 leading-tight mb-3">
            Welcome back to<br />Workshop Pro
          </h1>
          <p className="text-slate-500 text-center text-[15px]">
            Sign in to access your dashboard
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center p-4">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
