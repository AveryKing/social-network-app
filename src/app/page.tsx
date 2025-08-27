import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";
import Onboarding from "./_components/onboarding";
import Posts from "./_components/posts";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <></>;
  }

  const userData = await api.user.getUser();

  if (!userData) {
    return <></>;
  }

  return (
    <main className={styles.main}>
      {!userData.onboardingComplete ? (
        <Onboarding user={userData} />
      ) : (
        <Posts user={userData} />
      )}
    </main>
  );
}
