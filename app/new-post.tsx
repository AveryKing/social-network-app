export default function NewPost() {
  const addPost = async () => {
    "use server";
    console.log("submitted");
  };

  return (
    <form action={addPost}>
      <input name="title" />
    </form>
  );
}
