import AvatarDropdownServer from "./avatar-dropdown-server";

export default function TopBar() {
  return (
    <header className="w-full bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 shadow-sm fixed top-0 left-0 z-40 backdrop-blur">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight select-none">
            Social
          </span>
          <span className="text-2xl font-extrabold text-purple-500 tracking-tight select-none">
            Net
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-zinc-700 dark:text-zinc-200 text-base font-medium">
            <a href="/" className="hover:text-blue-500 transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Explore
            </a>
            <a href="/profile" className="hover:text-blue-500 transition-colors">
              Profile
            </a>
          </nav>
          <div className="ml-4">
            <AvatarDropdownServer />
          </div>
        </div>
      </div>
    </header>
  );
}
