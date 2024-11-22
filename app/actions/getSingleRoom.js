"use server";

import { createAdminClient } from "@/config/appwrite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getSingleRoom(id) {
  const { databases } = await createAdminClient();

  try {
    const room = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      id
    );

    return room;
  } catch (error) {
    console.error("Error fetching rooms", error);
    redirect("/error");
  }
}

export async function revalidateRoomsPath() {
  await revalidatePath("/app/roomsapp/rooms");
}
