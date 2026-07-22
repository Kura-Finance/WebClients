import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'border-[var(--kura-border)] bg-[var(--kura-bg-light)] text-[var(--kura-text)]',
      success:
        'border-[var(--kura-success-border)] bg-[var(--kura-success-bg)] text-[var(--kura-success-fg)]',
      destructive:
        'border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] text-[var(--kura-error-fg)]',
      warning:
        'border-[var(--kura-warning-border)] bg-[var(--kura-warning-bg)] text-[var(--kura-warning-fg)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div role="alert" data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return <h5 data-slot="alert-title" className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
