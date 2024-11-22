"use server";
import { createSessionClient } from "@/config/appwrite";
import { cookies } from "next/headers";

async function checkAuth() {
  const session = await cookies();
  const sessionCookie = await session.get("appwrite-session");

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
    };
  }
  try {
    const { account } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    return {
      isAuthenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      isAuthenticated: false,
    };
  }
}

export default checkAuth;