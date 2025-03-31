import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "AUTO-ID: Smart Toll Management System",
  description: "A Smart Toll Management System using AI and ML",
};

export default function RootLayout({ children }) {
  return (      
    <html lang="en">
      <body className={`antialiased bg-black`}>
        <nav className="w-screen px-40">
          
          <div className="flex flex-row items-center justify-between p-x pt-4 w-full m-auto">
            <div className="h-[100px] flex flex-row">
              <Link href="/" className="flex-center">
                <Image src="/logo.png" alt="Logo" width={100} height={100} />
              </Link>
              <Link href="/" className="h-full flex-center">
                <p className="text-white text-4xl mb-5">AUTO-ID</p>
              </Link>
            </div>
            
            <ul className="flex space-x-12 text-lg">
              <Link href="/" className="hover:text-blue-500">Home</Link>
              <Link href="/login" className="hover:text-blue-500">Login</Link>
              <Link href="/register" className="hover:text-blue-500">Register</Link>
              <Link href="/user" className="hover:text-blue-500">User</Link>
              <Link href="/admin" className="hover:text-blue-500">Admin</Link>
            </ul>
          </div>
        </nav>
        <AuthProvider>
          <main className="flex-center">
          {children} {/* Ensure children are inside AuthProvider */}
          </main>
        </AuthProvider>
        
      </body>
    </html>
  );
}
