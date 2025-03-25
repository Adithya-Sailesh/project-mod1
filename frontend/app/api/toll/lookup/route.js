import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
export async function GET(req) {
  const url = new URL(req.url);
  const vehicleNumber = url.searchParams.get("number");

  if (!vehicleNumber) {
    return NextResponse.json({ error: "Vehicle number required" }, { status: 400 });
  }

  const q = query(collection(db, "users"), where("vehicleNumber", "==", vehicleNumber));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }

  const vehicleData = querySnapshot.docs[0].data();
  return NextResponse.json({
    exists: true,
    owner: vehicleData.name,
    balance: vehicleData.balance,
  });
}
