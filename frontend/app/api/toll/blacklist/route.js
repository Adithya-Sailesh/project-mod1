import { db } from "../../../firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, increment } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { vehicleNumber } = await req.json();

    if (!vehicleNumber) {
      return NextResponse.json({ error: "Vehicle number required" }, { status: 400 });
    }

    // Query the "users" collection to find the document by vehicleNumber field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("vehicleNumber", "==", vehicleNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Get user document
    let vehicleDoc = querySnapshot.docs[0];
    let vehicleData = vehicleDoc.data();
    let failedAttempts = vehicleData.failedAttempts || 0;
    let blacklistCount = vehicleData.blacklistCount || 0; // New field for tracking blacklist count
    
    // Check if already blacklisted
    if (vehicleData.blacklisted) {
      return NextResponse.json({ message: "User is already blacklisted" }, { status: 200 });
    }

    // If failed attempts exceed 2, blacklist the user
    if (failedAttempts >= 2) {
      await setDoc(doc(db, "blacklisted_vehicles", vehicleNumber), { blacklisted: true });

      // ✅ Update the "users" collection: Add blacklisted status & reset failed attempts
      await updateDoc(vehicleDoc.ref, {
        blacklisted: true,
        failedAttempts: 0, // Reset after blacklisting
        blacklistCount: blacklistCount + 1 // Increment blacklist count for this user
      });

      return NextResponse.json(
        { message: "User blacklisted due to multiple failures" },
        { status: 200 }
      );
    }

    // Increase failed attempts count
    await updateDoc(vehicleDoc.ref, { failedAttempts: failedAttempts + 1 });

    return NextResponse.json(
      { message: `Failed attempt recorded (${failedAttempts + 1}/3)` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing blacklist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
