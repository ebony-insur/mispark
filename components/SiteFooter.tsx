import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-slate-900 py-8 px-6 text-center border-t border-slate-800 print:hidden">
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <Link href="/about" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Meet Ebony
        </Link>
        <Link href="/features" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Features
        </Link>
        <Link href="/help" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Help & Best Practices
        </Link>
        <Link href="/privacy" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Privacy & Security
        </Link>
        <Link href="/terms" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Terms of Service
        </Link>
        <a href="mailto:mispark@insursuccess.com" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
          Contact Support
        </a>
      </div>
      <p className="text-slate-600 text-sm font-medium">
        © {new Date().getFullYear()} MiSpark. All rights reserved.
      </p>
    </footer>
  );
}