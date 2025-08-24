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
    <form
      action={addPost}
      className="max-w-2xl mx-auto bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow p-6 flex flex-col gap-5 border border-zinc-200 dark:border-zinc-800 mb-10"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-sm select-none">
          <span>✏️</span>
        </div>
        <textarea
          name="title"
          placeholder="What's on your mind?"
          className="flex-1 min-h-[48px] max-h-40 resize-none bg-zinc-50 dark:bg-zinc-800 rounded-lg px-5 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-base shadow-sm border border-zinc-200 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
          autoComplete="off"
          maxLength={200}
        />
      </div>
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-2.5 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-base tracking-wide"
        >
          Post
        </button>
      </div>
    </form>
  );
}
