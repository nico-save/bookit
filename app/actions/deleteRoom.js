"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import { revalidateRoomsPath } from "./getAllRooms";

async function deleteRoom(roomId) {
  const cookieStore = await cookies();
  const sessionCookie = await cookieStore.get("appwrite-session");
  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const { databases, account } = await createSessionClient(
      sessionCookie.value
    );

    // Get user's id
    const user = await account.get();
    const userId = user.$id;

    //Fetch user's rooms
    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal("user_id", userId)]
    );
    // Find room to delete
    const roomToDelete = rooms.find((room) => room.$id === roomId);
    //Delete the rool
    if (roomToDelete) {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
        roomToDelete.$id
      );

      // Revalidate my rooms and all rooms
      revalidateRoomsPath("/rooms/my", "layout");
      revalidateRoomsPath("/", "layout");
      return {
        success: true,
      };
    } else {
      return {
        error: "Room not found",
      };
    }
  } catch (error) {
    console.error("Failed to delete room", error);
    return {
      error: "Room not found",
    };
  }
}

export default deleteRoom;
