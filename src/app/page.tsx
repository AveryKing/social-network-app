import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";
import Onboarding from "./_components/onboarding";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const user = await api.user.getUser();
    return (
      <HydrateClient>
        <main className={styles.main}>
          {session && user && !user.onboardingComplete && (
            <Onboarding user={user} />
          )}
        </main>
      </HydrateClient>
    );
  } else {
    return <></>;
  }
}
