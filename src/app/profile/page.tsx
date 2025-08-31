import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Profile from "~/app/_components/profile";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = await api.user.getCurrent();

  if (!user) {
    redirect("/api/auth/signin");
  }

  return <Profile user={user} />;
}
