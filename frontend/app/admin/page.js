"use client"; // Required for using client-side interactivity

import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter(); 

  return (

    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ fontSize: "40px" }}>Admin Panel</h1>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" ,marginTop: "20px" }}>
        <button 
          onClick={() => router.push("/admin/users")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}
        >
          View Registered Users
        </button>
        <button 
          onClick={() => router.push("/admin/blacklisted")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#ff0000", color: "white", border: "none", borderRadius: "5px" }}
        >
          View Blacklisted Users
        </button>
        <button 
          onClick={() => router.push("/admin/panel")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#781458", color: "white", border: "none", borderRadius: "5px" }}
        >
          Admin Panel
        </button>
        <button 
          onClick={() => router.push("/admin/transactions")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}
        >
          Transaction History
        </button>
      </nav>
     
      


    </div>
  );
}