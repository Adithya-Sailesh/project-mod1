import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { vehicleNumber } = await req.json();

    if (!vehicleNumber) {
      return NextResponse.json({ error: "Vehicle number required" }, { status: 400 });
    }

    // Query the users collection to find the document by vehicleNumber field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("vehicleNumber", "==", vehicleNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get user document
    let userDoc = querySnapshot.docs[0];

    // ✅ Update user's blacklisted status to false and reset failed attempts
    await updateDoc(userDoc.ref, {
      blacklisted: false,
      failedAttempts: 0
    });

    // ✅ Remove from blacklisted_vehicles collection (if exists)
    await deleteDoc(doc(db, "blacklisted_vehicles", vehicleNumber));

    return NextResponse.json(
      { message: "User removed from blacklist successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing user from blacklist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
