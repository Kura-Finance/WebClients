"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wide dashboard pages (Home, Treasury, Team, Report, …). */
export const PAGE_SHELL =
  "mx-auto w-full max-w-6xl px-6 pb-24 pt-8 sm:px-8";

/** Empty / gate states before a feature is ready. */
export const PAGE_SHELL_NARROW =
  "mx-auto w-full max-w-3xl px-6 pb-24 pt-8 sm:px-8";

/** Transfer / Add Money wizards. */
export const PAGE_SHELL_WIZARD =
  "mx-auto w-full max-w-lg px-6 pb-24 pt-8 sm:px-8";

export const PANEL =
  "rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)]";

export function DashboardPage({
  children,
  className,
  variant = "wide",
}: {
  children: ReactNode;
  className?: string;
  variant?: "wide" | "narrow" | "wizard";
}) {
  const shell =
    variant === "narrow"
      ? PAGE_SHELL_NARROW
      : variant === "wizard"
        ? PAGE_SHELL_WIZARD
        : PAGE_SHELL;
  return <div className={cn(shell, className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--kura-text-secondary)]">
          {eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {typeof title === "string" ? (
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--kura-text)]">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm text-[var(--kura-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function PageAlert({
  variant = "warning",
  children,
  className,
}: {
  variant?: "warning" | "success" | "error";
  children: ReactNode;
  className?: string;
}) {
  const styles =
    variant === "success"
      ? "border-[var(--kura-success-border)] bg-[var(--kura-success-bg)] text-[var(--kura-success-fg)]"
      : variant === "error"
        ? "border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] text-[var(--kura-error-fg)]"
        : "border-[var(--kura-warning-border)] bg-[var(--kura-warning-bg)] text-[var(--kura-warning-fg)]";
  return (
    <div
      className={cn(
        "mb-6 rounded-xl border px-4 py-3 text-sm",
        styles,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  /** sm=p-4, md=p-5, lg=p-6, none=bare shell for lists */
  padding?: "sm" | "md" | "lg" | "none";
}) {
  const pad =
    padding === "sm"
      ? "p-4"
      : padding === "lg"
        ? "p-6"
        : padding === "none"
          ? ""
          : "p-5";
  return <div className={cn(PANEL, pad, className)}>{children}</div>;
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-start justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[var(--kura-text)]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--kura-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyGate({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <DashboardPage variant="narrow">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {action}
    </DashboardPage>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-[var(--kura-text)] text-[var(--kura-bg)]"
          : "border border-[var(--kura-border)] bg-[var(--kura-surface)] text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
