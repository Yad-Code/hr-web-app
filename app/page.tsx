import Link from "next/link";
import Image from "next/image";
import styles from "@/app/ui/home.module.css";
import { lusitana } from "@/app/ui/fonts";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import YadLogo from "@/app/ui/yad-logo"; // Imported your custom logo component

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-dark-bg text-white antialiased">
      {/* PART 1: LEFT SIDE (Full Height Company Photo) */}
      <section className="relative h-[40vh] w-full lg:h-screen lg:w-1/2 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800">
        <Image
          src="/company-photo.jpg" // Replace with your actual image path in the public folder
          alt="Yad Corp Workspace"
          fill
          className="object-cover opacity-70"
          priority
        />
        {/* Subtle dark overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-r from-transparent to-dark-bg/30" />
      </section>

      {/* RIGHT SIDE CONTENT CONTAINER (Split into Upper Intro and Bottom Elements) */}
      <div className="flex flex-col justify-between flex-1 p-8 md:p-16 lg:p-24 h-auto lg:h-screen">
        {/* PART 2: UPPER PART (Introduction with Logo) */}
        <header className="flex flex-col gap-4 max-w-xl">
          <div className="flex flex-wrap items-baseline gap-4 mb-2">
            <p
              className={`${lusitana.className} text-xl md:text-2xl text-zinc-400 leading-relaxed`}
            >
              <strong className="text-white font-medium block text-3xl md:text-4xl tracking-tight">
                Welcome to Yad Corp.
              </strong>
            </p>
            {/* Logo injected directly here to line up beautifully on the right */}
            <div className="transform scale-75 origin-left md:scale-90">
              <YadLogo />
            </div>
          </div>

          <p className={`${lusitana.className} text-xl text-zinc-400 leading-relaxed`}>
            This is the company you are looking for.
          </p>

          <h1 className="text-lg md:text-xl font-light tracking-wider text-zinc-400 uppercase mt-2">
            Enterprise Portal
          </h1>
        </header>

        {/* PART 3: BOTTOM PART (Example Image/Shape & Action Button) */}
        <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-zinc-800/60 pt-8 mt-12">
          {/* Example Shape/Visual element on the left side of the bottom row */}
          <div className="flex items-center gap-4">
            <div className={`${styles.shape} opacity-90 scale-90`} />
            <span className="text-xs tracking-widest text-zinc-500 uppercase font-mono">
              System Active
            </span>
          </div>

          {/* Action Button on the right side of the bottom row */}
          <div className="w-full sm:w-auto">
            <Link
              href="/login"
              className="group flex items-center justify-center gap-3 rounded-lg bg-brand-blue px-12 py-4 text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
            >
              <span>Login to Dashboard</span>
              <ArrowRightIcon className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}