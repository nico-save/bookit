"use server";
import { createAdminClient } from "@/config/appwrite";
import { cookies } from "next/headers";

async function createSession(previousState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return {
      error: "Please fill out all fields",
    };
  }

  // Get Account Instance
  const { account } = await createAdminClient();
  try {
    // Generate a session
    const cookieStore = await cookies();
    const session = await account.createEmailPasswordSession(email, password);

    // Create cookiesession);
    cookieStore.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      // expires: new Date(session.expires),
      path: "/",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log("Authentication error: " + error);
    return {
      error: "Invalid Credentials",
    };
  }
}

export default createSession;
