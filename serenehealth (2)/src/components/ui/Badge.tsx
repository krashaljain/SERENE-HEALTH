import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'normal' | 'warning' | 'abnormal' | 'lavender' | 'blue' | 'peach';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-black/5 text-text-primary',
      normal: 'bg-status-normal-bg text-status-normal-text',
      warning: 'bg-status-warning-bg text-status-warning-text',
      abnormal: 'bg-status-abnormal-bg text-status-abnormal-text',
      lavender: 'bg-pastel-lavender text-text-primary',
      blue: 'bg-pastel-blue text-text-primary',
      peach: 'bg-pastel-peach text-text-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
