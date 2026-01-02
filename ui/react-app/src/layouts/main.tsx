import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { NewDebateModal } from "../components/NewDebateModal";
import { useModal } from "../providers/ModalProvider";
import { navigationHeight } from "../constants";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const { isNewDebateModalOpen, closeNewDebateModal } = useModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex relative">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } fixed lg:static lg:flex z-50 lg:z-auto w-80 lg:w-80 transition-transform duration-300 ease-in-out lg:transition-all`}
        >
          <div
            className="h-full lg:h-auto"
            style={{
              height: `calc(100vh - ${navigationHeight}px)`,
              maxHeight: `calc(100vh - ${navigationHeight}px)`,
            }}
          >
            <Sidebar />
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed left-4 top-20 z-[60] p-2 glass border border-slate-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 shadow-lg lg:hidden"
          title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isSidebarOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Main Content */}
        <main
          className="flex-1 w-full lg:w-auto overflow-hidden transition-all duration-300"
          style={{
            height: `calc(100vh - ${navigationHeight}px)`,
            maxHeight: `calc(100vh - ${navigationHeight}px)`,
            marginLeft: isSidebarOpen ? "0" : "0",
          }}
        >
          <div className="h-full relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25px 25px, white 2px, transparent 0)",
                  backgroundSize: "50px 50px",
                }}
              ></div>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewDebateModal 
        isOpen={isNewDebateModalOpen} 
        onClose={closeNewDebateModal} 
      />
    </div>
  );
}
