import { ShieldCheck } from "lucide-react";

export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-slate-900 text-white p-4 rounded-2xl shadow-xs">
      <ShieldCheck className="w-5 h-5 text-emerald-400" />
      <h2 className="text-sm font-bold tracking-wide">{title}</h2>
    </div>
  );
}
