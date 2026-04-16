import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/queries/get-session-user";

export async function requireUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
