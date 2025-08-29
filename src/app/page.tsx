import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";
import Onboarding from "./_components/onboarding";
import Posts from "./_components/posts";
import { Suspense } from "react";

// Loading component
function Loading() {
  return (
    <main className={styles.main}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          color: "white",
        }}
      >
        <div>Loading...</div>
      </div>
    </main>
  );
}

// Error component
function ErrorState({ message }: { message: string }) {
  return (
    <main className={styles.main}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          color: "white",
        }}
      >
        <div>Error: {message}</div>
      </div>
    </main>
  );
}

// Unauthenticated component
function Unauthenticated() {
  return (
    <main className={styles.main}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          color: "white",
        }}
      >
        <div>Please sign in to continue</div>
      </div>
    </main>
  );
}

export default async function Home() {
  try {
    const session = await auth();

    if (!session?.user) {
      return <Unauthenticated />;
    }

    const userData = await api.user.getUser();

    if (!userData) {
      return <ErrorState message="User data not found" />;
    }

    return (
      <main className={styles.main}>
        <Suspense fallback={<Loading />}>
          {!userData.onboardingComplete ? (
            <Onboarding user={userData} />
          ) : (
            <Posts user={userData} />
          )}
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error("Error in Home component:", error);
    return <ErrorState message="Something went wrong. Please try again." />;
  }
}
