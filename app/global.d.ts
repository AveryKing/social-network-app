declare global {
  type PostWithRelations =
    import("../lib/database.types").Database["public"]["Tables"]["posts"]["Row"] & {
      profiles: any;
      likes: { user_id: string }[];
    };
}
export {};
import { Database as db } from "@/lib/database.types";

declare global {
  type Database = db;
}
