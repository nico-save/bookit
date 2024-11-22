"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import checkAuth from "./checkAuth";

async function getMyBookings() {
  const cookieStore = await cookies();
  const sessionCookie = await cookieStore.get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Get user's id
    const { user } = await checkAuth();
    if (!user) {
      return {
        error: "You must be logged in to view bookings",
      };
    }

    const userId = user.id;

    //Fetch user's bookings
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal("user_id", userId)]
    );

    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return {
      error: "Failed to fetch user bookings",
    };
  }
}

export default getMyBookings;
