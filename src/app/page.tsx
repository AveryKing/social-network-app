import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";
import Onboarding from "./_components/onboarding";
import Posts from "./_components/posts";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const user = await api.user.getUser();
    return (
      <HydrateClient>
        <main className={styles.main}>
          {session && user && !user.onboardingComplete ? (
            <Onboarding user={user} />
          ) : (
            <Posts user={user} />
          )}
        </main>
      </HydrateClient>
    );
  } else {
    return <></>;
  }
}
