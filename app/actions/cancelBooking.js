"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";
import { revalidateRoomsPath } from "./getAllRooms";

async function cancelBooking(bookingId) {
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
        error: "You must be logged in to cancel a booking",
      };
    }
    const userId = user.id;

    // Get the booking
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // Check if booking belongs to current user
    if (booking.user_id !== userId) {
      return {
        error: "You are not allowed to cancel this booking",
      };
    }

    // Delete booking
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );
    revalidateRoomsPath("/bookings", "layout");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return {
      error: "Failed to cancel booking",
    };
  }
}

export default cancelBooking;
