"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";