"use server";
import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";

async function destroySession() {
  // Retrieve the session cookie
  const cookie = await cookies();
  const sessionCookie = cookie.get("appwrite-session");

  if (!sessionCookie) {
    return {
      error: "No session cookie found",
    };
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);

    // Delete current session
    const res = await account.deleteSession("current");
    // Clear session cookie
    cookie.delete("appwrite-session");

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Error deleting session",
    };
  }
}

export default destroySession;
