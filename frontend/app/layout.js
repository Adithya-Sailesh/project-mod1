"use client";
import "@/app/styles/globals.css";
import Link from "next/link";
import Image from "next/image";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";



export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white font-barlow tracking-wide h-screen w-screen overflow-hidden">
        <Toaster/>
        <AuthProvider>
          <Navbar />
          <main className="flex-center">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate Navbar Component for cleaner structure
function Navbar() {
  const { user, logout } = useAuth(); // Get user details & logout function

  return (
    <nav className="sticky top-0 w-[95%] mt-5 bg-gray-800 px-10 z-10 rounded-md mx-12">
      <div className="flex flex-row items-center justify-between h-fit w-full max-w-screen m-auto">
        {/* Logo */}
        <div className="h-[100px] flex flex-row">
          <Link href="/" className="flex-center">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </Link>
          <Link href="/" className="h-full flex-center">
            <p className="text-white text-4xl mb-5">AUTO-ID</p>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center justify-center h-full space-x-12 text-lg">
          <Link href="/" className="hover:text-blue-500">Home</Link>

          {/* Show "User" if user is not admin, else show "Admin" */}
          {user ? (
            user.isAdmin ? (
              <Link href="/admin" className="hover:text-blue-500">Admin</Link>
            ) : (
              <Link href="/user" className="hover:text-blue-500">User</Link>
            )
          ) : null}

          {/* Show Login/Register only if user is NOT logged in */}
          {!user ? (
            <>
              <Link href="/login" className="hover:text-blue-500">Login</Link>
            </>
          ) : (
            <button onClick={logout} className="hover:text-red-500">
              Sign Out
            </button>
          )}
        </ul>
      </div>
    </nav>
  );
}
