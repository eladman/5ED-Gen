"use client";

import React from "react";

// Simplified version without external dependencies
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const getButtonClasses = (
  variant: ButtonVariant = "primary", 
  size: ButtonSize = "default",
  className: string = ""
): string => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border border-input bg-background hover:bg-accent",
    ghost: "hover:bg-accent",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };
  
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", asChild = false, children, ...props }, ref) => {
    // We're skipping the asChild implementation for simplicity
    // In a real implementation, this would handle rendering as a different element type
    
    return (
      <button
        className={getButtonClasses(variant, size, className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button; 