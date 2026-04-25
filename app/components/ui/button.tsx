import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--kura-primary)]/40',
  {
    variants: {
      variant: {
        default: 'bg-[var(--kura-primary)] text-white hover:bg-[var(--kura-primary-dark)]',
        secondary: 'bg-[var(--kura-surface-strong)] text-[var(--kura-text)] hover:brightness-95 border border-[var(--kura-border)]',
        ghost: 'text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)] hover:bg-[var(--kura-border-light)]',
        destructive: 'bg-red-600/90 text-white hover:bg-red-600',
        outline: 'border border-[var(--kura-border)] text-[var(--kura-text)] hover:bg-[var(--kura-border-light)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
