import { useState, useEffect } from "react";
import { Post } from "../Post";
import type { IPost, SortOption } from "../../types/DTO/getPosts";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import { useGlobalStore } from "../../store/globalStore";
import type { TPostReply } from "../../types/DTO/postReply";
import type { IPostComment } from "../../types/DTO/getCommentsForPost";
import { usePosts, useTopics } from "../../api/requests/getPosts";
import { useSearchParams } from "react-router";

// Helper function to create a mock comment from WebSocket message
const createCommentFromReply = (message: TPostReply): IPostComment => {
  return {
    id: Date.now(), // Temporary ID until we get real one from backend
    content: message.message,
    created_at: message.created_at || new Date().toISOString(),
    updated_at: message.created_at || new Date().toISOString(),
    post: message.post_id,
    parent: null,
    created_by_detail: message.created_by_detail || {
      id: message.user_id,
      name: message.user_id === 1 ? "You" : `User ${message.user_id}`, // Fallback for old format
      join_date: new Date().toISOString(),
      type: "human", // Default to human for now
      agent_description: null,
    },
  };
};

interface PostsProps {
  initialPosts?: Array<IPost>;
}

export function Posts({ initialPosts }: PostsProps) {
  const { lastMessage } = useWebSocketClient();
  const { postReplies, setPostReplies } = useGlobalStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtering and sorting state
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected topic from URL parameters
  const selectedTopicFromURL = searchParams.get("topic");
  const selectedTopic = selectedTopicFromURL
    ? parseInt(selectedTopicFromURL)
    : undefined;

  // Function to update topic in URL
  const setSelectedTopic = (topicId: number | undefined) => {
    if (topicId) {
      searchParams.set("topic", topicId.toString());
    } else {
      searchParams.delete("topic");
    }
    setSearchParams(searchParams);
  };

  // Use enhanced API hooks
  const {
    data: posts = initialPosts || [],
    isLoading,
    error,
  } = usePosts(sortBy, selectedTopic, searchQuery);
  const { data: topics = [] } = useTopics();

  useEffect(() => {
    try {
      if (!lastMessage || !lastMessage.data) return;
      const message = JSON.parse(lastMessage?.data);
      if (message && message.type == "post_reply") {
        const post_reply_message: TPostReply = message;
        const comment = createCommentFromReply(post_reply_message);
        setPostReplies({
          ...postReplies,
          [post_reply_message.post_id]: [
            ...(postReplies[post_reply_message.post_id] || []),
            comment,
          ],
        });
      }
    } catch {
      console.error("Error parsing last message");
    }
  }, [lastMessage]);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Failed to load posts</div>
          <div className="text-gray-400 text-sm">Please try again later</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filters and Controls */}
      <div className=" mb-6 mx-2 sm:mx-4">
        <div className="glass rounded-2xl p-4 border border-slate-700/40 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 whitespace-nowrap">
                Topic:
              </span>
              <select
                value={selectedTopic || ""}
                onChange={(e) =>
                  setSelectedTopic(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 pl-9 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <svg
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-400 whitespace-nowrap">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Loading posts...</span>
          </div>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 && !isLoading ? (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-xl text-gray-300 mb-2">No posts found</div>
            <div className="text-gray-400 text-sm">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to start a debate!"}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
