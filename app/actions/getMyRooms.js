"use server";

import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

async function getMyRooms() {
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

    return rooms;
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    redirect("/error");
  }
}

export default getMyRooms;
