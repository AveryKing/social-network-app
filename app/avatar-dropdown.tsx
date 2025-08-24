"use client";
import { useState, useRef, useEffect } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";

export default function AvatarDropdown({ session, profile }: { session: Session, profile: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full border-2 border-blue-400 shadow focus:outline-none focus:ring-2 focus:ring-blue-400/60"
      >
        <img
          src={profile?.avatar_url || "/default-avatar.png"}
          alt={profile?.name || session.user.email}
          className="w-full h-full object-cover rounded-full"
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50">
          <a href="/profile" className="block px-4 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Profile</a>
          <a href="/settings" className="block px-4 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Settings</a>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full text-left px-4 py-2 text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">Logout</button>
          </form>
        </div>
      )}
    </div>
  );
}
