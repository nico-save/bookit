"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import checkAuth from "./checkAuth";
import { DateTime } from "luxon";

// Convert a date string to a Luxon DateTime object in UTC
function toUTCDateTime(dateString) {
  return DateTime.fromISO(dateString, { zone: "utc" }).toUTC();
}

// Check for overlapping date ranges
function dateRangesOverlap(checkInA, checkOutA, checkInB, checkOutB) {
  return checkInA < checkOutB && checkOutA > checkInB;
}

async function getUnavailableDateTimes(roomId, checkIn, checkOut) {
  const cookieStore = await cookies();
  const sessionCookie = await cookieStore.get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const checkInDateTime = toUTCDateTime(checkIn);
    const checkOutDateTime = toUTCDateTime(checkOut);

    //Fetch all bookings for a given room
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal("room_id", roomId)]
    );

    const relevantReservations = reservations.filter((reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const targetDate = new Date(checkOutDate);

      // Vérifie si la date sélectionnée est entre checkIn et checkOut
      return targetDate >= checkIn && targetDate <= checkOut;
    });

    // Extraire les heures indisponibles
    const unavailableTimes = relevantReservations.map((reservation) => {
      return {
        start: reservation.checkInTime,
        end: reservation.checkOutTime,
      };
    });

    return unavailableTimes;
  } catch (error) {
    console.error("Error fetching unavailable times:", error);
    return [];
  }
}

export default getUnavailableDateTimes;
