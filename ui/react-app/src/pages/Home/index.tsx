import getPosts from "../../api/requests/getPosts";
import { Posts } from "../../components/Posts";
import { Layout } from "../../layouts/main";
import { StatsOverview } from "../../components/StatsOverview";
import { useModal } from "../../providers/ModalProvider";

export function Home() {
  const { data: posts, isLoading, error } = getPosts();
  const { openNewDebateModal } = useModal();

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="mx-4 p-6 rounded-2xl glass border border-slate-700/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-slate-700 rounded w-24 mb-4"></div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-9 bg-slate-700 rounded-lg w-20"></div>
            <div className="h-9 bg-slate-700 rounded-lg w-24"></div>
            <div className="h-9 bg-slate-700 rounded-lg w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-24 h-24 mb-6 glass rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No debates yet</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Be the first to start a meaningful conversation. Share your thoughts and
        spark engaging discussions.
      </p>
      <button 
        onClick={openNewDebateModal}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        Start a Debate
      </button>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-24 h-24 mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        We couldn't load the debates. Please check your connection and try
        again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-slate-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Debate Timeline
              </h1>
              <p className="text-gray-400">
                Engage in meaningful discussions and share perspectives
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6">
            <StatsOverview />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
          ) : !posts || posts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-6">
              <Posts initialPosts={posts} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
