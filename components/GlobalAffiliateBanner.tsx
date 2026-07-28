import { ShoppingBag } from "lucide-react";

export default function AffiliateDisclaimer() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 mb-6 print:hidden">
      <ShoppingBag className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-700">Transparency Note: </span> 
        Some of the tools and games recommended below include affiliate links. If you buy through them, we earn a small commission that helps keep this platform running. <span className="italic">As an Amazon Associate, we earn from qualifying purchases.</span>
      </div>
    </div>
  );
}