"use client";
import { useState, useRef, useEffect } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";

export default function AvatarDropdownClient({
  avatarUrl,
  session,
}: {
  avatarUrl: string | null;
  session: Session | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    const { createClientComponentClient } = await import(
      "@supabase/auth-helpers-nextjs"
    );
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!session) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 bg-white dark:bg-zinc-900"
        aria-label="Open user menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-lg font-bold text-blue-500">
            ?
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-2 z-50">
          <a
            href="/profile"
            className="block px-4 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Profile
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Settings
          </a>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
