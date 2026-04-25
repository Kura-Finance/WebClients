import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-md border border-[var(--kura-border)] bg-[var(--kura-bg-light)] px-3 py-2 text-sm text-[var(--kura-text)] outline-none transition-colors placeholder:text-[var(--kura-text-secondary)] focus-visible:border-[var(--kura-primary)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
