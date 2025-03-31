import "../globals.css"
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "AUTO-ID: Smart Toll Management System",
  description: "A Smart Toll Management System using AI and ML",
};

export default function AdminLayout({ children }) {
  return (      
    
    <div className="w-full flex flex-row ml-20">
    
        <nav className="flex-start gap-2">
        <div className="w-full flex-center text-red-400 text-lg"><h2>Admin Actions</h2></div>
        <Link href="/admin/users"
          className="w-60 rounded-md hover:bg-gray-600 px-2 py-2"
        >
          View Registered Users
        </Link>
        <Link href="/admin/blacklisted"
          className="w-60 rounded-md hover:bg-gray-600 px-2 py-2"
        >
          View Blacklisted Users
        </Link>
        <Link href="/admin/panel"
          className="w-60 rounded-md hover:bg-gray-600 px-2 py-2"
        >
          Admin Panel
        </Link>
        <Link href="/admin/transactions"
          className="w-60 rounded-md hover:bg-gray-600 px-2 py-2"
        >
          Transaction History
        </Link>
      </nav>
        <div className="w-full flex-center">
          {children} {/* Ensure children are inside AuthProvider */}
        </div>
     </div>
        
  );
}
