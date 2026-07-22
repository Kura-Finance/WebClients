import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--kura-border)] py-12 bg-[var(--kura-bg)]">
      <div className="marketing-container flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold text-[var(--kura-text)]">Kura</p>
          <p className="text-xs leading-relaxed text-[var(--kura-text-secondary)]">
            Kura is a fintech product operated by Kura Finance LLC. Kura is not a bank.
            Certain services are provided by third-party partners. Features may vary by
            region and eligibility.
          </p>
          <p className="text-xs text-[var(--kura-text-secondary)]">
            © {new Date().getFullYear()} Kura Finance LLC. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--kura-text-secondary)]">
          <Link href="/" className="hover:text-[var(--kura-text)] transition-colors">
            Log in
          </Link>
          <Link href="/download" className="hover:text-[var(--kura-text)] transition-colors">
            Download
          </Link>
          <a
            href="https://kura-finance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--kura-text)] transition-colors"
          >
            Website
          </a>
          <a
            href="https://kura-finance.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--kura-text)] transition-colors"
          >
            Privacy
          </a>
          <a
            href="https://kura-finance.com/tos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--kura-text)] transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
