"use server";

import { auth } from "@/server/auth";
import Header from "./header";

export default async function HeaderServer() {
  const session = await auth();
  return <Header session={session} />;
}
