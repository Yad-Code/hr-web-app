import Image from "next/image";
import styles from "@/app/ui/home.module.css";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] text-white">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-light tracking-wide">
          Welcome to our company
        </h1>
        <div className={styles.shape} />

        <button className="rounded-lg bg-[#10B981] px-8 py-2.5 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-[#0ea571]">
          Login
        </button>
      </div>
    </main>
  );
}
