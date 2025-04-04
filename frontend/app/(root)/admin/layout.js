"use client";
import "@/app/styles/globals.css";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Import usePathname
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  return (
    <div className="w-full h-screen flex overflow-hidden text-lg">
      {/* Sticky Sidebar Navigation */}
      <nav className="w-64 h-fit ml-10 rounded-md flex flex-col gap-10 mt-5 p-4 bg-gray-800 text-white sticky top-0 py-8">
        <div className="w-full h-fit pb-3 border-b">
          <Link
            href="/admin/panel"
            className={`rounded-md flex w-full px-2 py-2 ${
              pathname === "/admin/panel" ? "bg-blue-500" : "hover:bg-gray-600"
            }`}
          >
            Admin Panel
          </Link>
        </div>
        <div className="w-full h-fit pb-3 border-b">
          <Link
            href="/admin/users"
            className={`rounded-md flex w-full px-2 py-2 ${
              pathname === "/admin/users" ? "bg-blue-500" : "hover:bg-gray-600"
            }`}
          >
            View Registered Users
          </Link>
        </div>
        <div className="w-full h-fit pb-3 border-b">
          <Link
            href="/admin/blacklisted"
            className={`rounded-md flex w-full px-2 py-2 ${
              pathname === "/admin/blacklisted" ? "bg-blue-500" : "hover:bg-gray-600"
            }`}
          >
            View Blacklisted Users
          </Link>
        </div>
        <div className="w-full h-fit pb-3 border-b">
          <Link
            href="/admin/transactions"
            className={`rounded-md flex w-full px-2 py-2 ${
              pathname === "/admin/transactions" ? "bg-blue-500" : "hover:bg-gray-600"
            }`}
          >
            Transaction History
          </Link>
        </div>

        {/* Go Back Button */}
        <button
          onClick={() => router.back()}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-md"
        >
          Go Back
        </button>
      </nav>

      {/* Scrollable Content Section */}
      <section className="flex-1 h-full w-full overflow-y-auto p-4">
        {children}
      </section>
    </div>
  );
}
