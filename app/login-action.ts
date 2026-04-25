"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const validUsername = process.env.AUTH_USERNAME || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "Admin@123";
  const authSecret =
    process.env.AUTH_SECRET || "my-super-secret-login-token";

  if (username !== validUsername || password !== validPassword) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();

  cookieStore.set("geo_pm_auth", authSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}