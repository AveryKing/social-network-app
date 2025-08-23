import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Define the Database type with the posts table

export default function NewPost() {
  const addPost = async (formData: FormData) => {
    "use server";
    const title = formData.get("title")?.toString() ?? "";
    const supabase = createServerComponentClient<any>({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("posts").insert([{ title, user_id: user.id }]);
      revalidatePath("/"); // Revalidate the homepage (update path as needed)
    }
  };

  return (
    <form action={addPost}>
      <input name="title" />
    </form>
  );
}
