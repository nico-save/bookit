"use server";

import { createAdminClient } from "@/config/appwrite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllRooms() {
  try {
    const { databases } = await createAdminClient();
    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS
    );

    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    redirect("/error");
  }
}

export async function revalidateRoomsPath() {
  await revalidatePath("/");
}
