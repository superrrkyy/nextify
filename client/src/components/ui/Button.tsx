import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-accent text-background hover:bg-accent-secondary shadow-lg shadow-accent/20 hover:shadow-accent/30',
    secondary: 'bg-surface text-text hover:bg-surface/80 border border-border',
    ghost: 'text-text hover:bg-surface hover:text-accent',
    outline: 'border border-border text-text hover:bg-surface hover:border-accent',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}

export function IconButton({
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: ButtonProps) {
  return <Button className={cn('rounded-full', className)} variant={variant} size={size} {...props} />;
}
