import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show/hide search results based on query
  useEffect(() => {
    setShowSearchResults(searchQuery.length > 0);
  }, [searchQuery]);

  const isActive = (path: string) => location.pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      // You can add navigation to a dedicated search page here if needed
    }
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="navbar glass border-b border-slate-700/50 shadow-lg">
        <div className="flex-1">
          <Link
            to="/"
            className="ml-2 text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
          >
            🗣️ Debate AI
          </Link>
        </div>

        <div className="flex gap-4 items-center mr-2">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-white">User Name</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-blue-500/30 transition-all duration-200"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-10 rounded-full ring-2 ring-slate-700/50">
                  <img
                    alt="User avatar"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    className="rounded-full"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className={`menu menu-sm dropdown-content glass rounded-xl z-[1] mt-3 w-64 p-3 shadow-xl border border-slate-700/30 animate-scale-in ${
                  isProfileOpen ? "block" : ""
                }`}
              >
                <li className="mb-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                    <img
                      src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      alt="User"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-white">User Name</div>
                      <div className="text-xs text-gray-400">
                        user@example.com
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>
                </li>
                <li>
                  <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </a>
                </li>
                <div className="divider my-2"></div>
                <li>
                  <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors text-red-300">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
