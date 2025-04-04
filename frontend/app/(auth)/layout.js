import "@/app/styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "AUTO-ID: Smart Toll Management System",
  description: "A Smart Toll Management System using AI and ML",
};

export default function Auth({ children }) {
  return (
    
          <main className="flex-center">
            {children} {/* Ensure children are inside AuthProvider */}
          </main>
        
  );
}
