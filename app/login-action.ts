"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const validUsername = process.env.AUTH_USERNAME || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "Admin@123";

  console.log("Entered:", username, password);
  console.log("Expected:", validUsername, validPassword);

  if (username !== validUsername || password !== validPassword) {
    console.log("LOGIN FAILED ❌");
    redirect("/login?error=1");
  }

  console.log("LOGIN SUCCESS ✅");

  const cookieStore = await cookies();
  cookieStore.set("geo_pm_auth", "ok", {
    httpOnly: true,
    path: "/",
  });

  redirect("/dashboard");
}