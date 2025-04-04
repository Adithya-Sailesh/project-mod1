"use client";
import "@/app/styles/globals.css";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Import usePathname
import Link from "next/link";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  return (
    <div className="w-full h-screen flex overflow-hidden text-lg">
      {/* Scrollable Content Section */}
      <section className="flex-1 h-full w-full overflow-y-auto p-4">
        {children}
      </section>
    </div>
  );
}
