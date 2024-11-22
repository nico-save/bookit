"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ID } from "node-appwrite";
import checkAuth from "./checkAuth";
import { revalidateRoomsPath } from "./getAllRooms";
import checkRoomAvailability from "./checkRoomAvailability";

async function bookRoom(previousState, formData) {
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
        error: "You must be logged in to book a room",
      };
    }
    // Extract date and time from the formData
    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");
    const roomId = formData.get("room_id");
    // Combine date and time to ISO 8601 format
    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    // Check if room is available
    const isAvailable = await checkRoomAvailability(
      roomId,
      checkInDateTime,
      checkOutDateTime
    );
    if (!isAvailable) {
      return {
        error: "This room is already booked for the selected time",
      };
    }

    const bookingData = {
      check_in: checkInDateTime,
      check_out: checkOutDateTime,
      user_id: user.id,
      room_id: roomId,
    };

    // Create booking
    const newBooking = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      bookingData
    );
    revalidateRoomsPath("/bookings", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to book room", error);
    return {
      error: "Something went wrong booking the room",
    };
  }
}

export default bookRoom;
