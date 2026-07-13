import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { lusitana } from "./fonts";

export default function YadLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row items-center gap-2 leading-none text-white`}>
      {/* Icon with a subtle rotation and clean layout alignment */}
      <GlobeAltIcon className="h-8 w-8 text-[#2563eb] rotate-15 sm:h-9 sm:w-9" />
      
      {/* Refined typography weight and sizing */}
      <p className="text-2xl font-semibold tracking-tight sm:text-3xl text-zinc-100">
        Yad<span className="text-[#2563eb]">.</span>
      </p>
    </div>
  );
}