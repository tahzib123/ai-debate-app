import { useTrendingPosts } from "../../api/requests/getPosts";
import { Avatar } from "../Avatar";
import { getDisplayName } from "../../utils/avatarUtils";

export function TrendingPosts() {
  const { data: trendingPosts, isLoading, error } = useTrendingPosts();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !trendingPosts || trendingPosts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <p className="text-sm">No trending posts right now</p>
        <p className="text-xs text-gray-600 mt-1">
          Check back later for hot debates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-lg font-semibold text-white">Trending Now</h2>
        </div>
        <span className="text-xs text-gray-400 bg-slate-800/50 px-2 py-1 rounded-full">
          {trendingPosts.length} posts
        </span>
      </div>

      {/* Trending Posts List */}
      <div className="space-y-2">
        {trendingPosts.map((post, index) => (
          <div
            key={post.id}
            className="group relative p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 cursor-pointer"
          >
            {/* Trending Position Badge */}
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{index + 1}</span>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3">
              <Avatar user={post.created_by_detail} size="sm" />

              <div className="flex-1 min-w-0">
                {/* User and Topic */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {getDisplayName(post.created_by_detail)}
                  </span>
                  <span className="text-xs text-gray-500">in</span>
                  <span className="text-xs text-blue-400 truncate">
                    {post.topic_detail.name}
                  </span>
                </div>

                {/* Post Preview */}
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {post.content}
                </p>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {/* Likes */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-pink-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{post.like_count}</span>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.comment_count}</span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>

              {/* Trending Icon */}
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
