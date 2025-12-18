import { useState, useEffect } from "react";
import type { IPost } from "../../types/DTO/getPosts";
import { PostReplies } from "../PostReplys";
import { Avatar } from "../Avatar";
import { getDisplayName } from "../../utils/avatarUtils";
import {
  useToggleReaction,
  useToggleBookmark,
  useTrackView,
} from "../../api/requests/getPosts";

interface PostProps {
  post: IPost;
}

export function Post({ post }: PostProps) {
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(
    post.is_liked ? "like" : post.is_disliked ? "dislike" : null
  );
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [dislikeCount, setDislikeCount] = useState(post.dislike_count);

  const toggleReactionMutation = useToggleReaction();
  const toggleBookmarkMutation = useToggleBookmark();
  const trackViewMutation = useTrackView();

  // Track view when component mounts
  useEffect(() => {
    trackViewMutation.mutate(post.id);
  }, [post.id]);

  const handleReactionClicked = async (value: "like" | "dislike") => {
    const previousReaction = reaction;
    const newReaction = reaction === value ? null : value;

    // Optimistic update
    setReaction(newReaction);

    // Update counts optimistically
    if (previousReaction === "like") {
      setLikeCount((prev) => prev - 1);
    } else if (previousReaction === "dislike") {
      setDislikeCount((prev) => prev - 1);
    }

    if (newReaction === "like") {
      setLikeCount((prev) => prev + 1);
    } else if (newReaction === "dislike") {
      setDislikeCount((prev) => prev + 1);
    }

    try {
      await toggleReactionMutation.mutateAsync({
        postId: post.id,
        type: value,
      });
    } catch (error) {
      // Revert on error
      setReaction(previousReaction);
      if (previousReaction === "like") {
        setLikeCount((prev) => prev + 1);
      } else if (previousReaction === "dislike") {
        setDislikeCount((prev) => prev + 1);
      }

      if (newReaction === "like") {
        setLikeCount((prev) => prev - 1);
      } else if (newReaction === "dislike") {
        setDislikeCount((prev) => prev - 1);
      }
      console.error("Failed to toggle reaction:", error);
    }
  };

  const handleToggleBookmark = async () => {
    const previousBookmark = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      await toggleBookmarkMutation.mutateAsync(post.id);
    } catch (error) {
      // Revert on error
      setIsBookmarked(previousBookmark);
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const timeAgo = new Date(post.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group relative animate-slide-in">
      <div className="relative min-h-[200px] my-4 sm:my-6 mx-2 sm:mx-4 p-4 sm:p-6 rounded-2xl glass border border-slate-700/40 shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.01]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Header */}
        <header className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={post.created_by_detail} size="md" />
            <div>
              <h3 className="font-semibold text-white text-sm">
                {getDisplayName(post.created_by_detail)}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <time>{timeAgo}</time>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="hidden sm:flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  2 min read
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isBookmarked
                  ? "text-yellow-400 bg-yellow-400/20"
                  : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
              }`}
              title="Bookmark"
            >
              <svg
                className="w-4 h-4"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>

            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="More options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Topic Badge */}
        <div className="relative z-10 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {post.topic_detail.name}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 mb-6">
          <div className="prose prose-gray prose-invert max-w-none">
            <p className="text-gray-100 leading-relaxed text-sm sm:text-base">
              {post.content}
            </p>
          </div>
        </div>

        {/* Engagement Actions */}
        <footer className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-slate-700/50">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Like Button */}
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                reaction === "like"
                  ? "text-green-400 bg-green-500/20 border border-green-500/30"
                  : "text-gray-300 hover:text-green-400 hover:bg-green-500/10 border border-transparent"
              }`}
              onClick={() => handleReactionClicked("like")}
            >
              <svg
                className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-200 ${
                  reaction === "like" ? "scale-110" : ""
                }`}
                fill={reaction === "like" ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span className="hidden sm:inline">Like</span>
              {likeCount > 0 && (
                <span className="text-xs opacity-75 bg-green-500/20 rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center">
                  {likeCount}
                </span>
              )}
            </button>

            {/* Dislike Button */}
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                reaction === "dislike"
                  ? "text-red-400 bg-red-500/20 border border-red-500/30"
                  : "text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
              }`}
              onClick={() => handleReactionClicked("dislike")}
            >
              <svg
                className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-200 ${
                  reaction === "dislike" ? "scale-110" : ""
                }`}
                fill={reaction === "dislike" ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              <span className="hidden sm:inline">Disagree</span>
              {dislikeCount > 0 && (
                <span className="text-xs opacity-75 bg-red-500/20 rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center">
                  {dislikeCount}
                </span>
              )}
            </button>
          </div>

          {/* Discussion metrics */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
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
              {post.comment_count}{" "}
              {post.comment_count === 1 ? "reply" : "replies"}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
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
              {post.view_count} views
            </span>
          </div>
        </footer>

        <PostReplies post={post} />
      </div>
    </article>
  );
}
