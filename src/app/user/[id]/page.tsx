import { redirect, notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Profile from "~/app/_components/profile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // If viewing own profile, redirect to /profile
  if (id === session.user.id) {
    redirect("/profile");
  }

  try {
    const user = await api.user.getById({ id });

    if (!user) {
      notFound();
    }

    return <Profile user={user} currentUserId={session.user.id} />;
  } catch (error) {
    notFound();
  }
}
