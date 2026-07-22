import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--kura-primary)]/15 text-[var(--kura-primary-light)]',
        success:
          'border-transparent bg-[var(--kura-success-bg)] text-[var(--kura-success-fg)]',
        destructive:
          'border-transparent bg-[var(--kura-error-bg)] text-[var(--kura-error-fg)]',
        outline: 'border-[var(--kura-border)] text-[var(--kura-text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
