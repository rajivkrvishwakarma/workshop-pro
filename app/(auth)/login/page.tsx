"use client";

import { LoginForm } from "@/features/auth/components/login-form";
import { Suspense } from "react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-end sm:justify-center items-center relative overflow-hidden bg-[#080c1a]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right glow */}
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-600/30 to-violet-600/20 blur-[80px]" />
        {/* Bottom-left glow */}
        <div className="absolute -bottom-40 -left-20 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-indigo-700/25 to-blue-500/15 blur-[90px]" />
        {/* Center accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-blue-500/10 blur-[60px]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,179,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Top branding area (visible on small screens) */}
      <div className="flex flex-col items-center pt-16 pb-8 sm:hidden relative z-10 w-full px-8">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl scale-110" />
          {/* <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"> */}
          <Image
            src="/logo.png"
            alt="Workshop Pro"
            width={140}
            height={140}
            className="object-cover"
          />
          {/* </div> */}
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight leading-none">
          Welcome Back
        </h1>
        <p className="text-blue-300/70 text-sm mt-2 font-medium">
          Sign in to Workshop Pro
        </p>
      </div>

      {/* Main card — slides up on mobile, centered on desktop */}
      <div className="relative z-10 w-full sm:max-w-[420px] sm:mx-auto">
        {/* Glassmorphism card */}
        <div
          className="
          w-full bg-white/[0.05] backdrop-blur-2xl
          rounded-t-[32px] sm:rounded-[28px]
          border-t border-x border-white/10 sm:border
          shadow-[0_-20px_60px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)]
          px-7 pt-8 pb-10 sm:px-10 sm:py-10
        "
        >
          {/* Desktop branding (hidden on mobile) */}
          <div className="hidden sm:flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/40 blur-xl scale-125" />
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Workshop Pro"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-blue-300/60 text-sm mt-1.5 font-medium">
              Sign in to Workshop Pro
            </p>
          </div>

          {/* Mobile drag handle */}
          <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

          <Suspense
            fallback={
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
