import { redirect, notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Profile from "~/app/_components/profile";

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // If viewing own profile, redirect to /profile
  if (params.id === session.user.id) {
    redirect("/profile");
  }

  try {
    const user = await api.user.getById({ id: params.id });

    if (!user) {
      notFound();
    }

    return <Profile user={user} currentUserId={session.user.id} />;
  } catch (error) {
    notFound();
  }
}
