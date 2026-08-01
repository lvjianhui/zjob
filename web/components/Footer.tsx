import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-10">
      <div className="max-w-[960px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© 2026 真职 Zjob</p>
        <nav className="flex items-center gap-6">
          <Link
            href="/compare"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            对比
          </Link>
        </nav>
      </div>
    </footer>
  );
}
